# mcp-linkedin_ads

LinkedIn Ads MCP Pack

Part of the [Pipeworx](https://pipeworx.io) open MCP gateway.

## Tools

| Tool | Description |
|------|-------------|
| `li_list_ad_accounts` | List LinkedIn ad accounts accessible by the authenticated user. |
| `li_list_campaigns` | List campaigns for a LinkedIn ad account. |
| `li_get_campaign` | Get details for a specific LinkedIn ad campaign. |
| `li_campaign_analytics` | Get analytics for one or more LinkedIn ad campaigns over a date range. |
| `li_list_creatives` | List creatives (ads) for a specific LinkedIn campaign. |

## Quick Start

Add to your MCP client config:

```json
{
  "mcpServers": {
    "linkedin_ads": {
      "url": "https://gateway.pipeworx.io/linkedin_ads/mcp"
    }
  }
}
```

Or use the CLI:

```bash
npx pipeworx use linkedin_ads
```

## License

MIT
