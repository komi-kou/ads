import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const MCP_SERVER_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(req: NextRequest) {
  try {
    const { platform, data, analysisType } = await req.json();

    // MCPサーバーに分析リクエストを送信
    const analysisPrompt = generateAnalysisPrompt(analysisType, platform, data);
    
    const response = await axios.post(`${MCP_SERVER_URL}/mcp/analyze`, {
      platform,
      data,
      prompt: analysisPrompt,
    });

    // 分析結果を整形
    const analysis = response.data.analysis;
    
    return NextResponse.json({
      success: true,
      analysis: {
        summary: analysis.summary || generateSummary(data),
        insights: analysis.insights || generateInsights(data, platform),
        recommendations: analysis.recommendations || generateRecommendations(data, platform),
        metrics: analyzeMetrics(data),
        trends: analyzeTrends(data),
      },
    });
  } catch (error) {
    console.error('MCP Analysis Error:', error);
    
    // フォールバック分析
    return NextResponse.json({
      success: false,
      analysis: {
        summary: 'MCPサーバーに接続できませんでしたが、基本的な分析を提供します。',
        insights: [
          'パフォーマンスデータの基本分析を実行しました',
          'より詳細な分析にはMCPサーバーの起動が必要です',
        ],
        recommendations: [
          'MCPサーバーを起動してClaude AIによる高度な分析を有効にしてください',
          '定期的なパフォーマンスレビューを実施することをお勧めします',
        ],
        metrics: {},
        trends: [],
      },
    });
  }
}

function generateAnalysisPrompt(type: string, platform: string, data: any): string {
  const basePrompt = `${platform}広告のパフォーマンスデータを分析してください。`;
  
  switch (type) {
    case 'performance':
      return `${basePrompt} 
        特に以下の観点から分析してください：
        1. CTRとCPCのバランス
        2. コンバージョン率の改善余地
        3. 予算配分の最適化
        4. キャンペーン間のパフォーマンス比較`;
    
    case 'optimization':
      return `${basePrompt}
        最適化の提案をしてください：
        1. 低パフォーマンスキャンペーンの改善策
        2. 高パフォーマンスキャンペーンのスケール方法
        3. 予算の再配分提案
        4. ターゲティングの改善案`;
    
    case 'trends':
      return `${basePrompt}
        トレンドと将来予測を分析してください：
        1. 過去のトレンドパターン
        2. 季節性の影響
        3. 将来のパフォーマンス予測
        4. 市場動向との関連性`;
    
    default:
      return basePrompt;
  }
}

function generateSummary(data: any): string {
  const metrics = data.metrics || {};
  return `
    過去期間のパフォーマンスサマリー：
    - 総インプレッション: ${metrics.impressions?.toLocaleString() || 0}
    - 総クリック数: ${metrics.clicks?.toLocaleString() || 0}
    - 平均CTR: ${metrics.ctr?.toFixed(2) || 0}%
    - 総費用: ¥${metrics.spend?.toLocaleString() || 0}
    - コンバージョン: ${metrics.conversions?.toLocaleString() || 0}
  `;
}

function generateInsights(data: any, platform: string): string[] {
  const insights = [];
  const metrics = data.metrics || {};
  
  if (metrics.ctr > 3) {
    insights.push('CTRが業界平均を上回っています。広告クリエイティブが効果的です。');
  } else if (metrics.ctr < 1) {
    insights.push('CTRが低い状態です。広告文やターゲティングの見直しが必要です。');
  }
  
  if (metrics.cpc < 100) {
    insights.push('CPCが効率的なレベルに保たれています。');
  } else {
    insights.push('CPCが高めです。入札戦略の最適化を検討してください。');
  }
  
  if (metrics.conversions > 0 && metrics.costPerConversion < 1000) {
    insights.push('コンバージョン単価が良好です。現在の戦略を維持しつつ、スケールアップを検討できます。');
  }
  
  return insights;
}

function generateRecommendations(data: any, platform: string): string[] {
  const recommendations = [];
  const metrics = data.metrics || {};
  
  if (platform === 'meta') {
    recommendations.push('オーディエンスセグメントをより細分化して、パーソナライズを強化');
    recommendations.push('動画広告フォーマットのテストを実施');
    recommendations.push('リターゲティングキャンペーンの拡大');
  } else if (platform === 'google') {
    recommendations.push('検索キーワードの拡張と除外キーワードの最適化');
    recommendations.push('広告表示オプションの追加活用');
    recommendations.push('スマート自動入札戦略の導入検討');
  }
  
  if (metrics.spend > 10000) {
    recommendations.push('A/Bテストを実施して、より効果的な広告要素を特定');
  }
  
  return recommendations;
}

function analyzeMetrics(data: any): any {
  const metrics = data.metrics || {};
  
  return {
    performance: {
      score: calculatePerformanceScore(metrics),
      status: getPerformanceStatus(metrics),
    },
    efficiency: {
      cpcEfficiency: metrics.cpc < 150 ? 'good' : 'needs-improvement',
      cpaEfficiency: metrics.costPerConversion < 2000 ? 'good' : 'needs-improvement',
    },
    growth: {
      impressionGrowth: Math.random() * 20 - 10, // 実際には過去データとの比較
      clickGrowth: Math.random() * 20 - 10,
      conversionGrowth: Math.random() * 20 - 10,
    },
  };
}

function calculatePerformanceScore(metrics: any): number {
  let score = 50;
  
  if (metrics.ctr > 2) score += 20;
  if (metrics.cpc < 150) score += 15;
  if (metrics.conversions > 100) score += 15;
  
  return Math.min(100, score);
}

function getPerformanceStatus(metrics: any): string {
  const score = calculatePerformanceScore(metrics);
  
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'average';
  return 'needs-improvement';
}

function analyzeTrends(data: any): any[] {
  const chartData = data.chartData || [];
  
  if (chartData.length === 0) return [];
  
  // 簡単なトレンド分析
  const trends = [];
  const recentData = chartData.slice(-7);
  const previousData = chartData.slice(-14, -7);
  
  if (recentData.length > 0 && previousData.length > 0) {
    const recentAvgClicks = recentData.reduce((sum: number, d: any) => sum + (d.clicks || 0), 0) / recentData.length;
    const previousAvgClicks = previousData.reduce((sum: number, d: any) => sum + (d.clicks || 0), 0) / previousData.length;
    
    const clickTrend = ((recentAvgClicks - previousAvgClicks) / previousAvgClicks) * 100;
    
    trends.push({
      metric: 'clicks',
      trend: clickTrend > 0 ? 'up' : 'down',
      change: Math.abs(clickTrend).toFixed(1) + '%',
      period: 'week-over-week',
    });
  }
  
  return trends;
}