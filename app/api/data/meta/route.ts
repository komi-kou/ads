import { NextRequest, NextResponse } from 'next/server';
import { MetaAdsClient } from '@/lib/meta-ads';

export async function POST(req: NextRequest) {
  try {
    const { accountId, action, dateRange } = await req.json();

    // トークンを取得（実際にはセキュアなストレージから）
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                  process.env.META_ACCESS_TOKEN || '';

    if (!token || token === '') {
      // デモモード: サンプルデータを返す
      return NextResponse.json({
        demo: true,
        data: {
          insights: [
            {
              impressions: "125000",
              clicks: "3500",
              spend: "4500.50",
              ctr: "2.8",
              cpc: "1.29",
              conversions: "280",
              cost_per_conversion: "16.07",
              date_start: dateRange?.start || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              date_stop: dateRange?.end || new Date().toISOString().split('T')[0],
            }
          ],
          campaigns: [
            {
              id: "demo_campaign_1",
              name: "ブランド認知キャンペーン",
              status: "ACTIVE",
              objective: "BRAND_AWARENESS",
              daily_budget: "5000",
              created_time: "2024-01-01T00:00:00Z",
              updated_time: new Date().toISOString(),
            },
            {
              id: "demo_campaign_2",
              name: "リターゲティングキャンペーン",
              status: "ACTIVE",
              objective: "CONVERSIONS",
              daily_budget: "3000",
              created_time: "2024-01-15T00:00:00Z",
              updated_time: new Date().toISOString(),
            }
          ]
        }
      });
    }

    const client = new MetaAdsClient(token);

    switch (action) {
      case 'getInsights':
        const insights = await client.getAccountInsights(
          accountId,
          dateRange.start,
          dateRange.end
        );
        return NextResponse.json(insights);

      case 'getCampaigns':
        const campaigns = await client.getCampaigns(accountId);
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
  } catch (error) {
    console.error('Meta API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Meta data', details: error },
      { status: 500 }
    );
  }
}