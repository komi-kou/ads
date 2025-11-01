"use client";

import { ChevronDown, ChevronUp, Circle } from "lucide-react";
import { useState } from "react";

interface Campaign {
  id: string;
  name: string;
  status: string;
  impressions: number;
  clicks: number;
  spend: number;
  ctr: number;
  conversions: number;
}

interface CampaignTableProps {
  campaigns: Campaign[];
}

export function CampaignTable({ campaigns }: CampaignTableProps) {
  const [sortField, setSortField] = useState<keyof Campaign>("spend");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: keyof Campaign) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedCampaigns = [...campaigns].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === "string") {
      return sortDirection === "asc" 
        ? aValue.localeCompare(bValue as string)
        : (bValue as string).localeCompare(aValue);
    }
    
    return sortDirection === "asc" 
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  return (
    <div className="card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6 border-b bg-gradient-to-r from-secondary/50 to-transparent">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">キャンペーン別パフォーマンス</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {campaigns.length}件のキャンペーンを表示中
            </p>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary/30">
            <tr>
              <th className="text-left p-4 font-semibold text-sm">ステータス</th>
              <th className="text-left p-4 font-semibold text-sm">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-2 hover:text-primary transition-colors group"
                >
                  キャンペーン名
                  {sortField === "name" && (
                    sortDirection === "asc" ? <ChevronUp className="h-4 w-4 group-hover:scale-110 transition-transform" /> : <ChevronDown className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  )}
                </button>
              </th>
              <th className="text-right p-4 font-semibold text-sm">
                <button
                  onClick={() => handleSort("impressions")}
                  className="flex items-center gap-2 hover:text-primary transition-colors ml-auto group"
                >
                  表示回数
                  {sortField === "impressions" && (
                    sortDirection === "asc" ? <ChevronUp className="h-4 w-4 group-hover:scale-110 transition-transform" /> : <ChevronDown className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  )}
                </button>
              </th>
              <th className="text-right p-4 font-semibold text-sm">
                <button
                  onClick={() => handleSort("clicks")}
                  className="flex items-center gap-2 hover:text-primary transition-colors ml-auto group"
                >
                  クリック
                  {sortField === "clicks" && (
                    sortDirection === "asc" ? <ChevronUp className="h-4 w-4 group-hover:scale-110 transition-transform" /> : <ChevronDown className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  )}
                </button>
              </th>
              <th className="text-right p-4 font-semibold text-sm">
                <button
                  onClick={() => handleSort("ctr")}
                  className="flex items-center gap-2 hover:text-primary transition-colors ml-auto group"
                >
                  CTR
                  {sortField === "ctr" && (
                    sortDirection === "asc" ? <ChevronUp className="h-4 w-4 group-hover:scale-110 transition-transform" /> : <ChevronDown className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  )}
                </button>
              </th>
              <th className="text-right p-4 font-semibold text-sm">
                <button
                  onClick={() => handleSort("spend")}
                  className="flex items-center gap-2 hover:text-primary transition-colors ml-auto group"
                >
                  費用
                  {sortField === "spend" && (
                    sortDirection === "asc" ? <ChevronUp className="h-4 w-4 group-hover:scale-110 transition-transform" /> : <ChevronDown className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  )}
                </button>
              </th>
              <th className="text-right p-4 font-semibold text-sm">
                <button
                  onClick={() => handleSort("conversions")}
                  className="flex items-center gap-2 hover:text-primary transition-colors ml-auto group"
                >
                  CV
                  {sortField === "conversions" && (
                    sortDirection === "asc" ? <ChevronUp className="h-4 w-4 group-hover:scale-110 transition-transform" /> : <ChevronDown className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  )}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedCampaigns.map((campaign) => (
              <tr key={campaign.id} className="border-b hover:bg-secondary/30 transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Circle
                      className={`h-3 w-3 fill-current transition-all ${
                        campaign.status === "active" ? "text-green-600" : "text-yellow-600"
                      }`}
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                      {campaign.status === "active" ? "配信中" : "一時停止"}
                    </span>
                  </div>
                </td>
                <td className="p-4 font-semibold group-hover:text-primary transition-colors">{campaign.name}</td>
                <td className="p-4 text-right font-medium">{campaign.impressions.toLocaleString()}</td>
                <td className="p-4 text-right font-medium">{campaign.clicks.toLocaleString()}</td>
                <td className="p-4 text-right font-medium">{campaign.ctr.toFixed(2)}%</td>
                <td className="p-4 text-right font-semibold">¥{campaign.spend.toLocaleString()}</td>
                <td className="p-4 text-right font-medium">{campaign.conversions.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}