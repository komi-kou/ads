import { NextRequest, NextResponse } from 'next/server';
import { GoogleAdsClient } from '@/lib/google-ads';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isTokenExpired } from '@/lib/auth';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your_client_id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'your_client_secret';

export async function POST(req: NextRequest) {
  try {
    // 認証確認
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

    const { accountId, action, dateRange } = await req.json();

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // データベースからアカウント情報を取得
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: user.id,
        platform: 'google',
        isActive: true,
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found or inactive' },
        { status: 404 }
      );
    }

    if (!account.accessToken) {
      return NextResponse.json(
        { error: 'Access token not found' },
        { status: 400 }
      );
    }

    // トークンの有効期限を確認（必要に応じてリフレッシュ）
    const accessToken = account.accessToken;
    const refreshToken = account.refreshToken || '';
    const metadata = account.metadata as any || {};
    const developerToken = metadata.developerToken || process.env.GOOGLE_DEVELOPER_TOKEN || '';

    const client = new GoogleAdsClient({
      accessToken,
      refreshToken,
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      developerToken,
      customerId: account.accountId,
    });

    switch (action) {
      case 'getInsights':
        if (!dateRange || !dateRange.start || !dateRange.end) {
          return NextResponse.json(
            { error: 'Date range is required' },
            { status: 400 }
          );
        }
        const insights = await client.getInsights(
          dateRange.start,
          dateRange.end,
          'account'
        );
        return NextResponse.json({ data: insights });

      case 'getCampaigns':
        const campaigns = await client.getCampaigns();
        return NextResponse.json({ data: campaigns });

      case 'getAdGroups':
        const campaignId = req.nextUrl.searchParams.get('campaignId');
        if (!campaignId) {
          return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 });
        }
        const adGroups = await client.getAdGroups(campaignId);
        return NextResponse.json({ data: adGroups });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Google Ads API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Google data', details: error.message },
      { status: 500 }
    );
  }
}