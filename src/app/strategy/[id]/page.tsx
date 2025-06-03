'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useStrategyDetails, useContentPillarAnalytics, useTemplateCategorizaton } from '@/hooks/useStrategy'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Target,
  Edit,
  BarChart3,
  FileText,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Settings,
  MessageSquare,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import type { ContentPillar } from '@/types/strategy'

const CONTENT_PILLAR_COLORS = {
  educational: 'bg-blue-100 text-blue-800 border-blue-200',
  promotional: 'bg-green-100 text-green-800 border-green-200',
  engagement: 'bg-purple-100 text-purple-800 border-purple-200',
  support: 'bg-orange-100 text-orange-800 border-orange-200'
}

const CONTENT_PILLAR_ICONS = {
  educational: '📚',
  promotional: '💰',
  engagement: '🤝',
  support: '🛠️'
}

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  archived: 'bg-red-100 text-red-800'
}

export default function StrategyDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const strategyId = params.id as string
  
  const { 
    strategy, 
    analytics, 
    segments, 
    templateCount, 
    loading, 
    error, 
    refresh 
  } = useStrategyDetails(strategyId)
  
  const { insights } = useContentPillarAnalytics(strategyId)
  const { autoCategorizeTemplates, loading: categorizingLoading } = useTemplateCategorizaton()
  
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await refresh()
    setRefreshing(false)
  }

  const handleAutoCategorize = async () => {
    try {
      const result = await autoCategorizeTemplates(strategyId)
      alert(`Successfully categorized ${result.categorized} templates. ${result.failed} failed.`)
      await refresh()
    } catch (error) {
      console.error('Auto-categorization failed:', error)
      alert('Failed to auto-categorize templates')
    }
  }

  if (loading) {
    return (
      <DashboardLayout
        title="Strategy Details"
        description="Manage and optimize your content strategy"
        icon={<Target className="h-8 w-8" />}
        gradient="purple"
      >
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-32 bg-gray-200"></Card>
            ))}
          </div>
          <Card className="h-64 bg-gray-200"></Card>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !strategy) {
    return (
      <DashboardLayout
        title="Strategy Details"
        description="Manage and optimize your content strategy"
        icon={<Target className="h-8 w-8" />}
        gradient="purple"
      >
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error || 'Strategy not found'}
          </AlertDescription>
        </Alert>
        <Link href="/strategy">
          <Button className="mt-4">
            Back to Strategy
          </Button>
        </Link>
      </DashboardLayout>
    )
  }

  const pillarDistribution = insights?.pillar_distribution || {
    educational: { count: 0, percentage: 0 },
    promotional: { count: 0, percentage: 0 },
    engagement: { count: 0, percentage: 0 },
    support: { count: 0, percentage: 0 }
  }

  const contentDistribution = strategy.content_distribution

  return (
    <DashboardLayout
      title={strategy.name}
      description={strategy.description || 'Strategy details and management'}
      icon={<Target className="h-8 w-8" />}
      gradient="purple"
    >
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <Badge className={STATUS_COLORS[strategy.status as keyof typeof STATUS_COLORS]}>
            {strategy.status}
          </Badge>
          <span className="text-sm text-gray-400">
            Created {new Date(strategy.created_at).toLocaleDateString()}
          </span>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleAutoCategorize}
            disabled={categorizingLoading}
          >
            <Settings className="h-4 w-4 mr-2" />
            {categorizingLoading ? 'Categorizing...' : 'Auto-Categorize'}
          </Button>
          <Button asChild>
            <Link href={`/strategy/${strategyId}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Strategy
            </Link>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-100">Total Templates</CardTitle>
            <FileText className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{templateCount}</div>
            <p className="text-xs text-gray-400">
              Strategy templates
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-100">Audience Segments</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{segments.length}</div>
            <p className="text-xs text-gray-400">
              Target segments
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-100">Content Balance</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {Object.values(pillarDistribution).reduce((sum, p) => sum + p.count, 0) > 0 ? '85%' : '0%'}
            </div>
            <p className="text-xs text-gray-400">
              Distribution health
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-100">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {analytics.length > 0 
                ? Math.round(analytics.reduce((sum, a) => sum + a.performance_score, 0) / analytics.length)
                : 0}%
            </div>
            <p className="text-xs text-gray-400">
              Average score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-900/90 backdrop-blur-sm border-gray-700/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300">Overview</TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300">Content Pillars</TabsTrigger>
          <TabsTrigger value="audience" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300">Audience</TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Business Objectives */}
            <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-100">
                  <Target className="h-5 w-5" />
                  <span>Business Objectives</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {strategy.business_objectives ? (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm text-gray-300">Primary Goal</h4>
                      <p className="text-sm text-gray-100">{strategy.business_objectives.primary_goal}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-300">Target Audience</h4>
                      <p className="text-sm text-gray-100">{strategy.business_objectives.target_audience}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-300">Value Proposition</h4>
                      <p className="text-sm text-gray-100">{strategy.business_objectives.value_proposition}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No business objectives defined</p>
                )}
              </CardContent>
            </Card>

            {/* Target Metrics */}
            <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-100">
                  <BarChart3 className="h-5 w-5" />
                  <span>Target Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {strategy.target_metrics ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-300">Response Rate</h4>
                      <p className="text-lg font-semibold text-white">{strategy.target_metrics.response_rate_target}%</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-300">Engagement Rate</h4>
                      <p className="text-lg font-semibold text-white">{strategy.target_metrics.engagement_rate_target}%</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-300">Conversion Rate</h4>
                      <p className="text-lg font-semibold text-white">{strategy.target_metrics.conversion_rate_target}%</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-300">Monthly Messages</h4>
                      <p className="text-lg font-semibold text-white">{strategy.target_metrics.monthly_message_target}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No target metrics defined</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Pillars Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-100">Content Distribution</CardTitle>
              <CardDescription className="text-gray-400">
                Current vs target content distribution across the four pillars
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {(Object.keys(contentDistribution) as ContentPillar[]).map((pillar) => {
                  const target = contentDistribution[pillar]
                  const actual = pillarDistribution[pillar]
                  const deviation = Math.abs(actual.percentage - target)
                  
                  let status: 'optimal' | 'needs_attention' | 'critical' = 'optimal'
                  if (deviation > 15) status = 'critical'
                  else if (deviation > 5) status = 'needs_attention'

                  return (
                    <div key={pillar} className="border border-gray-600 rounded-lg p-4 bg-gray-800/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">
                            {CONTENT_PILLAR_ICONS[pillar]}
                          </span>
                          <div>
                            <h3 className="font-medium capitalize text-gray-100">{pillar}</h3>
                            <p className="text-sm text-gray-400">
                              {actual.count} templates ({actual.percentage.toFixed(1)}%)
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            status === 'optimal' ? 'default' :
                            status === 'needs_attention' ? 'secondary' : 'destructive'
                          }
                        >
                          {status === 'optimal' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {status === 'needs_attention' && <Clock className="h-3 w-3 mr-1" />}
                          {status === 'critical' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-300">
                          <span>Target: {target}%</span>
                          <span>Actual: {actual.percentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={actual.percentage} className="h-2" />
                        {deviation > 5 && (
                          <p className="text-xs text-gray-400">
                            {actual.percentage < target 
                              ? `Need ${Math.ceil((target - actual.percentage) * templateCount / 100)} more templates`
                              : `${Math.ceil((actual.percentage - target) * templateCount / 100)} templates over target`
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-6">
          <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-100">Audience Segments</CardTitle>
              <CardDescription className="text-gray-400">
                Target audience segments for this strategy
              </CardDescription>
            </CardHeader>
            <CardContent>
              {segments.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-100 mb-2">No Audience Segments</h3>
                  <p className="text-gray-400 mb-4">Define your target audience segments to improve messaging effectiveness.</p>
                  <Button>Add Audience Segment</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {segments.map((segment) => (
                    <div key={segment.id} className="border border-gray-600 rounded-lg p-4 bg-gray-800/50">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-100">{segment.name}</h3>
                        <Badge variant="outline" className="border-gray-600 text-gray-300">Active</Badge>
                      </div>
                      <p className="text-sm text-gray-300 mb-3">{segment.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="font-medium text-gray-300 mb-1">Communication Preferences</h4>
                          <p className="text-gray-400">
                            {segment.communication_preferences?.message_frequency || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-300 mb-1">Preferred Channels</h4>
                          <div className="flex space-x-1">
                            {segment.communication_preferences?.preferred_channels?.map((channel: string) => (
                              <Badge key={channel} variant="outline" className="text-xs border-gray-600 text-gray-300">
                                {channel}
                              </Badge>
                            )) || <span className="text-gray-400">Not specified</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-100">Performance Analytics</CardTitle>
              <CardDescription className="text-gray-400">
                Content pillar performance and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-100 mb-2">No Performance Data</h3>
                  <p className="text-gray-400 mb-4">Performance analytics will appear here once you start using templates from this strategy.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analytics.map((analytic) => (
                    <div key={analytic.id} className="border border-gray-600 rounded-lg p-4 bg-gray-800/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">
                            {CONTENT_PILLAR_ICONS[analytic.pillar_type as ContentPillar]}
                          </span>
                          <h3 className="font-medium capitalize text-gray-100">{analytic.pillar_type}</h3>
                        </div>
                        <Badge variant="outline" className="border-gray-600 text-gray-300">
                          {analytic.performance_score.toFixed(1)}% score
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <h4 className="font-medium text-gray-300 mb-1">Templates</h4>
                          <p className="text-lg font-semibold text-white">{analytic.templates_count}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-300 mb-1">Engagement Rate</h4>
                          <p className="text-lg font-semibold text-white">{(analytic.engagement_rate * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-300 mb-1">Conversion Rate</h4>
                          <p className="text-lg font-semibold text-white">{(analytic.conversion_rate * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
} 