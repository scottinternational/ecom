import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { mcpClient } from '@/lib/mcp';

export function MCPTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [tables, setTables] = useState<string[]>([]);
  const [mcpStatus, setMcpStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const testMCPConnection = async () => {
    setIsLoading(true);
    setMcpStatus('testing');
    
    try {
      // Test MCP connection by listing tables
      const result = await mcpClient.listTables();
      setTables(result);
      setMcpStatus('success');
      toast.success('MCP connection successful!');
    } catch (error) {
      console.error('MCP test failed:', error);
      setMcpStatus('error');
      toast.error('MCP connection failed. Check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const testDatabaseQuery = async () => {
    setIsLoading(true);
    
    try {
      const result = await mcpClient.executeQuery({
        table: 'users',
        operation: 'select',
        limit: 5
      });
      
      toast.success('Database query executed successfully!');
      console.log('Query result:', result);
    } catch (error) {
      console.error('Database query failed:', error);
      toast.error('Database query failed. Check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Supabase MCP Integration Test</CardTitle>
          <CardDescription>
            Test the Model Context Protocol integration with your Supabase database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={testMCPConnection}
              disabled={isLoading}
              variant="default"
            >
              {isLoading ? 'Testing...' : 'Test MCP Connection'}
            </Button>
            
            <Button 
              onClick={testDatabaseQuery}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? 'Querying...' : 'Test Database Query'}
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">MCP Status:</h4>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                mcpStatus === 'idle' ? 'bg-gray-300' :
                mcpStatus === 'testing' ? 'bg-yellow-500' :
                mcpStatus === 'success' ? 'bg-green-500' :
                'bg-red-500'
              }`} />
              <span className="text-sm capitalize">{mcpStatus}</span>
            </div>
          </div>

          {tables.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Available Tables:</h4>
              <div className="grid grid-cols-2 gap-2">
                {tables.map((table, index) => (
                  <div key={index} className="text-sm bg-gray-100 p-2 rounded">
                    {table}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>MCP Configuration</CardTitle>
          <CardDescription>
            Current MCP server configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Server:</strong> @supabase/mcp-server-supabase
            </div>
            <div>
              <strong>URL:</strong> https://idmbhgegrfohkdfeekgk.supabase.co
            </div>
            <div>
              <strong>Status:</strong> {mcpStatus === 'success' ? 'Connected' : 'Not connected'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default MCPTest;
