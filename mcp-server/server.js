const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.MCP_SERVER_PORT || 3001;

app.use(cors());
app.use(express.json());

// MCP endpoints for Meta Ads
app.post('/mcp/meta/accounts', async (req, res) => {
  try {
    const { accessToken } = req.body;
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/me/adaccounts`,
      {
        params: {
          access_token: accessToken,
          fields: 'id,name,currency,timezone_name,account_status',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Meta API Error:', error);
    res.status(500).json({ error: 'Failed to fetch Meta accounts' });
  }
});

app.post('/mcp/meta/insights', async (req, res) => {
  try {
    const { accessToken, accountId, dateRange } = req.body;
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${accountId}/insights`,
      {
        params: {
          access_token: accessToken,
          fields: 'impressions,clicks,spend,cpm,cpc,ctr,conversions,cost_per_conversion',
          time_range: JSON.stringify(dateRange),
          time_increment: 1,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Meta Insights Error:', error);
    res.status(500).json({ error: 'Failed to fetch Meta insights' });
  }
});

// MCP endpoints for Google Ads
app.post('/mcp/google/accounts', async (req, res) => {
  try {
    const { accessToken, developerToken, customerId } = req.body;
    
    // Google Ads API implementation
    const response = await axios.post(
      `https://googleads.googleapis.com/v15/customers/${customerId}/googleAds:searchStream`,
      {
        query: `
          SELECT
            customer.id,
            customer.descriptive_name,
            customer.currency_code,
            customer.time_zone
          FROM customer
        `,
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': developerToken,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Google Ads API Error:', error);
    res.status(500).json({ error: 'Failed to fetch Google accounts' });
  }
});

app.post('/mcp/google/insights', async (req, res) => {
  try {
    const { accessToken, developerToken, customerId, dateRange } = req.body;
    
    const response = await axios.post(
      `https://googleads.googleapis.com/v15/customers/${customerId}/googleAds:searchStream`,
      {
        query: `
          SELECT
            metrics.impressions,
            metrics.clicks,
            metrics.cost_micros,
            metrics.average_cpc,
            metrics.ctr,
            metrics.conversions,
            metrics.cost_per_conversion,
            segments.date
          FROM customer
          WHERE segments.date BETWEEN '${dateRange.start}' AND '${dateRange.end}'
        `,
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': developerToken,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Google Ads Insights Error:', error);
    res.status(500).json({ error: 'Failed to fetch Google insights' });
  }
});

// Analysis endpoint for Claude integration
app.post('/mcp/analyze', async (req, res) => {
  try {
    const { platform, data, prompt } = req.body;
    
    // Format data for analysis
    const formattedData = {
      platform,
      metrics: data.metrics,
      campaigns: data.campaigns,
      timeRange: data.timeRange,
    };

    // This would integrate with Claude API for analysis
    const analysis = {
      summary: `Analysis for ${platform} account`,
      insights: [
        'Performance is trending upward',
        'CTR is above industry average',
        'Consider optimizing budget allocation',
      ],
      recommendations: [
        'Increase budget for high-performing campaigns',
        'Test new ad creatives',
        'Expand targeting to similar audiences',
      ],
    };

    res.json({ analysis, data: formattedData });
  } catch (error) {
    console.error('Analysis Error:', error);
    res.status(500).json({ error: 'Failed to analyze data' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
});