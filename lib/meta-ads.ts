import axios from 'axios';

const META_API_BASE = 'https://graph.facebook.com/v18.0';

export interface MetaAccount {
  id: string;
  name: string;
  currency: string;
  timezone_name: string;
  account_status: number;
}

export interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  daily_budget?: string;
  lifetime_budget?: string;
  created_time: string;
  updated_time: string;
}

export interface MetaAdSet {
  id: string;
  name: string;
  campaign_id: string;
  status: string;
  targeting: any;
  daily_budget?: string;
  lifetime_budget?: string;
  start_time: string;
  end_time?: string;
}

export interface MetaAd {
  id: string;
  name: string;
  adset_id: string;
  status: string;
  creative: any;
  created_time: string;
  updated_time: string;
}

export interface MetaInsights {
  impressions: string;
  clicks: string;
  spend: string;
  cpm: string;
  cpc: string;
  ctr: string;
  conversions?: string;
  cost_per_conversion?: string;
  date_start: string;
  date_stop: string;
}

export class MetaAdsClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    try {
      const response = await axios.get(`${META_API_BASE}${endpoint}`, {
        params: {
          access_token: this.accessToken,
          ...params,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Meta API Error:', error.response?.data || error.message);
      throw new Error(`Meta API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getAdAccounts(): Promise<{ data: MetaAccount[] }> {
    return this.request<{ data: MetaAccount[] }>('/me/adaccounts', {
      fields: 'id,name,currency,timezone_name,account_status',
    });
  }

  async getCampaigns(accountId: string): Promise<{ data: MetaCampaign[] }> {
    return this.request<{ data: MetaCampaign[] }>(`/${accountId}/campaigns`, {
      fields: 'id,name,status,objective,daily_budget,lifetime_budget,created_time,updated_time',
    });
  }

  async getAdSets(campaignId: string): Promise<{ data: MetaAdSet[] }> {
    return this.request<{ data: MetaAdSet[] }>(`/${campaignId}/adsets`, {
      fields: 'id,name,campaign_id,status,targeting,daily_budget,lifetime_budget,start_time,end_time',
    });
  }

  async getAds(adsetId: string): Promise<{ data: MetaAd[] }> {
    return this.request<{ data: MetaAd[] }>(`/${adsetId}/ads`, {
      fields: 'id,name,adset_id,status,creative,created_time,updated_time',
    });
  }

  async getInsights(
    objectId: string,
    level: 'account' | 'campaign' | 'adset' | 'ad',
    datePreset: string = 'last_7d'
  ): Promise<{ data: MetaInsights[] }> {
    return this.request<{ data: MetaInsights[] }>(`/${objectId}/insights`, {
      fields: 'impressions,clicks,spend,cpm,cpc,ctr,conversions,cost_per_conversion',
      date_preset: datePreset,
      level: level,
    });
  }

  async getAccountInsights(
    accountId: string,
    startDate: string,
    endDate: string
  ): Promise<{ data: MetaInsights[] }> {
    return this.request<{ data: MetaInsights[] }>(`/${accountId}/insights`, {
      fields: 'impressions,clicks,spend,cpm,cpc,ctr,conversions,cost_per_conversion',
      time_range: JSON.stringify({ since: startDate, until: endDate }),
      time_increment: 1,
    });
  }
}