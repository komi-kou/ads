"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Lightbulb, 
  BarChart3, 
  Loader2,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { Alert } from "./ui/Alert";

interface AnalysisPanelProps {
  account: {
    id: string;
    platform: 'meta' | 'google';
    accountName: string;
  };
  data: any;
}

export function AnalysisPanel({ account, data }: AnalysisPanelProps) {
  const [analysisType, setAnalysisType] = useState<'performance' | 'optimization' | 'trends'>('performance');

  const { data: analysisData, isLoading, refetch } = useQuery({
    queryKey: ['analysis', account.id, analysisType],
    queryFn: async () => {
      const response = await fetch('/api/mcp/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: account.platform,
          data,
          analysisType,
        }),
      });
      return response.json();
    },
    enabled: !!data,
  });

  const analysis = analysisData?.analysis;

  return (
    <div className="space-y-6">
      {/* Analysis Type Selector */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[
            { type: 'performance' as const, label: 'パフォーマンス分析', icon: BarChart3 },
            { type: 'optimization' as const, label: '最適化提案', icon: Lightbulb },
            { type: 'trends' as const, label: 'トレンド分析', icon: TrendingUp },
          ].map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => setAnalysisType(type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                analysisType === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          再分析
        </button>
      </div>

      {/* MCP Analysis Notice */}
      <Alert type="info">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <span>gomarble-mcp-serverと連携してClaude AIによる高度な分析を提供します</span>
        </div>
      </Alert>

      {/* Analysis Content */}
      {isLoading ? (
        <div className="card p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">AI分析を実行中...</p>
        </div>
      ) : analysis ? (
        <div className="space-y-6">
          {/* Summary */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">分析サマリー</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {analysis.summary}
            </p>
          </div>

          {/* Insights */}
          {analysis.insights && analysis.insights.length > 0 && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                主要インサイト
              </h3>
              <ul className="space-y-3">
                {analysis.insights.map((insight: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 font-semibold">{index + 1}.</span>
                    <span className="text-sm">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                推奨アクション
              </h3>
              <ul className="space-y-3">
                {analysis.recommendations.map((recommendation: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-600">✓</span>
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Performance Metrics */}
          {analysis.metrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">パフォーマンススコア</p>
                <p className="text-2xl font-bold">
                  {analysis.metrics.performance?.score || 0}/100
                </p>
                <p className={`text-xs mt-1 ${
                  analysis.metrics.performance?.status === 'excellent' ? 'text-green-600' :
                  analysis.metrics.performance?.status === 'good' ? 'text-blue-600' :
                  'text-yellow-600'
                }`}>
                  {analysis.metrics.performance?.status || 'N/A'}
                </p>
              </div>

              <div className="card p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">CPC効率性</p>
                <p className="text-lg font-semibold">
                  {analysis.metrics.efficiency?.cpcEfficiency === 'good' ? '良好' : '改善余地あり'}
                </p>
              </div>

              <div className="card p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">CPA効率性</p>
                <p className="text-lg font-semibold">
                  {analysis.metrics.efficiency?.cpaEfficiency === 'good' ? '良好' : '改善余地あり'}
                </p>
              </div>
            </div>
          )}

          {/* Trends */}
          {analysis.trends && analysis.trends.length > 0 && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">トレンド</h3>
              <div className="space-y-3">
                {analysis.trends.map((trend: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{trend.metric}</span>
                    <div className="flex items-center gap-2">
                      {trend.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm font-semibold ${
                        trend.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {trend.change}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({trend.period})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">分析データがありません</p>
        </div>
      )}
    </div>
  );
}