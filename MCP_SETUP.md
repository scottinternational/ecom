# Supabase MCP Integration Setup

This guide explains how to set up and use the Supabase MCP (Model Context Protocol) integration with your project.

## What is MCP?

MCP (Model Context Protocol) allows AI assistants to interact with your Supabase database directly, enabling them to:
- Query your database schema
- Execute CRUD operations
- Analyze data
- Generate insights
- Help with database management

## Setup Instructions

### 1. Install the Supabase MCP Server

The MCP server is configured to run via npx, so no local installation is required. The configuration is already set up in:

- `c:\Users\mukes\.cursor\mcp.json` (global Cursor configuration)
- `mcp-config.json` (local project configuration)

### 2. Environment Variables

The following environment variables are configured:

```env
SUPABASE_URL=https://idmbhgegrfohkdfeekgk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkbWJoZ2VncmZvaGtkZmVla2drIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTMyNjY1MCwiZXhwIjoyMDcwOTAyNjUwfQ.4_n0Q-2EEeuDBM7l2b6UI5Ua7hqINaZ4LBt_Yk6BNK0
```

### 3. Running the MCP Server

You can start the MCP server using the provided script:

```bash
yarn mcp:supabase
```

Or manually:

```bash
npx @supabase/mcp-server-supabase
```

### 4. Using MCP in Your Code

The MCP client is available at `src/lib/mcp.ts`. You can import and use it in your components:

```typescript
import { mcpClient } from '@/lib/mcp';

// Example: List all tables
const tables = await mcpClient.listTables();

// Example: Execute a custom query
const result = await mcpClient.executeQuery({
  table: 'users',
  operation: 'select',
  filters: { role: 'admin' },
  limit: 10
});
```

## MCP Configuration Files

### Global Configuration (`c:\Users\mukes\.cursor\mcp.json`)

This file configures MCP for Cursor globally:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["@supabase/mcp-server-supabase"],
      "env": {
        "SUPABASE_URL": "your-supabase-url",
        "SUPABASE_ANON_KEY": "your-supabase-anon-key"
      }
    }
  }
}
```

### Local Configuration (`mcp-config.json`)

This file provides a local reference for the MCP configuration.

## Available MCP Commands

Once the MCP server is running, you can use these commands in your AI assistant:

- **Database Queries**: Execute SELECT, INSERT, UPDATE, DELETE operations
- **Schema Analysis**: Get table structures and relationships
- **Data Insights**: Analyze data patterns and generate reports
- **Database Management**: Help with migrations and schema changes

## Security Considerations

1. **API Keys**: The anon key is used for MCP operations. Ensure it has appropriate RLS policies.
2. **Permissions**: MCP operations respect your Supabase RLS (Row Level Security) policies.
3. **Environment**: Keep your Supabase credentials secure and never commit them to version control.

## Troubleshooting

### Common Issues

1. **MCP Server Not Starting**
   - Ensure you have Node.js installed
   - Check that npx is available
   - Verify your Supabase credentials are correct

2. **Permission Errors**
   - Check your Supabase RLS policies
   - Verify the anon key has appropriate permissions

3. **Connection Issues**
   - Ensure your Supabase project is active
   - Check network connectivity
   - Verify the Supabase URL is correct

### Getting Help

- Check the Supabase MCP documentation
- Review your Supabase project settings
- Check the MCP server logs for error messages

## Next Steps

1. Start the MCP server: `yarn mcp:supabase`
2. Test the connection by asking your AI assistant to list your database tables
3. Begin using MCP for database operations and analysis

## Files Created

- `mcp-config.json` - Local MCP configuration
- `scripts/supabase-mcp.js` - MCP server runner script
- `src/lib/mcp.ts` - TypeScript MCP client utilities
- `MCP_SETUP.md` - This documentation file

The global MCP configuration has been updated in `c:\Users\mukes\.cursor\mcp.json`.
