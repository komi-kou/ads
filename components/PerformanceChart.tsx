"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface PerformanceChartProps {
  data: Array<{
    date: string;
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
  }>;
  metric: "impressions" | "clicks" | "spend" | "conversions";
}

export function PerformanceChart({ data, metric }: PerformanceChartProps) {
  const metricConfig = {
    impressions: { label: "表示回数", color: "#3b82f6", formatter: (v: number) => v.toLocaleString() },
    clicks: { label: "クリック数", color: "#10b981", formatter: (v: number) => v.toLocaleString() },
    spend: { label: "費用", color: "#f59e0b", formatter: (v: number) => `¥${v.toLocaleString()}` },
    conversions: { label: "コンバージョン", color: "#8b5cf6", formatter: (v: number) => v.toLocaleString() },
  };

  const config = metricConfig[metric];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload[0]) {
      return (
        <div className="bg-background border rounded-md p-3 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm mt-1" style={{ color: config.color }}>
            {config.label}: {config.formatter(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          className="text-xs"
          stroke="var(--muted-foreground)"
        />
        <YAxis
          tickFormatter={(value) => {
            if (metric === "spend") return `¥${(value / 1000).toFixed(0)}k`;
            if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
            return value;
          }}
          className="text-xs"
          stroke="var(--muted-foreground)"
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey={metric}
          stroke={config.color}
          strokeWidth={2}
          dot={{ r: 4, fill: config.color }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}