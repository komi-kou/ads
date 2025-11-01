import { NextRequest, NextResponse } from 'next/server';
import { generateToken, hashPassword, comparePassword } from '@/lib/auth';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // ユーザーを取得
    let user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      // 新規ユーザーの場合は作成
      const hashedPassword = await hashPassword(password);
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
          password: hashedPassword,
        },
      });
    } else {
      // 既存ユーザーの場合はパスワード検証
      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }
    }

    // JWTトークンを生成
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    // Cookieに保存
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}