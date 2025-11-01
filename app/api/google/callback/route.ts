import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your_client_id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'your_client_secret';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/google/callback';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/dashboard?error=google_auth_failed', req.url));
  }

  if (!code) {
    return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 });
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Redirect back to dashboard with tokens
    const redirectUrl = new URL('/dashboard', req.url);
    redirectUrl.searchParams.append('google_access_token', access_token);
    redirectUrl.searchParams.append('google_refresh_token', refresh_token);
    redirectUrl.searchParams.append('platform', 'google');
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(new URL('/dashboard?error=token_exchange_failed', req.url));
  }
}