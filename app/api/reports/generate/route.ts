import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { GoogleAdsClient } from '@/lib/google-ads';
import { MetaAdsClient } from '@/lib/meta-ads';
import { ChatworkClient } from '@/lib/chatwork';
import axios from 'axios';

const MCP_SERVER_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

// レポート生成
export async function POST(req: NextRequest) {
  try {
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

    const { accountId, dateRange, reportType = 'weekly', sendToChatwork = false, chatworkRoomId, chatworkApiToken } = await req.json();

    if (!accountId || !dateRange) {
      return NextResponse.json(
        { error: 'Account ID and date range are required' },
        { status: 400 }
      );
    }

    // アカウント情報を取得
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: user.id,
        isActive: true,
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // データを取得
    let insights: any[] = [];
    let campaigns: any[] = [];
    let metrics: any = {};

    if (account.platform === 'google') {
      const metadata = account.metadata as any || {};
      const developerToken = metadata.developerToken || process.env.GOOGLE_DEVELOPER_TOKEN || '';

      const client = new GoogleAdsClient({
        accessToken: account.accessToken || '',
        refreshToken: account.refreshToken || '',
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        developerToken,
        customerId: account.accountId,
      });

      insights = await client.getInsights(dateRange.start, dateRange.end, 'account');
      campaigns = await client.getCampaigns();

      // メトリクスを集計
      if (insights.length > 0) {
        metrics = insights.reduce((acc, insight) => {
          acc.impressions = (parseInt(acc.impressions || 0) + parseInt(insight.metrics.impressions || 0)).toString();
          acc.clicks = (parseInt(acc.clicks || 0) + parseInt(insight.metrics.clicks || 0)).toString();
          acc.costMicros = (parseInt(acc.costMicros || 0) + parseInt(insight.metrics.costMicros || 0)).toString();
          acc.conversions = (parseInt(acc.conversions || 0) + parseInt(insight.metrics.conversions || 0)).toString();
          return acc;
        }, { impressions: '0', clicks: '0', costMicros: '0', conversions: '0' });

        const totalClicks = parseInt(metrics.clicks);
        const totalImpressions = parseInt(metrics.impressions);
        const totalCostMicros = parseInt(metrics.costMicros);
        const totalConversions = parseInt(metrics.conversions);

        metrics.ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0';
        metrics.averageCpc = totalClicks > 0 ? (totalCostMicros / totalClicks / 1000000).toFixed(2) : '0';
        metrics.costPerConversion = totalConversions > 0 ? (totalCostMicros / totalConversions / 1000000).toFixed(2) : '0';
      }
    } else if (account.platform === 'meta') {
      const client = new MetaAdsClient(account.accessToken || '');
      const insightsResponse = await client.getAccountInsights(
        account.accountId,
        dateRange.start,
        dateRange.end
      );
      insights = insightsResponse.data || [];
      const campaignsResponse = await client.getCampaigns(account.accountId);
      campaigns = campaignsResponse.data || [];

      // メトリクスを集計
      if (insights.length > 0) {
        metrics = insights.reduce((acc, insight) => {
          acc.impressions = (parseInt(acc.impressions || 0) + parseInt(insight.impressions || 0)).toString();
          acc.clicks = (parseInt(acc.clicks || 0) + parseInt(insight.clicks || 0)).toString();
          acc.spend = (parseFloat(acc.spend || 0) + parseFloat(insight.spend || 0)).toFixed(2);
          acc.conversions = (parseInt(acc.conversions || 0) + parseInt(insight.conversions || 0)).toString();
          return acc;
        }, { impressions: '0', clicks: '0', spend: '0', conversions: '0' });

        const totalClicks = parseInt(metrics.clicks);
        const totalImpressions = parseInt(metrics.impressions);
        const totalSpend = parseFloat(metrics.spend);
        const totalConversions = parseInt(metrics.conversions);

        metrics.ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0';
        metrics.cpc = totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : '0';
        metrics.cost_per_conversion = totalConversions > 0 ? (totalSpend / totalConversions).toFixed(2) : '0';
      }
    }

    // gomarble-mcp-serverを使用して分析
    let analysisResult: any = null;
    try {
      const analysisPrompt = generateAnalysisPrompt(reportType, account.platform);
      const mcpResponse = await axios.post(`${MCP_SERVER_URL}/mcp/analyze`, {
        platform: account.platform,
        data: {
          metrics,
          insights,
          campaigns,
          timeRange: dateRange,
        },
        prompt: analysisPrompt,
      });

      analysisResult = mcpResponse.data.analysis;
    } catch (mcpError) {
      console.error('MCP Analysis Error:', mcpError);
      // フォールバック分析
      analysisResult = {
        summary: generateSummary(metrics, account.platform),
        insights: generateInsights(metrics, account.platform),
        recommendations: generateRecommendations(metrics, account.platform),
      };
    }

    // レポートをデータベースに保存
    const report = await prisma.report.create({
      data: {
        userId: user.id,
        accountId: account.id,
        platform: account.platform,
        reportType,
        dateRange,
        metrics,
        insights: analysisResult.insights || [],
        recommendations: analysisResult.recommendations || [],
        summary: analysisResult.summary || '',
        status: 'completed',
      },
    });

    // チャットワークに送信
    if (sendToChatwork && chatworkRoomId && chatworkApiToken) {
      try {
        const chatworkClient = new ChatworkClient(chatworkApiToken);
        await chatworkClient.sendReport(chatworkRoomId, {
          platform: account.platform,
          accountName: account.accountName,
          dateRange,
          summary: analysisResult.summary || '',
          metrics,
          insights: analysisResult.insights || [],
          recommendations: analysisResult.recommendations || [],
        });

        // レポートを更新
        await prisma.report.update({
          where: { id: report.id },
          data: {
            sentToChatwork: true,
            chatworkRoomId,
          },
        });
      } catch (chatworkError) {
        console.error('Chatwork send error:', chatworkError);
        // エラーが発生してもレポートは保存されているので続行
      }
    }

    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        platform: account.platform,
        accountName: account.accountName,
        dateRange,
        metrics,
        summary: analysisResult.summary,
        insights: analysisResult.insights || [],
        recommendations: analysisResult.recommendations || [],
        sentToChatwork: report.sentToChatwork,
      },
    });
  } catch (error: any) {
    console.error('Generate report error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', details: error.message },
      { status: 500 }
    );
  }
}

