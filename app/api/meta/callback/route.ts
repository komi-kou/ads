import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { MetaAdsClient } from '@/lib/meta-ads';

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
    const longLivedExpiresIn = longLivedResponse.data.expires_in || 5184000; // 60 days default

    // Meta Ads API???????????
    try {
      const client = new MetaAdsClient(longLivedToken);
      const accountsResponse = await client.getAdAccounts();
      
      if (accountsResponse.data && accountsResponse.data.length > 0) {
        // ????????????????
        for (const account of accountsResponse.data) {
          const expiresAt = longLivedExpiresIn ? new Date(Date.now() + longLivedExpiresIn * 1000) : null;
          
          await prisma.account.upsert({
            where: {
              userId_platform_accountId: {
                userId: user.id,
                platform: 'meta',
                accountId: account.id.toString(),
              },
            },
            update: {
              accountName: account.name,
              accessToken: longLivedToken,
              expiresAt,
              metadata: {
                currency: account.currency,
                timezone: account.timezone_name,
                accountStatus: account.account_status,
              },
              isActive: account.account_status === 1,
              lastSyncedAt: new Date(),
            },
            create: {
              userId: user.id,
              platform: 'meta',
              accountId: account.id.toString(),
              accountName: account.name,
              accessToken: longLivedToken,
              expiresAt,
              metadata: {
                currency: account.currency,
                timezone: account.timezone_name,
                accountStatus: account.account_status,
              },
              isActive: account.account_status === 1,
              lastSyncedAt: new Date(),
            },
          });
        }
      }
    } catch (apiError: any) {
      console.error('Failed to fetch Meta Ads accounts:', apiError);
      // API??????????????
    }

    // Redirect back to dashboard
    const redirectUrl = new URL('/dashboard', req.url);
    redirectUrl.searchParams.append('meta_connected', 'true');
    redirectUrl.searchParams.append('platform', 'meta');
    
    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    console.error('Meta OAuth error:', error);
    const errorMessage = error.response?.data?.error?.message || error.message || 'token_exchange_failed';
    return NextResponse.redirect(new URL(`/dashboard?error=${errorMessage}`, req.url));
  }
}