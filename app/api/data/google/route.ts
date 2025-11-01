import { NextRequest, NextResponse } from 'next/server';
import { GoogleAdsClient } from '@/lib/google-ads';

export async function POST(req: NextRequest) {
  try {
    const { accountId, action, dateRange } = await req.json();

    // 認証情報を取得（実際にはセキュアなストレージから）
    const accessToken = req.headers.get('authorization')?.replace('Bearer ', '') || 
                       process.env.GOOGLE_ACCESS_TOKEN || '';
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN || '';
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    const developerToken = process.env.GOOGLE_DEVELOPER_TOKEN || '';

    if (!accessToken || accessToken === '' || clientId === 'your_google_client_id') {
      // デモモード: サンプルデータを返す
      return NextResponse.json({
        demo: true,
        data: {
          insights: [
            {
              metrics: {
                impressions: "95000",
                clicks: "2800",
                costMicros: "3200000000",
                averageCpc: "1.14",
                ctr: "2.95",
                conversions: "220",
                costPerConversion: "14.55",
              },
              segments: {
                date: dateRange?.start || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              }
            }
          ],
          campaigns: [
            {
              id: "demo_google_campaign_1",
              name: "検索キャンペーン - ブランド",
              status: "ENABLED",
              advertisingChannelType: "SEARCH",
              biddingStrategyType: "TARGET_CPA",
              budget: {
                id: "budget_1",
                amountMicros: "5000000000",
              },
              startDate: "2024-01-01",
            },
            {
              id: "demo_google_campaign_2",
              name: "ショッピングキャンペーン",
              status: "ENABLED",
              advertisingChannelType: "SHOPPING",
              biddingStrategyType: "MAXIMIZE_CONVERSIONS",
              budget: {
                id: "budget_2",
                amountMicros: "3000000000",
              },
              startDate: "2024-02-01",
            }
          ]
        }
      });
    }

    const client = new GoogleAdsClient({
      accessToken,
      refreshToken,
      clientId,
      clientSecret,
      developerToken,
      customerId: accountId,
    });

    switch (action) {
      case 'getInsights':
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
  } catch (error) {
    console.error('Google Ads API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Google data', details: error },
      { status: 500 }
    );
  }
}