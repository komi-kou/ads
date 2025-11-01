import { NextRequest, NextResponse } from 'next/server';
import { MetaAdsClient } from '@/lib/meta-ads';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

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
        platform: 'meta',
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

    const client = new MetaAdsClient(account.accessToken);

    switch (action) {
      case 'getInsights':
        if (!dateRange || !dateRange.start || !dateRange.end) {
          return NextResponse.json(
            { error: 'Date range is required' },
            { status: 400 }
          );
        }
        const insights = await client.getAccountInsights(
          account.accountId,
          dateRange.start,
          dateRange.end
        );
        return NextResponse.json(insights);

      case 'getCampaigns':
        const campaigns = await client.getCampaigns(account.accountId);
        return NextResponse.json(campaigns);

      case 'getAdSets':
        const campaignId = req.nextUrl.searchParams.get('campaignId');
        if (!campaignId) {
          return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 });
        }
        const adsets = await client.getAdSets(campaignId);
        return NextResponse.json(adsets);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Meta API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Meta data', details: error.message },
      { status: 500 }
    );
  }
}