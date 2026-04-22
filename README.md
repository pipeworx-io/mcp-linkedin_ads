# mcp-linkedin_ads

LinkedIn Ads MCP Pack

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 250+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `li_list_ad_accounts` | Check which LinkedIn ad accounts you can access. Returns account IDs, names, and status to identify which account to use for campaigns. |
| `li_list_campaigns` | Get all campaigns in a LinkedIn ad account (e.g., account ID "501234567"). Returns campaign IDs, names, budgets, status, and date ranges. |
| `li_get_campaign` | Get full details for a specific LinkedIn campaign (e.g., campaign ID "501234567"). Returns name, budget, spend, status, targeting, and performance metrics. |
| `li_campaign_analytics` | Analyze campaign performance over a date range (e.g., "2024-01-01" to "2024-01-31"). Returns impressions, clicks, conversions, spend, and CTR by campaign. |
| `li_list_creatives` | View all ads in a LinkedIn campaign (e.g., campaign ID "501234567"). Returns creative IDs, titles, content, status, and creation dates to compare variations. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "linkedin_ads": {
      "url": "https://gateway.pipeworx.io/linkedin_ads/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 250+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Linkedin_ads data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
