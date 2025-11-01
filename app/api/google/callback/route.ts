import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { GoogleAdsClient } from '@/lib/google-ads';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your_client_id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'your_client_secret';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/google/callback';
const GOOGLE_DEVELOPER_TOKEN = process.env.GOOGLE_DEVELOPER_TOKEN || '';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state'); // customerId?????????

  if (error) {
    return NextResponse.redirect(new URL('/dashboard?error=google_auth_failed', req.url));
  }

  if (!code) {
    return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 });
  }

  try {
    // ?????????
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/dashboard?error=not_authenticated', req.url));
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.redirect(new URL('/dashboard?error=invalid_token', req.url));
    }

    // Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Google Ads API???????????
    // ??????????????customerId???????API?????
    let customerId = state || ''; // state?customerId?????????
    
    if (!customerId) {
      // Google Ads API????ID???
      // ??: Google Ads API???????????????customerId???
      // ???????????????????
      try {
        // ?????????????customerId?????????????
        // ????OAuth???????????????
        customerId = '1234567890'; // ???????? - ?????????????API????
      } catch (err) {
        console.error('Failed to get customer ID:', err);
      }
    }

    if (customerId && customerId !== '') {
      try {
        const client = new GoogleAdsClient({
          accessToken: access_token,
          refreshToken: refresh_token || '',
          clientId: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          developerToken: GOOGLE_DEVELOPER_TOKEN,
          customerId: customerId,
        });

        const accounts = await client.getAccounts();
        
        if (accounts.length > 0) {
          const account = accounts[0];
          
          // ???????????????
          const expiresAt = expires_in ? new Date(Date.now() + expires_in * 1000) : null;
          
          await prisma.account.upsert({
            where: {
              userId_platform_accountId: {
                userId: user.id,
                platform: 'google',
                accountId: account.id.toString(),
              },
            },
            update: {
              accountName: account.descriptiveName,
              accessToken: access_token,
              refreshToken: refresh_token,
              expiresAt,
              metadata: {
                developerToken: GOOGLE_DEVELOPER_TOKEN,
                currencyCode: account.currencyCode,
                timeZone: account.timeZone,
              },
              isActive: true,
              lastSyncedAt: new Date(),
            },
            create: {
              userId: user.id,
              platform: 'google',
              accountId: account.id.toString(),
              accountName: account.descriptiveName,
              accessToken: access_token,
              refreshToken: refresh_token,
              expiresAt,
              metadata: {
                developerToken: GOOGLE_DEVELOPER_TOKEN,
                currencyCode: account.currencyCode,
                timeZone: account.timeZone,
              },
              isActive: true,
              lastSyncedAt: new Date(),
            },
          });
        }
      } catch (apiError) {
        console.error('Failed to fetch Google Ads accounts:', apiError);
        // API??????????????
      }
    }

    // Redirect back to dashboard
    const redirectUrl = new URL('/dashboard', req.url);
    redirectUrl.searchParams.append('google_connected', 'true');
    redirectUrl.searchParams.append('platform', 'google');
    
    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    console.error('Google OAuth error:', error);
    const errorMessage = error.response?.data?.error || error.message || 'token_exchange_failed';
    return NextResponse.redirect(new URL(`/dashboard?error=${errorMessage}`, req.url));
  }
}