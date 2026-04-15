interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

/**
 * LinkedIn Ads MCP Pack
 *
 * Requires OAuth connection — gateway injects credentials via _context.linkedin_ads.
 * Uses the LinkedIn Marketing API (REST v2, LinkedIn-Version: 202404).
 */


const API = 'https://api.linkedin.com/rest';
const LI_VERSION = '202404';

interface LinkedInAdsContext {
  linkedin_ads?: { accessToken: string };
}

async function liFetch(ctx: LinkedInAdsContext, path: string, params: Record<string, string> = {}) {
  if (!ctx.linkedin_ads) {
    return { error: 'connection_required', message: 'Connect your LinkedIn Ads account at https://pipeworx.io/account' };
  }
  const { accessToken } = ctx.linkedin_ads;
  const qs = new URLSearchParams(params);
  const url = Object.keys(params).length > 0 ? `${API}${path}?${qs}` : `${API}${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'LinkedIn-Version': LI_VERSION,
      'X-Restli-Protocol-Version': '2.0.0',
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LinkedIn Ads API error (${res.status}): ${text}`);
  }
  return res.json();
}

const tools: McpToolExport['tools'] = [
  {
    name: 'li_list_ad_accounts',
    description: 'List LinkedIn ad accounts accessible by the authenticated user.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        count: { type: 'number', description: 'Max results (default 10)' },
        start: { type: 'number', description: 'Pagination offset (default 0)' },
      },
    },
  },
  {
    name: 'li_list_campaigns',
    description: 'List campaigns for a LinkedIn ad account.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        account_id: { type: 'string', description: 'Sponsored account ID (numeric, e.g., "508127070")' },
        count: { type: 'number', description: 'Max results (default 10)' },
        start: { type: 'number', description: 'Pagination offset (default 0)' },
      },
      required: ['account_id'],
    },
  },
  {
    name: 'li_get_campaign',
    description: 'Get details for a specific LinkedIn ad campaign.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        campaign_id: { type: 'string', description: 'Campaign ID' },
      },
      required: ['campaign_id'],
    },
  },
  {
    name: 'li_campaign_analytics',
    description: 'Get analytics for one or more LinkedIn ad campaigns over a date range.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        campaign_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of campaign IDs to query',
        },
        date_range_start: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        date_range_end: { type: 'string', description: 'End date (YYYY-MM-DD)' },
        time_granularity: { type: 'string', description: 'Granularity: DAILY, MONTHLY, or ALL (default ALL)' },
      },
      required: ['campaign_ids', 'date_range_start', 'date_range_end'],
    },
  },
  {
    name: 'li_list_creatives',
    description: 'List creatives (ads) for a specific LinkedIn campaign.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        campaign_id: { type: 'string', description: 'Campaign ID' },
        count: { type: 'number', description: 'Max results (default 10)' },
        start: { type: 'number', description: 'Pagination offset (default 0)' },
      },
      required: ['campaign_id'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const context = (args._context ?? {}) as LinkedInAdsContext;
  delete args._context;

  switch (name) {
    case 'li_list_ad_accounts': {
      const count = String((args.count as number) ?? 10);
      const start = String((args.start as number) ?? 0);
      return liFetch(context, '/adAccounts', { q: 'search', count, start });
    }

    case 'li_list_campaigns': {
      const accountId = args.account_id as string;
      const count = String((args.count as number) ?? 10);
      const start = String((args.start as number) ?? 0);
      return liFetch(context, '/adCampaigns', {
        q: 'search',
        'search.account.values[0]': `urn:li:sponsoredAccount:${accountId}`,
        count,
        start,
      });
    }

    case 'li_get_campaign': {
      const campaignId = args.campaign_id as string;
      return liFetch(context, `/adCampaigns/${campaignId}`);
    }

    case 'li_campaign_analytics': {
      const campaignIds = args.campaign_ids as string[];
      const startDate = args.date_range_start as string;
      const endDate = args.date_range_end as string;
      const granularity = (args.time_granularity as string) ?? 'ALL';

      const [startYear, startMonth, startDay] = startDate.split('-');
      const [endYear, endMonth, endDay] = endDate.split('-');

      const params: Record<string, string> = {
        q: 'analytics',
        pivot: 'CAMPAIGN',
        timeGranularity: granularity,
        'dateRange.start.year': startYear,
        'dateRange.start.month': startMonth,
        'dateRange.start.day': startDay,
        'dateRange.end.year': endYear,
        'dateRange.end.month': endMonth,
        'dateRange.end.day': endDay,
      };

      campaignIds.forEach((id, i) => {
        params[`campaigns[${i}]`] = `urn:li:sponsoredCampaign:${id}`;
      });

      return liFetch(context, '/adAnalytics', params);
    }

    case 'li_list_creatives': {
      const campaignId = args.campaign_id as string;
      const count = String((args.count as number) ?? 10);
      const start = String((args.start as number) ?? 0);
      return liFetch(context, '/adCreatives', {
        q: 'search',
        'search.campaign.values[0]': `urn:li:sponsoredCampaign:${campaignId}`,
        count,
        start,
      });
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 15 }, provider: 'linkedin_ads' } satisfies McpToolExport;
