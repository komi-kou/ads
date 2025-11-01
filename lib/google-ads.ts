import axios from 'axios';

const GOOGLE_ADS_API_BASE = 'https://googleads.googleapis.com/v15';
const GOOGLE_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';

export interface GoogleAccount {
  id: string;
  descriptiveName: string;
  currencyCode: string;
  timeZone: string;
  canManageClients: boolean;
}

export interface GoogleCampaign {
  id: string;
  name: string;
  status: string;
  advertisingChannelType: string;
  biddingStrategyType: string;
  budget: {
    id: string;
    amountMicros: string;
  };
  startDate: string;
  endDate?: string;
}

export interface GoogleAdGroup {
  id: string;
  name: string;
  campaignId: string;
  status: string;
  type: string;
  cpcBidMicros?: string;
  targetCpa?: string;
}

export interface GoogleAd {
  id: string;
  name: string;
  adGroupId: string;
  status: string;
  type: string;
  headlines: string[];
  descriptions: string[];
}

export interface GoogleMetrics {
  impressions: string;
  clicks: string;
  costMicros: string;
  averageCpc: string;
  ctr: string;
  conversions: string;
  costPerConversion: string;
}

export interface GoogleInsights {
  metrics: GoogleMetrics;
  segments: {
    date: string;
  };
}

export class GoogleAdsClient {
  private accessToken: string;
  private refreshToken: string;
  private clientId: string;
  private clientSecret: string;
  private developerToken: string;
  private customerId: string;

  constructor(config: {
    accessToken: string;
    refreshToken: string;
    clientId: string;
    clientSecret: string;
    developerToken: string;
    customerId: string;
  }) {
    this.accessToken = config.accessToken;
    this.refreshToken = config.refreshToken;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.developerToken = config.developerToken;
    this.customerId = config.customerId;
  }

  private async refreshAccessToken(): Promise<string> {
    try {
      const response = await axios.post(GOOGLE_OAUTH_TOKEN_URL, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token',
      });

      this.accessToken = response.data.access_token;
      return this.accessToken;
    } catch (error: any) {
      console.error('Failed to refresh Google access token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  private async request<T>(query: string, retryCount = 0): Promise<T> {
    try {
      const response = await axios.post(
        `${GOOGLE_ADS_API_BASE}/customers/${this.customerId}/googleAds:searchStream`,
        { query },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'developer-token': this.developerToken,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401 && retryCount === 0) {
        await this.refreshAccessToken();
        return this.request<T>(query, retryCount + 1);
      }
      console.error('Google Ads API Error:', error.response?.data || error.message);
      throw new Error(`Google Ads API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getAccounts(): Promise<GoogleAccount[]> {
    const query = `
      SELECT
        customer.id,
        customer.descriptive_name,
        customer.currency_code,
        customer.time_zone,
        customer.manager
      FROM customer
    `;
    
    const response = await this.request<any>(query);
    return response.results.map((r: any) => ({
      id: r.customer.id,
      descriptiveName: r.customer.descriptiveName,
      currencyCode: r.customer.currencyCode,
      timeZone: r.customer.timeZone,
      canManageClients: r.customer.manager,
    }));
  }

  async getCampaigns(): Promise<GoogleCampaign[]> {
    const query = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.bidding_strategy_type,
        campaign_budget.amount_micros,
        campaign.start_date,
        campaign.end_date
      FROM campaign
      WHERE campaign.status != 'REMOVED'
    `;
    
    const response = await this.request<any>(query);
    return response.results.map((r: any) => ({
      id: r.campaign.id,
      name: r.campaign.name,
      status: r.campaign.status,
      advertisingChannelType: r.campaign.advertisingChannelType,
      biddingStrategyType: r.campaign.biddingStrategyType,
      budget: {
        id: r.campaignBudget?.id || '',
        amountMicros: r.campaignBudget?.amountMicros || '0',
      },
      startDate: r.campaign.startDate,
      endDate: r.campaign.endDate,
    }));
  }

  async getAdGroups(campaignId: string): Promise<GoogleAdGroup[]> {
    const query = `
      SELECT
        ad_group.id,
        ad_group.name,
        ad_group.campaign,
        ad_group.status,
        ad_group.type,
        ad_group.cpc_bid_micros,
        ad_group.target_cpa_micros
      FROM ad_group
      WHERE ad_group.campaign = 'customers/${this.customerId}/campaigns/${campaignId}'
        AND ad_group.status != 'REMOVED'
    `;
    
    const response = await this.request<any>(query);
    return response.results.map((r: any) => ({
      id: r.adGroup.id,
      name: r.adGroup.name,
      campaignId: campaignId,
      status: r.adGroup.status,
      type: r.adGroup.type,
      cpcBidMicros: r.adGroup.cpcBidMicros,
      targetCpa: r.adGroup.targetCpaMicros,
    }));
  }

  async getInsights(
    startDate: string,
    endDate: string,
    level: 'account' | 'campaign' | 'ad_group' = 'account'
  ): Promise<GoogleInsights[]> {
    const query = `
      SELECT
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.average_cpc,
        metrics.ctr,
        metrics.conversions,
        metrics.cost_per_conversion,
        segments.date
      FROM ${level === 'account' ? 'customer' : level}
      WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
    `;
    
    const response = await this.request<any>(query);
    return response.results.map((r: any) => ({
      metrics: {
        impressions: r.metrics.impressions,
        clicks: r.metrics.clicks,
        costMicros: r.metrics.costMicros,
        averageCpc: r.metrics.averageCpc,
        ctr: r.metrics.ctr,
        conversions: r.metrics.conversions,
        costPerConversion: r.metrics.costPerConversion,
      },
      segments: {
        date: r.segments.date,
      },
    }));
  }
}