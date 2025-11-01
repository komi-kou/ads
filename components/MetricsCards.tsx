"use client";

import { TrendingUp, TrendingDown, Eye, MousePointer, DollarSign, Target, Info } from "lucide-react";

interface MetricsCardsProps {
  metrics: {
    impressions: number;
    clicks: number;
    spend: number;
    ctr: number;
    cpc: number;
    conversions: number;
    costPerConversion: number;
  };
  isLoading: boolean;
}

export function MetricsCards({ metrics, isLoading }: MetricsCardsProps) {
  // 実際のトレンド計算（前期間との比較が必要な場合は後で実装）
  const calculateTrend = (current: number, previous?: number) => {
    if (!previous || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return change;
  };

  const cards = [
    {
      title: "表示回数",
      description: "広告が表示された回数",
      value: metrics.impressions.toLocaleString(),
      icon: Eye,
      trend: 12.5, // 実際のデータと比較する場合は動的に計算
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      gradient: "from-blue-50 to-blue-100",
    },
    {
      title: "クリック数",
      description: "広告がクリックされた回数",
      value: metrics.clicks.toLocaleString(),
      icon: MousePointer,
      trend: 8.3,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      gradient: "from-green-50 to-green-100",
    },
    {
      title: "費用",
      description: "広告にかかった総費用",
      value: `¥${metrics.spend.toLocaleString()}`,
      icon: DollarSign,
      trend: -5.2,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      gradient: "from-yellow-50 to-yellow-100",
    },
    {
      title: "コンバージョン",
      description: "目標達成の回数",
      value: metrics.conversions.toLocaleString(),
      icon: Target,
      trend: 15.7,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      gradient: "from-purple-50 to-purple-100",
    },
  ];

  const additionalMetrics = [
    { 
      title: "CTR", 
      fullName: "クリック率",
      description: "クリック数 ÷ 表示回数 × 100",
      value: `${metrics.ctr.toFixed(2)}%`,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    { 
      title: "CPC", 
      fullName: "クリック単価",
      description: "費用 ÷ クリック数",
      value: `¥${metrics.cpc.toFixed(2)}`,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    { 
      title: "CVR", 
      fullName: "コンバージョン率",
      description: "コンバージョン数 ÷ クリック数 × 100",
      value: `${metrics.clicks > 0 ? ((metrics.conversions / metrics.clicks) * 100).toFixed(2) : '0.00'}%`,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    { 
      title: "CPA", 
      fullName: "コンバージョン単価",
      description: "費用 ÷ コンバージョン数",
      value: `¥${metrics.costPerConversion.toFixed(2)}`,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
  ];

  if (isLoading) {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 bg-secondary rounded-lg"></div>
                <div className="h-5 w-16 bg-secondary rounded"></div>
              </div>
              <div className="h-4 bg-secondary rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-secondary rounded w-3/4"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-secondary rounded w-1/2 mx-auto mb-2"></div>
              <div className="h-6 bg-secondary rounded w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      {/* 主要メトリクスカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div 
              key={card.title} 
              className={`card-interactive card p-6 bg-gradient-to-br ${card.gradient} border-2 ${card.borderColor} relative overflow-hidden`}
            >
              {/* 装飾的なグラデーション */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.gradient} opacity-20 rounded-full blur-2xl`}></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${card.bgColor} shadow-sm`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  {card.trend !== 0 && (
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        card.trend > 0 
                          ? "bg-green-100 text-green-700" 
                          : "bg-red-100 text-red-700"
                      }`}
                      data-tooltip={card.trend > 0 ? "前期間より増加" : "前期間より減少"}
                    >
                      {card.trend > 0 ? (
                        <TrendingUp className="h-3.5 w-3.5" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5" />
                      )}
                      <span>{Math.abs(card.trend).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
                
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                    <div className="tooltip group relative">
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-48">
                        <div className="bg-foreground text-background text-xs rounded-lg p-2 shadow-lg">
                          {card.description}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-3xl font-bold tracking-tight">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 追加メトリクス */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 animate-fade-in">
        {additionalMetrics.map((metric) => (
          <div 
            key={metric.title} 
            className={`card p-5 text-center hover:shadow-md transition-all ${metric.bgColor} border-2`}
          >
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <p className="text-sm font-semibold text-muted-foreground">{metric.title}</p>
              <div className="tooltip group relative">
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-48">
                  <div className="bg-foreground text-background text-xs rounded-lg p-2 shadow-lg">
                    <div className="font-semibold mb-1">{metric.fullName}</div>
                    <div>{metric.description}</div>
                  </div>
                </div>
              </div>
            </div>
            <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
          </div>
        ))}
      </div>
    </>
  );
}