'use client'

import { useStrategyDashboard } from '@/hooks/useStrategy'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Target,
  Plus,
  BarChart3,
  FileText,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Lightbulb,
  Zap
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

export default function StrategyDashboard() {
  const { dashboard, loading, error, refresh } = useStrategyDashboard()

  if (loading) {
    return (
      <DashboardLayout
        title="Strategy Management"
        description="Create and manage your content strategies using AI-powered insights"
        icon={<Target className="h-8 w-8" />}
        gradient="purple"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout
        title="Strategy Management"
        description="Create and manage your content strategies using AI-powered insights"
        icon={<Target className="h-8 w-8" />}
        gradient="purple"
      >
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    )
  }

  const pillarHealth = dashboard?.content_pillar_health || []
  const quickActions = dashboard?.quick_actions || []

  return (
    <DashboardLayout
      title="Strategy Management"
      description="Create and manage your content strategies using AI-powered insights"
      icon={<Target className="h-8 w-8" />}
      gradient="purple"
    >
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-100">Active Strategies</CardTitle>
            <Target className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{dashboard?.strategy_overview?.active_strategies || 0}</div>
            <p className="text-xs text-gray-400">
              Strategy frameworks
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-100">Template Coverage</CardTitle>
            <FileText className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{Math.round((dashboard?.strategy_overview?.categorized_templates || 0) / (dashboard?.strategy_overview?.total_templates || 1) * 100)}%</div>
            <p className="text-xs text-gray-400">
              {dashboard?.strategy_overview?.categorized_templates || 0} of {dashboard?.strategy_overview?.total_templates || 0} categorized
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-100">Content Balance</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{dashboard?.strategy_overview?.content_distribution_health || 0}%</div>
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
            <div className="text-2xl font-bold text-white">{dashboard?.strategy_overview?.overall_performance_score || 0}%</div>
            <p className="text-xs text-gray-400">
              Overall score
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Content Pillar Health */}
        <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-100">
              <BarChart3 className="h-5 w-5" />
              <span>Content Pillar Health</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Distribution and performance across your content pillars
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pillarHealth.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-100 mb-2">No Content Pillars</h3>
                <p className="text-gray-400 mb-4">Create your first strategy to start tracking content performance.</p>
                <Link href="/strategy/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Strategy
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {pillarHealth.map((pillar) => (
                  <div key={pillar.pillar} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{CONTENT_PILLAR_ICONS[pillar.pillar as ContentPillar]}</span>
                        <span className="font-medium capitalize text-gray-100">{pillar.pillar}</span>
                        <Badge
                          variant={
                            pillar.status === 'optimal' ? 'default' :
                            pillar.status === 'needs_attention' ? 'secondary' : 'destructive'
                          }
                          className="text-xs"
                        >
                          {pillar.status === 'optimal' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {pillar.status === 'needs_attention' && <Clock className="h-3 w-3 mr-1" />}
                          {pillar.status === 'critical' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {pillar.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <span className="text-sm font-medium text-gray-100">{pillar.actual_percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={pillar.actual_percentage} className="h-2" />
                    <p className="text-xs text-gray-400">{pillar.template_count} templates</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-100">
              <Lightbulb className="h-5 w-5" />
              <span>Recommended Actions</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              AI-powered suggestions to optimize your strategy
            </CardDescription>
          </CardHeader>
          <CardContent>
            {quickActions.length === 0 ? (
              <div className="text-center py-8">
                <Zap className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-100 mb-2">All Optimized!</h3>
                <p className="text-gray-400">Your strategy is well-balanced. Keep up the great work!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-600">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-100">{action.title}</h4>
                      <p className="text-sm text-gray-300">{action.description}</p>
                    </div>
                    {action.type === 'create_template' && (
                      <Link href="/strategy/create">
                        <Button size="sm" variant="outline">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Strategies List */}
      <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700/50 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2 text-gray-100">
              <Users className="h-5 w-5" />
              <span>Your Strategies</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Manage and monitor your content strategies
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Link href="/strategy/templates">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                <FileText className="h-4 w-4 mr-2" />
                Templates
              </Button>
            </Link>
            <Link href="/strategy/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Strategy
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {dashboard?.strategy_overview?.active_strategies === 0 ? (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-100 mb-2">Get Started with Strategy</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Create your first content strategy to optimize messaging performance and maintain consistent brand voice across all channels.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/strategy/templates">
                  <Button size="lg" variant="outline" className="border-purple-400 text-purple-300 hover:bg-purple-900/20">
                    <FileText className="h-5 w-5 mr-2" />
                    Browse Templates
                  </Button>
                </Link>
                <Link href="/strategy/create">
                  <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Custom Strategy
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-100 mb-2">Strategies Active</h3>
              <p className="text-gray-400 mb-4">
                You have {dashboard?.strategy_overview?.active_strategies} active strategies running.
              </p>
              <div className="flex justify-center space-x-3">
                <Link href="/strategy/templates">
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                    <FileText className="h-4 w-4 mr-2" />
                    Browse Templates
                  </Button>
                </Link>
                <Link href="/strategy/create">
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Strategy
                  </Button>
                </Link>
                <Button className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
} 