import { NextRequest, NextResponse } from 'next/server';

const META_APP_ID = process.env.META_APP_ID || 'your_app_id';
const META_APP_SECRET = process.env.META_APP_SECRET || 'your_app_secret';
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000/api/meta/callback';

export async function GET(req: NextRequest) {
  // デモモード: 実際のAPIキーが設定されていない場合
  if (META_APP_ID === 'your_app_id' || META_APP_ID === 'your_facebook_app_id') {
    // デモアカウントを追加してダッシュボードに戻る
    const demoUrl = new URL('/dashboard', req.url);
    demoUrl.searchParams.append('demo', 'true');
    demoUrl.searchParams.append('platform', 'meta');
    demoUrl.searchParams.append('message', 'Demo mode: Real API keys required for actual connection');
    return NextResponse.redirect(demoUrl);
  }

  const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
  
  authUrl.searchParams.append('client_id', META_APP_ID);
  authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.append('scope', 'ads_management,ads_read,business_management,read_insights');
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('state', Math.random().toString(36).substring(7));

  // 直接リダイレクト
  return NextResponse.redirect(authUrl.toString());
}