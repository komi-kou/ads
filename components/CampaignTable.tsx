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
    <div className="card overflow-hidden">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">キャンペーン別パフォーマンス</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary/50">
            <tr>
              <th className="text-left p-4 font-medium text-sm">ステータス</th>
              <th className="text-left p-4 font-medium text-sm">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  キャンペーン名
                  {sortField === "name" && (
                    sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              </th>
              <th className="text-right p-4 font-medium text-sm">
                <button
                  onClick={() => handleSort("impressions")}
                  className="flex items-center gap-1 hover:text-primary transition-colors ml-auto"
                >
                  表示回数
                  {sortField === "impressions" && (
                    sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              </th>
              <th className="text-right p-4 font-medium text-sm">
                <button
                  onClick={() => handleSort("clicks")}
                  className="flex items-center gap-1 hover:text-primary transition-colors ml-auto"
                >
                  クリック
                  {sortField === "clicks" && (
                    sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              </th>
              <th className="text-right p-4 font-medium text-sm">
                <button
                  onClick={() => handleSort("ctr")}
                  className="flex items-center gap-1 hover:text-primary transition-colors ml-auto"
                >
                  CTR
                  {sortField === "ctr" && (
                    sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              </th>
              <th className="text-right p-4 font-medium text-sm">
                <button
                  onClick={() => handleSort("spend")}
                  className="flex items-center gap-1 hover:text-primary transition-colors ml-auto"
                >
                  費用
                  {sortField === "spend" && (
                    sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              </th>
              <th className="text-right p-4 font-medium text-sm">
                <button
                  onClick={() => handleSort("conversions")}
                  className="flex items-center gap-1 hover:text-primary transition-colors ml-auto"
                >
                  CV
                  {sortField === "conversions" && (
                    sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedCampaigns.map((campaign) => (
              <tr key={campaign.id} className="border-b hover:bg-secondary/20 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Circle
                      className={`h-2 w-2 fill-current ${
                        campaign.status === "active" ? "text-green-600" : "text-yellow-600"
                      }`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {campaign.status === "active" ? "配信中" : "一時停止"}
                    </span>
                  </div>
                </td>
                <td className="p-4 font-medium">{campaign.name}</td>
                <td className="p-4 text-right">{campaign.impressions.toLocaleString()}</td>
                <td className="p-4 text-right">{campaign.clicks.toLocaleString()}</td>
                <td className="p-4 text-right">{campaign.ctr.toFixed(2)}%</td>
                <td className="p-4 text-right">¥{campaign.spend.toLocaleString()}</td>
                <td className="p-4 text-right">{campaign.conversions.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}