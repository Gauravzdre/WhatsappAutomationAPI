'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  Clock, 
  TrendingUp, 
  MessageCircle, 
  Target, 
  Calendar,
  BarChart3,
  RefreshCw,
  Download
} from 'lucide-react'

interface ScheduleAnalyticsProps {
  scheduleId?: string
  className?: string
}

interface AnalyticsData {
  totalMessages: number
  responsesReceived: number
  responseRate: number
  averageResponseTime: number
  hourlyPerformance: { [hour: number]: { sent: number, responses: number } }
  bestPerformingHours: Array<{
    hour: number
    responseRate: number
    messageCount: number
  }>
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0']

export function ScheduleAnalytics({ scheduleId, className }: ScheduleAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAnalytics()
  }, [scheduleId])

  const loadAnalytics = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const url = scheduleId 
        ? `/api/smart-scheduling/optimize?scheduleId=${scheduleId}`
        : '/api/smart-scheduling/optimize'
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        setAnalytics(data.analytics)
      } else {
        setError(data.error || 'Failed to load analytics')
      }
    } catch (err) {
      setError('Failed to connect to analytics service')
      console.error('Analytics loading error:', err)
    } finally {
      setLoading(false)
    }
  }

  const exportAnalytics = () => {
    if (!analytics) return
    
    const csvData = [
      ['Metric', 'Value'],
      ['Total Messages', analytics.totalMessages],
      ['Responses Received', analytics.responsesReceived],
      ['Response Rate', `${(analytics.responseRate * 100).toFixed(2)}%`],
      ['Average Response Time', `${Math.round(analytics.averageResponseTime / 60)} minutes`],
      [''],
      ['Hour', 'Messages Sent', 'Responses', 'Response Rate'],
      ...Object.entries(analytics.hourlyPerformance).map(([hour, data]) => [
        `${hour}:00`,
        data.sent,
        data.responses,
        `${((data.responses / Math.max(data.sent, 1)) * 100).toFixed(2)}%`
      ])
    ]
    
    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `schedule-analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 animate-pulse text-blue-600" />
            <span className="text-gray-600 dark:text-gray-300">Loading analytics...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={loadAnalytics} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No analytics data available</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Send some scheduled messages to see performance data
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare chart data
  const hourlyChartData = Object.entries(analytics.hourlyPerformance).map(([hour, data]) => ({
    hour: `${hour}:00`,
    sent: data.sent,
    responses: data.responses,
    responseRate: ((data.responses / Math.max(data.sent, 1)) * 100).toFixed(1)
  })).sort((a, b) => parseInt(a.hour) - parseInt(b.hour))

  const performanceData = analytics.bestPerformingHours.map((item, index) => ({
    name: `${item.hour}:00`,
    value: item.responseRate * 100,
    messages: item.messageCount
  }))

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Schedule Performance Analytics
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {scheduleId ? 'Individual schedule performance' : 'Overall schedule performance'} over the last 30 days
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={loadAnalytics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportAnalytics} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Messages
              </CardTitle>
              <MessageCircle className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {analytics.totalMessages.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Response Rate
              </CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {(analytics.responseRate * 100).toFixed(1)}%
            </div>
            <Badge 
              variant={analytics.responseRate > 0.3 ? "default" : "secondary"}
              className="mt-1"
            >
              {analytics.responseRate > 0.3 ? 'Good' : 'Needs Improvement'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg Response Time
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round(analytics.averageResponseTime / 60)}m
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {analytics.averageResponseTime} seconds
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Best Hour
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {analytics.bestPerformingHours[0]?.hour || 'N/A'}:00
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {((analytics.bestPerformingHours[0]?.responseRate || 0) * 100).toFixed(1)}% response rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Hourly Message Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'responseRate' ? `${value}%` : value,
                    name === 'sent' ? 'Messages Sent' : 
                    name === 'responses' ? 'Responses' : 'Response Rate'
                  ]}
                />
                <Bar dataKey="sent" fill="#8884d8" name="sent" />
                <Bar dataKey="responses" fill="#82ca9d" name="responses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Response Rate Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Response Rate by Hour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Response Rate']} />
                <Line 
                  type="monotone" 
                  dataKey="responseRate" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: '#8884d8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Best Performing Hours */}
      {analytics.bestPerformingHours.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Top Performing Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analytics.bestPerformingHours.map((hour, index) => (
                <div 
                  key={hour.hour}
                  className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {hour.hour}:00
                    </span>
                    <Badge variant={index === 0 ? "default" : "secondary"}>
                      #{index + 1}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Response Rate: <span className="font-medium">{(hour.responseRate * 100).toFixed(1)}%</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Messages: <span className="font-medium">{hour.messageCount}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 