function generateAnalysisPrompt(type: string, platform: string): string {
  const platformName = platform === 'meta' ? 'Meta' : 'Google';
  const basePrompt = `${platformName}広告のパフォーマンスデータを分析してください。`;
  
  switch (type) {
    case 'weekly':
      return `${basePrompt} 
        特に以下の観点から分析してください：
        1. 週次パフォーマンスの傾向
        2. CTRとCPCのバランス
        3. コンバージョン率の改善余地
        4. 予算配分の最適化
        5. キャンペーン間のパフォーマンス比較`;
    
    case 'monthly':
      return `${basePrompt}
        月次分析として以下を提供してください：
        1. 月間パフォーマンスの総括
        2. 週次トレンドの分析
        3. 目標達成状況
        4. 次月への改善提案`;
    
    default:
      return basePrompt;
  }
}

function generateSummary(metrics: any, platform: string): string {
  if (platform === 'meta') {
    return `
過去期間のパフォーマンスサマリー：
- 総インプレッション: ${metrics.impressions?.toLocaleString() || 0}
- 総クリック数: ${metrics.clicks?.toLocaleString() || 0}
- 平均CTR: ${metrics.ctr || 0}%
- 総費用: ¥${parseFloat(metrics.spend || 0).toLocaleString()}
- コンバージョン: ${metrics.conversions?.toLocaleString() || 0}
`;
  } else {
    return `
過去期間のパフォーマンスサマリー：
- 総インプレッション: ${metrics.impressions?.toLocaleString() || 0}
- 総クリック数: ${metrics.clicks?.toLocaleString() || 0}
- 平均CTR: ${metrics.ctr || 0}%
- 総費用: ¥${(parseInt(metrics.costMicros || 0) / 1000000).toLocaleString()}
- コンバージョン: ${metrics.conversions?.toLocaleString() || 0}
`;
  }
}

function generateInsights(metrics: any, platform: string): string[] {
  const insights: string[] = [];
  const ctr = parseFloat(metrics.ctr || 0);
  const cpc = parseFloat(platform === 'meta' ? metrics.cpc || 0 : metrics.averageCpc || 0);
  const conversions = parseInt(metrics.conversions || 0);

  if (ctr > 3) {
    insights.push('CTRが業界平均を上回っています。広告クリエイティブが効果的です。');
  } else if (ctr < 1) {
    insights.push('CTRが低い状態です。広告文やターゲティングの見直しが必要です。');
  }

  if (cpc < 100) {
    insights.push('CPCが効率的なレベルに保たれています。');
  } else if (cpc > 150) {
    insights.push('CPCが高めです。入札戦略の最適化を検討してください。');
  }

  if (conversions > 0) {
    const costPerConversion = parseFloat(
      platform === 'meta' ? metrics.cost_per_conversion || 0 : metrics.costPerConversion || 0
    );
    if (costPerConversion < 1000) {
      insights.push('コンバージョン単価が良好です。現在の戦略を維持しつつ、スケールアップを検討できます。');
    } else if (costPerConversion > 2000) {
      insights.push('コンバージョン単価が高めです。ターゲティングやランディングページの最適化を検討してください。');
    }
  }

  return insights;
}

function generateRecommendations(metrics: any, platform: string): string[] {
  const recommendations: string[] = [];

  if (platform === 'meta') {
    recommendations.push('オーディエンスセグメントをより細分化して、パーソナライズを強化');
    recommendations.push('動画広告フォーマットのテストを実施');
    recommendations.push('リターゲティングキャンペーンの拡大');
  } else {
    recommendations.push('検索キーワードの拡張と除外キーワードの最適化');
    recommendations.push('広告表示オプションの追加活用');
    recommendations.push('スマート自動入札戦略の導入検討');
  }

  const spend = parseFloat(platform === 'meta' ? metrics.spend || 0 : (parseInt(metrics.costMicros || 0) / 1000000).toFixed(2));
  if (spend > 10000) {
    recommendations.push('A/Bテストを実施して、より効果的な広告要素を特定');
  }

  return recommendations;
}