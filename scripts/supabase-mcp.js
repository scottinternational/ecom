#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Supabase MCP Server configuration
const config = {
  command: 'npx',
  args: ['@supabase/mcp-server-supabase'],
  env: {
    ...process.env,
    SUPABASE_URL: "https://idmbhgegrfohkdfeekgk.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkbWJoZ2VncmZvaGtkZmVla2drIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTMyNjY1MCwiZXhwIjoyMDcwOTAyNjUwfQ.4_n0Q-2EEeuDBM7l2b6UI5Ua7hqINaZ4LBt_Yk6BNK0"
  }
};

console.log('Starting Supabase MCP Server...');
console.log('URL:', config.env.SUPABASE_URL);

const child = spawn(config.command, config.args, {
  env: config.env,
  stdio: ['inherit', 'inherit', 'inherit']
});

child.on('error', (error) => {
  console.error('Failed to start Supabase MCP Server:', error);
  process.exit(1);
});

child.on('close', (code) => {
  console.log(`Supabase MCP Server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down Supabase MCP Server...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\nShutting down Supabase MCP Server...');
  child.kill('SIGTERM');
});
