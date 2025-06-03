'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  MessageSquare, 
  Bot,
  Calendar,
  Target,
  Lightbulb,
  BarChart3,
  LineChart,
  PieChart,
  Download,
  RefreshCw,
  Zap
} from 'lucide-react'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts'
import { PerformanceInsight, PerformancePrediction, PerformanceReport } from '@/lib/performance-insights'

interface PerformanceInsightsDashboardProps {
  className?: string
}

export function PerformanceInsightsDashboard({ className }: PerformanceInsightsDashboardProps) {
  const [insights, setInsights] = useState<PerformanceInsight[]>([])
  const [predictions, setPredictions] = useState<PerformancePrediction[]>([])
  const [reports, setReports] = useState<PerformanceReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | '90d'>('30d')
  const [selectedTab, setSelectedTab] = useState('insights')

  useEffect(() => {
    loadPerformanceData()
  }, [timeframe])

  const loadPerformanceData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load insights
      const insightsResponse = await fetch(`/api/performance-insights?action=insights&timeframe=${timeframe}`)
      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json()
        setInsights(insightsData.data.insights || [])
      }

      // Load predictions
      const predictionsResponse = await fetch(`/api/performance-insights?action=predictions&predictionPeriod=${timeframe}`)
      if (predictionsResponse.ok) {
        const predictionsData = await predictionsResponse.json()
        setPredictions(predictionsData.data.predictions || [])
      }

      // Load recent reports
      const reportsResponse = await fetch(`/api/performance-insights?action=reports&limit=5`)
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json()
        setReports(reportsData.data.reports || [])
      }
    } catch (err) {
      console.error('Error loading performance data:', err)
      setError('Failed to load performance insights')
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/performance-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_report',
          reportType: 'weekly'
        })
      })

      if (response.ok) {
        await loadPerformanceData()
      }
    } catch (err) {
      console.error('Error generating report:', err)
      setError('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'trend': return <LineChart className="h-4 w-4 text-blue-500" />
      case 'anomaly': return <Zap className="h-4 w-4 text-purple-500" />
      case 'prediction': return <Target className="h-4 w-4 text-indigo-500" />
      default: return <BarChart3 className="h-4 w-4 text-gray-500" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'engagement': return <MessageSquare className="h-4 w-4" />
      case 'automation': return <Bot className="h-4 w-4" />
      case 'ai_performance': return <Bot className="h-4 w-4" />
      case 'user_behavior': return <Users className="h-4 w-4" />
      case 'scheduling': return <Calendar className="h-4 w-4" />
      default: return <BarChart3 className="h-4 w-4" />
    }
  }

  if (loading && insights.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Performance Insights</h2>
            <p className="text-muted-foreground">AI-powered business intelligence and recommendations</p>
          </div>
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading insights...</span>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Error:</strong> {error}
        </AlertDescription>
      </Alert>
    )
  }

  const highImpactInsights = insights.filter(i => i.impact === 'high')
  const opportunities = insights.filter(i => i.type === 'opportunity')
  const warnings = insights.filter(i => i.type === 'warning')

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Insights</h2>
          <p className="text-muted-foreground">AI-powered business intelligence and recommendations</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadPerformanceData} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={generateReport} disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.length}</div>
            <p className="text-xs text-muted-foreground">
              {highImpactInsights.length} high impact
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{opportunities.length}</div>
            <p className="text-xs text-muted-foreground">
              Growth opportunities identified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{warnings.length}</div>
            <p className="text-xs text-muted-foreground">
              Issues requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predictions</CardTitle>
            <Target className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{predictions.length}</div>
            <p className="text-xs text-muted-foreground">
              Future performance forecasts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {insights.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Insights Available</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  We need more data to generate meaningful insights. Keep using the platform and check back soon.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {insights.map((insight) => (
                <Card key={insight.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getInsightIcon(insight.type)}
                        <div>
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                          <CardDescription className="flex items-center space-x-2 mt-1">
                            {getCategoryIcon(insight.category)}
                            <span className="capitalize">{insight.category.replace('_', ' ')}</span>
                            <Badge variant={getImpactColor(insight.impact) as any}>
                              {insight.impact} impact
                            </Badge>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {(insight.confidence * 100).toFixed(0)}% confidence
                        </div>
                        <Progress value={insight.confidence * 100} className="w-20 mt-1" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{insight.description}</p>
                    
                    {insight.metrics && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-muted/50 rounded-lg">
                        <div>
                          <div className="text-sm text-muted-foreground">Current</div>
                          <div className="font-semibold">{insight.metrics.current.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Previous</div>
                          <div className="font-semibold">{insight.metrics.previous.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Change</div>
                          <div className={`font-semibold ${insight.metrics.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {insight.metrics.change >= 0 ? '+' : ''}{insight.metrics.change.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Change %</div>
                          <div className={`font-semibold ${insight.metrics.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {insight.metrics.changePercent >= 0 ? '+' : ''}{insight.metrics.changePercent.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    )}

                    {insight.actionable && insight.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center">
                          <Lightbulb className="h-4 w-4 mr-2" />
                          Recommendations
                        </h4>
                        <ul className="space-y-1">
                          {insight.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          {predictions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Predictions Available</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Predictions require historical data. Continue using the platform to enable forecasting.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {predictions.map((prediction, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="h-5 w-5" />
                        <span>{prediction.metric}</span>
                      </CardTitle>
                      <Badge variant="outline">{prediction.timeframe}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Current</div>
                        <div className="text-2xl font-bold">{prediction.currentValue.toFixed(2)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Predicted</div>
                        <div className="text-2xl font-bold text-blue-600">{prediction.predictedValue.toFixed(2)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Confidence</div>
                        <div className="text-2xl font-bold">{(prediction.confidence * 100).toFixed(0)}%</div>
                      </div>
                    </div>

                    <div className="border-t my-4" />

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Key Factors</h4>
                        <div className="flex flex-wrap gap-2">
                          {prediction.factors.map((factor, i) => (
                            <Badge key={i} variant="secondary">{factor}</Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Recommendations</h4>
                        <ul className="space-y-1">
                          {prediction.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {reports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <PieChart className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Reports Generated</h3>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                  Generate your first performance report to get comprehensive insights.
                </p>
                <Button onClick={generateReport} disabled={loading}>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="capitalize">{report.reportType} Report</CardTitle>
                        <CardDescription>
                          {new Date(report.periodStart).toLocaleDateString()} - {new Date(report.periodEnd).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {report.aiGenerated && (
                          <Badge variant="secondary">
                            <Bot className="h-3 w-3 mr-1" />
                            AI Generated
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {report.insights.length} insights
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">Response Rate</div>
                        <div className="text-lg font-bold">{(report.keyMetrics.engagement.responseRate * 100).toFixed(1)}%</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">Automation Success</div>
                        <div className="text-lg font-bold">{(report.keyMetrics.automation.successRate * 100).toFixed(1)}%</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">AI Success Rate</div>
                        <div className="text-lg font-bold">{(report.keyMetrics.ai.successRate * 100).toFixed(1)}%</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">User Growth</div>
                        <div className="text-lg font-bold">+{report.keyMetrics.growth.userGrowth}</div>
                      </div>
                    </div>

                    {report.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Top Recommendations</h4>
                        <div className="space-y-2">
                          {report.recommendations.slice(0, 3).map((rec, index) => (
                            <div key={index} className="flex items-start space-x-2 p-2 bg-muted/30 rounded">
                              <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                                {rec.priority}
                              </Badge>
                              <div className="flex-1">
                                <div className="font-medium">{rec.title}</div>
                                <div className="text-sm text-muted-foreground">{rec.description}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 