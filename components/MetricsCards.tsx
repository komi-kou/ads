"use client";

import { TrendingUp, TrendingDown, Eye, MousePointer, DollarSign, Target } from "lucide-react";

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
  const cards = [
    {
      title: "表示回数",
      value: metrics.impressions.toLocaleString(),
      icon: Eye,
      trend: 12.5,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "クリック数",
      value: metrics.clicks.toLocaleString(),
      icon: MousePointer,
      trend: 8.3,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "費用",
      value: `¥${metrics.spend.toLocaleString()}`,
      icon: DollarSign,
      trend: -5.2,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "コンバージョン",
      value: metrics.conversions.toLocaleString(),
      icon: Target,
      trend: 15.7,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  const additionalMetrics = [
    { title: "CTR", value: `${metrics.ctr.toFixed(2)}%` },
    { title: "CPC", value: `¥${metrics.cpc.toFixed(2)}` },
    { title: "CVR", value: `${((metrics.conversions / metrics.clicks) * 100).toFixed(2)}%` },
    { title: "CPA", value: `¥${metrics.costPerConversion.toFixed(2)}` },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-6 animate-pulse">
            <div className="h-4 bg-secondary rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-secondary rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
                {card.trend !== 0 && (
                  <div
                    className={`flex items-center gap-1 text-sm ${
                      card.trend > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {card.trend > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span>{Math.abs(card.trend)}%</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {additionalMetrics.map((metric) => (
          <div key={metric.title} className="card p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">{metric.title}</p>
            <p className="text-xl font-semibold">{metric.value}</p>
          </div>
        ))}
      </div>
    </>
  );
}