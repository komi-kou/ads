import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your_client_id';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/google/callback';

export async function GET(req: NextRequest) {
  // デモモード: 実際のAPIキーが設定されていない場合
  if (GOOGLE_CLIENT_ID === 'your_client_id' || GOOGLE_CLIENT_ID === 'your_google_client_id') {
    // デモアカウントを追加してダッシュボードに戻る
    const demoUrl = new URL('/dashboard', req.url);
    demoUrl.searchParams.append('demo', 'true');
    demoUrl.searchParams.append('platform', 'google');
    demoUrl.searchParams.append('message', 'Demo mode: Real API keys required for actual connection');
    return NextResponse.redirect(demoUrl);
  }

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  
  authUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID);
  authUrl.searchParams.append('redirect_uri', GOOGLE_REDIRECT_URI);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', 'https://www.googleapis.com/auth/adwords');
  authUrl.searchParams.append('access_type', 'offline');
  authUrl.searchParams.append('prompt', 'consent');
  authUrl.searchParams.append('state', Math.random().toString(36).substring(7));

  // 直接リダイレクト
  return NextResponse.redirect(authUrl.toString());
}