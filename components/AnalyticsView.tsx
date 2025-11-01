"use client";

import { useState, useEffect } from "react";
import { AdAccount } from "@/lib/store";
import { MetricsCards } from "./MetricsCards";
import { PerformanceChart } from "./PerformanceChart";
import { CampaignTable } from "./CampaignTable";
import { AnalysisPanel } from "./AnalysisPanel";
import { Calendar, RefreshCw, Download, Brain, Facebook, Globe } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface AnalyticsViewProps {
  account: AdAccount;
}

export function AnalyticsView({ account }: AnalyticsViewProps) {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  const [selectedMetric, setSelectedMetric] = useState<"impressions" | "clicks" | "spend" | "conversions">("impressions");
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Fetch analytics data
  const { data: analyticsData, isLoading, refetch } = useQuery({
    queryKey: ["analytics", account.id, dateRange],
    queryFn: async () => {
      try {
        // 実際のAPIエンドポイントを呼び出す
        const endpoint = account.platform === 'meta' 
          ? '/api/data/meta' 
          : '/api/data/google';
        
        const token = localStorage.getItem('token');
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            accountId: account.accountId,
            action: 'getInsights',
            dateRange: {
              start: dateRange.start,
              end: dateRange.end,
            },
          }),
        });

        const insightsData = await response.json();

        // キャンペーンデータも取得
        const campaignsResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            accountId: account.accountId,
            action: 'getCampaigns',
          }),
        });

        const campaignsData = await campaignsResponse.json();

        // データを整形
        if (insightsData.demo || campaignsData.demo) {
          // デモデータの場合
          const insights = insightsData.data?.insights?.[0] || {};
          return {
            metrics: {
              impressions: parseInt(insights.impressions || '0'),
              clicks: parseInt(insights.clicks || '0'),
              spend: parseFloat(insights.spend || insights.costMicros ? (parseInt(insights.costMicros) / 1000000) : '0'),
              ctr: parseFloat(insights.ctr || '0'),
              cpc: parseFloat(insights.cpc || insights.averageCpc || '0'),
              conversions: parseInt(insights.conversions || '0'),
              costPerConversion: parseFloat(insights.cost_per_conversion || insights.costPerConversion || '0'),
            },
            chartData: generateChartData(dateRange.start, dateRange.end),
            campaigns: (campaignsData.data?.campaigns || []).map((c: any) => ({
              id: c.id,
              name: c.name,
              status: c.status?.toLowerCase() || 'active',
              impressions: Math.floor(Math.random() * 50000) + 10000,
              clicks: Math.floor(Math.random() * 1500) + 500,
              spend: Math.random() * 2000 + 500,
              ctr: Math.random() * 2 + 2,
              conversions: Math.floor(Math.random() * 150) + 50,
            })),
          };
        }

        // 実データの場合の処理
        return {
          metrics: extractMetrics(insightsData),
          chartData: extractChartData(insightsData),
          campaigns: extractCampaigns(campaignsData),
        };
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
        // フォールバックとしてダミーデータを返す
        return {
          metrics: {
            impressions: 0,
            clicks: 0,
            spend: 0,
            ctr: 0,
            cpc: 0,
            conversions: 0,
            costPerConversion: 0,
          },
          chartData: generateChartData(dateRange.start, dateRange.end),
          campaigns: [],
        };
      }
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const handleExport = () => {
    if (!analyticsData) return;

    const csvContent = [
      ["Metric", "Value"],
      ["Impressions", analyticsData.metrics.impressions],
      ["Clicks", analyticsData.metrics.clicks],
      ["Spend", analyticsData.metrics.spend],
      ["CTR", analyticsData.metrics.ctr],
      ["CPC", analyticsData.metrics.cpc],
      ["Conversions", analyticsData.metrics.conversions],
      ["Cost Per Conversion", analyticsData.metrics.costPerConversion],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${account.accountName}-${dateRange.start}-${dateRange.end}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Date Range and Actions */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl shadow-md ${
            account.platform === "meta" 
              ? "bg-blue-100" 
              : "bg-green-100"
          }`}>
            {account.platform === "meta" ? (
              <Facebook className="h-6 w-6 text-blue-600" />
            ) : (
              <Globe className="h-6 w-6 text-green-600" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{account.accountName}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${
                  account.platform === "meta" ? "bg-blue-500" : "bg-green-500"
                }`}></span>
                {account.platform === "meta" ? "Meta広告" : "Google広告"} パフォーマンス分析
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-card rounded-lg px-4 py-2.5 border-2 shadow-sm hover:shadow-md transition-shadow">
            <Calendar className="h-4 w-4 text-primary" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="bg-transparent text-sm outline-none font-medium"
            />
            <span className="text-muted-foreground">-</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="bg-transparent text-sm outline-none font-medium"
            />
          </div>

          <button
            onClick={() => refetch()}
            className="btn-secondary flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            更新
          </button>

          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              showAnalysis 
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md' 
                : 'btn-secondary hover:bg-purple-50 hover:border-purple-200'
            }`}
          >
            <Brain className="h-4 w-4" />
            AI分析
          </button>

          <button
            onClick={handleExport}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            エクスポート
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      {analyticsData && (
        <>
          <MetricsCards metrics={analyticsData.metrics} isLoading={isLoading} />

          {/* Performance Chart */}
          <div className="card p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div>
                <h3 className="text-xl font-bold mb-1">パフォーマンス推移</h3>
                <p className="text-sm text-muted-foreground">期間中の主要指標の推移を確認できます</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(["impressions", "clicks", "spend", "conversions"] as const).map((metric) => (
                  <button
                    key={metric}
                    onClick={() => setSelectedMetric(metric)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedMetric === metric
                        ? "bg-primary text-primary-foreground shadow-md scale-105"
                        : "bg-secondary hover:bg-secondary/80 hover:scale-105"
                    }`}
                  >
                    {metric === "impressions" && "表示回数"}
                    {metric === "clicks" && "クリック"}
                    {metric === "spend" && "費用"}
                    {metric === "conversions" && "コンバージョン"}
                  </button>
                ))}
              </div>
            </div>
            <PerformanceChart data={analyticsData.chartData} metric={selectedMetric} />
          </div>

          {/* Campaign Table */}
          <CampaignTable campaigns={analyticsData.campaigns} />

          {/* AI Analysis Panel */}
          {showAnalysis && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI分析レポート
              </h2>
              <AnalysisPanel account={account} data={analyticsData} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Helper functions for extracting data
function extractMetrics(data: any) {
  const insights = data.data?.insights?.[0] || data.data?.[0] || {};
  return {
    impressions: parseInt(insights.impressions || '0'),
    clicks: parseInt(insights.clicks || '0'),
    spend: parseFloat(insights.spend || '0'),
    ctr: parseFloat(insights.ctr || '0'),
    cpc: parseFloat(insights.cpc || '0'),
    conversions: parseInt(insights.conversions || '0'),
    costPerConversion: parseFloat(insights.cost_per_conversion || '0'),
  };
}

function extractChartData(data: any) {
  const insights = data.data?.insights || data.data || [];
  return insights.map((item: any) => ({
    date: item.date_start || item.segments?.date || new Date().toISOString().split('T')[0],
    impressions: parseInt(item.impressions || '0'),
    clicks: parseInt(item.clicks || '0'),
    spend: parseFloat(item.spend || '0'),
    conversions: parseInt(item.conversions || '0'),
  }));
}

function extractCampaigns(data: any) {
  const campaigns = data.data?.campaigns || data.data || [];
  return campaigns.map((campaign: any) => ({
    id: campaign.id,
    name: campaign.name,
    status: campaign.status?.toLowerCase() || 'active',
    impressions: parseInt(campaign.impressions || '0'),
    clicks: parseInt(campaign.clicks || '0'),
    spend: parseFloat(campaign.spend || '0'),
    ctr: parseFloat(campaign.ctr || '0'),
    conversions: parseInt(campaign.conversions || '0'),
  }));
}

// Helper functions for generating mock data
function generateChartData(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    
    return {
      date: date.toISOString().split("T")[0],
      impressions: Math.floor(Math.random() * 20000) + 10000,
      clicks: Math.floor(Math.random() * 800) + 200,
      spend: Math.random() * 800 + 200,
      conversions: Math.floor(Math.random() * 50) + 10,
    };
  });
}

function generateCampaignData() {
  return [
    {
      id: "1",
      name: "ブランド認知キャンペーン",
      status: "active",
      impressions: 45000,
      clicks: 1200,
      spend: 1500.25,
      ctr: 2.67,
      conversions: 95,
    },
    {
      id: "2",
      name: "リターゲティングキャンペーン",
      status: "active",
      impressions: 32000,
      clicks: 980,
      spend: 1200.00,
      ctr: 3.06,
      conversions: 120,
    },
    {
      id: "3",
      name: "新規獲得キャンペーン",
      status: "paused",
      impressions: 28000,
      clicks: 750,
      spend: 980.50,
      ctr: 2.68,
      conversions: 65,
    },
  ];
}