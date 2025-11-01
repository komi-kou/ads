import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

// アカウント一覧取得
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value || 
                 req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const user = verifyToken(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const accounts = await prisma.account.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Get accounts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// アカウント追加
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value || 
                 req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const user = verifyToken(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { platform, accountId, accountName, accessToken, refreshToken, expiresAt, metadata } = await req.json();

    if (!platform || !accountId || !accountName) {
      return NextResponse.json(
        { error: 'Platform, accountId, and accountName are required' },
        { status: 400 }
      );
    }

    // 既存のアカウントを確認
    const existingAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
        platform,
        accountId,
      },
    });

    if (existingAccount) {
      // 既存のアカウントを更新
      const updatedAccount = await prisma.account.update({
        where: { id: existingAccount.id },
        data: {
          accountName,
          accessToken,
          refreshToken,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          metadata: metadata || {},
          isActive: true,
          lastSyncedAt: new Date(),
        },
      });

      return NextResponse.json({ account: updatedAccount });
    }

    // 新規アカウントを作成
    const account = await prisma.account.create({
      data: {
        userId: user.id,
        platform,
        accountId,
        accountName,
        accessToken,
        refreshToken,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        metadata: metadata || {},
        isActive: true,
        lastSyncedAt: new Date(),
      },
    });

    return NextResponse.json({ account });
  } catch (error) {
    console.error('Create account error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// アカウント更新
export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value || 
                 req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const user = verifyToken(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { id, accountName, isActive, accessToken, refreshToken, expiresAt } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // ユーザーが所有するアカウントか確認
    const account = await prisma.account.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    const updatedAccount = await prisma.account.update({
      where: { id },
      data: {
        ...(accountName && { accountName }),
        ...(isActive !== undefined && { isActive }),
        ...(accessToken && { accessToken }),
        ...(refreshToken && { refreshToken }),
        ...(expiresAt && { expiresAt: new Date(expiresAt) }),
      },
    });

    return NextResponse.json({ account: updatedAccount });
  } catch (error) {
    console.error('Update account error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// アカウント削除
export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value || 
                 req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const user = verifyToken(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // ユーザーが所有するアカウントか確認
    const account = await prisma.account.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    await prisma.account.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}