import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const META_APP_ID = process.env.META_APP_ID || 'your_app_id';
const META_APP_SECRET = process.env.META_APP_SECRET || 'your_app_secret';
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000/api/meta/callback';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/dashboard?error=meta_auth_failed', req.url));
  }

  if (!code) {
    return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 });
  }

  try {
    // Exchange code for access token
    const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
    tokenUrl.searchParams.append('client_id', META_APP_ID);
    tokenUrl.searchParams.append('redirect_uri', REDIRECT_URI);
    tokenUrl.searchParams.append('client_secret', META_APP_SECRET);
    tokenUrl.searchParams.append('code', code);

    const tokenResponse = await axios.get(tokenUrl.toString());
    const { access_token, expires_in } = tokenResponse.data;

    // Get long-lived token
    const longLivedTokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
    longLivedTokenUrl.searchParams.append('grant_type', 'fb_exchange_token');
    longLivedTokenUrl.searchParams.append('client_id', META_APP_ID);
    longLivedTokenUrl.searchParams.append('client_secret', META_APP_SECRET);
    longLivedTokenUrl.searchParams.append('fb_exchange_token', access_token);

    const longLivedResponse = await axios.get(longLivedTokenUrl.toString());
    const longLivedToken = longLivedResponse.data.access_token;

    // Redirect back to dashboard with token
    const redirectUrl = new URL('/dashboard', req.url);
    redirectUrl.searchParams.append('meta_token', longLivedToken);
    redirectUrl.searchParams.append('platform', 'meta');
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Meta OAuth error:', error);
    return NextResponse.redirect(new URL('/dashboard?error=token_exchange_failed', req.url));
  }
}