import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

// 定期レポート設定の作成・更新
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

    const { accountId, frequency, dayOfWeek, dayOfMonth, chatworkRoomId, chatworkApiToken } = await req.json();

    if (!accountId || !frequency) {
      return NextResponse.json(
        { error: 'Account ID and frequency are required' },
        { status: 400 }
      );
    }

    // アカウント確認
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: user.id,
        isActive: true,
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // 次の実行日を計算
    const nextRunAt = calculateNextRunDate(frequency, dayOfWeek, dayOfMonth);

    // 既存の設定を確認
    const existing = await prisma.scheduledReport.findFirst({
      where: {
        userId: user.id,
        accountId: account.id,
      },
    });

    let scheduledReport;
    if (existing) {
      scheduledReport = await prisma.scheduledReport.update({
        where: { id: existing.id },
        data: {
          frequency,
          dayOfWeek: frequency === 'weekly' ? dayOfWeek : null,
          dayOfMonth: frequency === 'monthly' ? dayOfMonth : null,
          chatworkRoomId: chatworkRoomId || null,
          chatworkApiToken: chatworkApiToken || null,
          isActive: true,
          nextRunAt,
        },
      });
    } else {
      scheduledReport = await prisma.scheduledReport.create({
        data: {
          userId: user.id,
          accountId: account.id,
          platform: account.platform,
          frequency,
          dayOfWeek: frequency === 'weekly' ? dayOfWeek : null,
          dayOfMonth: frequency === 'monthly' ? dayOfMonth : null,
          chatworkRoomId: chatworkRoomId || null,
          chatworkApiToken: chatworkApiToken || null,
          isActive: true,
          nextRunAt,
        },
      });
    }

    return NextResponse.json({ scheduledReport });
  } catch (error: any) {
    console.error('Create scheduled report error:', error);
    return NextResponse.json(
      { error: 'Failed to create scheduled report', details: error.message },
      { status: 500 }
    );
  }
}

// 定期レポート設定の取得
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

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');

    const where: any = {
      userId: user.id,
      isActive: true,
    };

    if (accountId) {
      where.accountId = accountId;
    }

    const scheduledReports = await prisma.scheduledReport.findMany({
      where,
      include: {
        account: {
          select: {
            id: true,
            accountName: true,
            platform: true,
          },
        },
      },
      orderBy: {
        nextRunAt: 'asc',
      },
    });

    return NextResponse.json({ scheduledReports });
  } catch (error: any) {
    console.error('Get scheduled reports error:', error);
    return NextResponse.json(
      { error: 'Failed to get scheduled reports', details: error.message },
      { status: 500 }
    );
  }
}

// 定期レポート設定の削除
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
        { error: 'Scheduled report ID is required' },
        { status: 400 }
      );
    }

    const scheduledReport = await prisma.scheduledReport.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!scheduledReport) {
      return NextResponse.json(
        { error: 'Scheduled report not found' },
        { status: 404 }
      );
    }

    await prisma.scheduledReport.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete scheduled report error:', error);
    return NextResponse.json(
      { error: 'Failed to delete scheduled report', details: error.message },
      { status: 500 }
    );
  }
}

function calculateNextRunDate(frequency: string, dayOfWeek?: number, dayOfMonth?: number): Date {
  const now = new Date();
  const nextRun = new Date(now);

  if (frequency === 'weekly') {
    // 週次: 指定された曜日に実行（0=日曜日, 6=土曜日）
    const currentDay = now.getDay();
    const targetDay = dayOfWeek !== undefined ? dayOfWeek : 1; // デフォルトは月曜日

    let daysUntilNext = (targetDay - currentDay + 7) % 7;
    if (daysUntilNext === 0) {
      daysUntilNext = 7; // 今週の実行日が過ぎている場合は来週
    }

    nextRun.setDate(now.getDate() + daysUntilNext);
    nextRun.setHours(9, 0, 0, 0); // 9時に実行
  } else if (frequency === 'monthly') {
    // 月次: 指定された日に実行
    const targetDay = dayOfMonth !== undefined ? dayOfMonth : 1;
    nextRun.setMonth(now.getMonth() + 1);
    nextRun.setDate(targetDay);
    nextRun.setHours(9, 0, 0, 0);
  }

  return nextRun;
}