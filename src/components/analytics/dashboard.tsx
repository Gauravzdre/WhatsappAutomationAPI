'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AnalyticsData {
  metrics: {
    totalMessages: number;
    messagesReceived: number;
    messagesSent: number;
    averageResponseTime: number;
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    userRetention: number;
    automationTriggers: number;
    automationSuccess: number;
    automationFailures: number;
    aiResponses: number;
    aiSuccessRate: number;
    averageAiConfidence: number;
    topFlows: Array<{ flowId: string; name: string; triggers: number }>;
    platformBreakdown: Array<{ platform: string; messages: number; users: number }>;
    hourlyActivity: Array<{ hour: number; messages: number; users: number }>;
    dailyActivity: Array<{ date: string; messages: number; users: number; newUsers: number }>;
  };
  realtime: {
    totalEvents: number;
    recentActivity: number;
    activeUsers: number;
  };
  contacts: {
    totalContacts: number;
    activeContacts: number;
    newContacts: number;
    blockedContacts: number;
    segmentBreakdown: Array<{ segment: string; count: number; percentage: number }>;
    topTags: Array<{ tag: string; count: number }>;
  };
  flows: Array<{
    flowId: string;
    name: string;
    triggered: number;
    completed: number;
    successRate: number;
  }>;
  timeRange: string;
  timestamp: string;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?action=dashboard&timeRange=${timeRange}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch analytics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAnalytics();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, timeRange]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatPercentage = (num: number): string => {
    return `${Math.round(num)}%`;
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading analytics: {error}</p>
          <Button onClick={fetchAnalytics}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Real-time insights into your automation platform</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
            size="sm"
          >
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </Button>
          <Button onClick={fetchAnalytics} size="sm" disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Real-time Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Real-time Activity
          </CardTitle>
          <CardDescription>Live statistics from the last 5 minutes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{data.realtime.totalEvents}</div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{data.realtime.recentActivity}</div>
              <div className="text-sm text-gray-600">Recent Activity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{data.realtime.activeUsers}</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.metrics.totalMessages)}</div>
            <div className="text-xs text-gray-500 mt-1">
              {formatNumber(data.metrics.messagesReceived)} received • {formatNumber(data.metrics.messagesSent)} sent
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.metrics.activeUsers)}</div>
            <div className="text-xs text-gray-500 mt-1">
              {formatNumber(data.metrics.newUsers)} new users
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(data.metrics.averageResponseTime)}</div>
            <div className="text-xs text-gray-500 mt-1">
              Average response time
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">AI Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(data.metrics.aiSuccessRate)}</div>
            <div className="text-xs text-gray-500 mt-1">
              {formatNumber(data.metrics.aiResponses)} AI responses
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automation Flows */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Flows</CardTitle>
          <CardDescription>Performance of your automation flows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.flows.map((flow) => (
              <div key={flow.flowId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{flow.name}</div>
                  <div className="text-sm text-gray-600">
                    {flow.triggered} triggers • {flow.completed} completed
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={flow.successRate >= 80 ? "default" : flow.successRate >= 60 ? "secondary" : "destructive"}>
                    {formatPercentage(flow.successRate)} success
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Segments */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Segments</CardTitle>
          <CardDescription>Distribution of your contacts across segments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.contacts.segmentBreakdown.map((segment) => (
              <div key={segment.segment} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold">{segment.count}</div>
                <div className="text-sm text-gray-600 capitalize">{segment.segment}</div>
                <div className="text-xs text-gray-500">{formatPercentage(segment.percentage)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Activity</CardTitle>
          <CardDescription>Messages and users by platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.metrics.platformBreakdown.map((platform) => (
              <div key={platform.platform} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <div>
                    <div className="font-medium capitalize">{platform.platform}</div>
                    <div className="text-sm text-gray-600">{platform.users} users</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatNumber(platform.messages)}</div>
                  <div className="text-sm text-gray-600">messages</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Tags */}
      {data.contacts.topTags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Popular Tags</CardTitle>
            <CardDescription>Most frequently used contact tags</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.contacts.topTags.slice(0, 10).map((tag) => (
                <Badge key={tag.tag} variant="outline" className="text-sm">
                  {tag.tag} ({tag.count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {new Date(data.timestamp).toLocaleString()}
      </div>
    </div>
  );
} 