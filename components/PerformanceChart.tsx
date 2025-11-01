"use client";

import {
  LineChart,
  Line,
  Area,
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
        <div className="bg-card border-2 border-border rounded-lg p-4 shadow-xl">
          <p className="text-sm font-semibold text-muted-foreground mb-2">{label}</p>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: config.color }}
            ></div>
            <p className="text-base font-bold" style={{ color: config.color }}>
              {config.label}: {config.formatter(payload[0].value)}
            </p>
          </div>
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
    <div className="w-full">
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
          <defs>
            <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={config.color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={config.color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-30" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            className="text-xs"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            tickFormatter={(value) => {
              if (metric === "spend") return `¥${(value / 1000).toFixed(0)}k`;
              if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
              return value.toString();
            }}
            className="text-xs"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ stroke: config.color, strokeWidth: 2, strokeDasharray: '5 5' }}
          />
          <Line
            type="monotone"
            dataKey={metric}
            stroke={config.color}
            strokeWidth={3}
            dot={{ r: 5, fill: config.color, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7, fill: config.color, stroke: '#fff', strokeWidth: 2 }}
            fill={`url(#gradient-${metric})`}
          />
          <Area
            type="monotone"
            dataKey={metric}
            stroke="none"
            fill={`url(#gradient-${metric})`}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}