'use client'

import { useState, useEffect } from 'react'
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowRight, 
  Brain,
  MessageSquare, 
  Users, 
  Calendar, 
  TrendingUp,
  Clock,
  Activity,
  Sparkles,
  Bot,
  Rocket,
  Star,
  Database,
  Shield,
  Palette,
  ChevronRight,
  Plus,
  Zap,
  Target,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Eye,
  Settings
} from 'lucide-react'

interface DashboardData {
  totalClients: number
  totalSchedules: number
  totalBrands: number
  totalAgents: number
  activeAgents: number
  totalMessages: number
  totalContent: number
  totalConversations: number
  activeConversations: number
  pendingSchedules: number
  todayMessages: number
  todayContent: number
  weeklyMessages: number
  weeklyContent: number
  aiResponseRate: number
  recentConversations: number
}

interface QuickAction {
  id: string
  title: string
  description: string
  href: string
  icon: any
  gradient: string
  priority: 'high' | 'medium' | 'low'
  isNew?: boolean
  isCompleted?: boolean
}

interface ImprovedDashboardProps {
  dashboardData: DashboardData | null
  brandExists: boolean
}

export default function ImprovedDashboard({ dashboardData, brandExists }: ImprovedDashboardProps) {
  const [activeView, setActiveView] = useState<'overview' | 'detailed'>('overview')
  const [showAllActions, setShowAllActions] = useState(false)

  // Define quick actions based on user progress
  const quickActions: QuickAction[] = [
    {
      id: 'brand-setup',
      title: brandExists ? 'Edit Brand Settings' : 'Complete Brand Setup',
      description: brandExists ? 'Modify your brand identity and voice' : 'Set up your brand identity and voice',
      href: brandExists ? '/brand-setup?edit=true' : '/brand-setup',
      icon: Brain,
      gradient: 'from-blue-500 to-blue-600',
      priority: brandExists ? 'medium' : 'high',
      isCompleted: brandExists
    },
    {
      id: 'templates',
      title: 'Create Message Templates',
      description: 'Build reusable templates for automation',
      href: '/templates',
      icon: MessageSquare,
      gradient: 'from-emerald-500 to-emerald-600',
      priority: 'high'
    },
    {
      id: 'social-posts',
      title: 'Social Media Posts',
      description: 'Schedule posts with AI scoring',
      href: '/social-posts',
      icon: Calendar,
      gradient: 'from-indigo-500 to-indigo-600',
      priority: 'high',
      isNew: true
    },
    {
      id: 'content-studio',
      title: 'AI Content Studio',
      description: 'Generate AI-powered content',
      href: '/brand-content',
      icon: Palette,
      gradient: 'from-purple-500 to-purple-600',
      priority: 'medium'
    },
    {
      id: 'clients',
      title: 'Manage Clients',
      description: 'Add and organize your client contacts',
      href: '/clients',
      icon: Users,
      gradient: 'from-teal-500 to-teal-600',
      priority: 'medium'
    },
    {
      id: 'ai-agents',
      title: 'Configure AI Agents',
      description: 'Set up intelligent automation',
      href: '/ai-agents',
      icon: Bot,
      gradient: 'from-pink-500 to-pink-600',
      priority: 'medium'
    },
    {
      id: 'schedules',
      title: 'Smart Scheduling',
      description: 'Schedule automated messages',
      href: '/schedules',
      icon: Calendar,
      gradient: 'from-orange-500 to-orange-600',
      priority: 'low'
    }
  ]

  // Sort actions by priority and completion status
  const sortedActions = quickActions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1
    }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })

  const primaryActions = sortedActions.slice(0, 3)
  const secondaryActions = sortedActions.slice(3)

  // Calculate setup completion percentage
  const completedActions = quickActions.filter(action => action.isCompleted).length
  const setupProgress = (completedActions / quickActions.length) * 100

  // Check if user is new (no data)
  const isNewUser = !dashboardData || (
    dashboardData.totalMessages === 0 && 
    dashboardData.totalContent === 0 && 
    dashboardData.totalClients === 0
  )

  return (
    <div className="space-y-6">
      {/* Welcome Section for New Users */}
      {isNewUser && (
        <EnhancedCard variant="gradient" gradient="blue" className="border-0">
          <EnhancedCardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-2">
                  Welcome to WhatsApp AI Automation! 🎉
                </h2>
                <p className="text-blue-100 mb-4">
                  Let's get you set up in just a few minutes. Complete these steps to start automating your messages.
                </p>
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm text-blue-100 mb-1">
                      <span>Setup Progress</span>
                      <span>{Math.round(setupProgress)}%</span>
                    </div>
                    <Progress value={setupProgress} className="h-2 bg-white/20" />
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30">
                    {completedActions}/{quickActions.length} complete
                  </Badge>
                </div>
              </div>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>
      )}

      {/* Quick Actions - Primary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {primaryActions.map((action) => {
          const Icon = action.icon
          return (
            <a
              key={action.id}
              href={action.href}
              className="group relative overflow-hidden bg-gradient-to-br p-6 rounded-xl text-white hover:scale-105 transition-all duration-300 hover:shadow-2xl"
              style={{ background: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient}`} />
              <div className="absolute inset-0 bg-white/10 transform -skew-y-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-6 h-6" />
                    {action.isNew && (
                      <Badge className="bg-white/20 text-white text-xs border-white/30">
                        New
                      </Badge>
                    )}
                    {action.isCompleted && (
                      <CheckCircle className="w-4 h-4 text-green-300" />
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <h3 className="font-bold text-lg mb-2">{action.title}</h3>
                <p className="text-white/80 text-sm">{action.description}</p>
                
                {action.priority === 'high' && !action.isCompleted && (
                  <div className="mt-3">
                    <Badge className="bg-yellow-400/20 text-yellow-100 border-yellow-300/30 text-xs">
                      Recommended Next
                    </Badge>
                  </div>
                )}
              </div>
            </a>
          )
        })}
      </div>

      {/* System Status - Simplified for Overview */}
      {!isNewUser && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <EnhancedCard variant="glass">
            <EnhancedCardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardData?.totalMessages || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Messages</p>
                </div>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>

          <EnhancedCard variant="glass">
            <EnhancedCardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardData?.totalClients || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Clients</p>
                </div>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>

          <EnhancedCard variant="glass">
            <EnhancedCardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardData?.activeAgents || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">AI Agents</p>
                </div>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>

          <EnhancedCard variant="glass">
            <EnhancedCardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardData?.aiResponseRate || 0}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                </div>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        </div>
      )}

      {/* More Actions - Collapsible */}
      {secondaryActions.length > 0 && (
        <EnhancedCard variant="glass">
          <EnhancedCardHeader>
            <div className="flex items-center justify-between">
              <EnhancedCardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span>More Actions</span>
              </EnhancedCardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllActions(!showAllActions)}
              >
                {showAllActions ? 'Show Less' : 'Show More'}
                <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${showAllActions ? 'rotate-90' : ''}`} />
              </Button>
            </div>
          </EnhancedCardHeader>
          
          {showAllActions && (
            <EnhancedCardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {secondaryActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <a
                      key={action.id}
                      href={action.href}
                      className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                    >
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${action.gradient}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {action.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {action.description}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </a>
                  )
                })}
              </div>
            </EnhancedCardContent>
          )}
        </EnhancedCard>
      )}

      {/* Recent Activity - Only show if there's data */}
      {!isNewUser && dashboardData && (dashboardData.totalMessages > 0 || dashboardData.totalContent > 0) && (
        <EnhancedCard variant="glass">
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span>Recent Activity</span>
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="space-y-3">
              {dashboardData.totalMessages > 0 && (
                <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {dashboardData.totalMessages} messages processed
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {dashboardData.todayMessages} today
                    </p>
                  </div>
                </div>
              )}
              
              {dashboardData.totalContent > 0 && (
                <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {dashboardData.totalContent} content pieces generated
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      AI-powered content creation
                    </p>
                  </div>
                </div>
              )}
            </div>
          </EnhancedCardContent>
        </EnhancedCard>
      )}

      {/* Empty State for New Users */}
      {isNewUser && (
        <EnhancedCard variant="glass">
          <EnhancedCardContent className="text-center py-8">
            <Database className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              Ready to Get Started?
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Complete the setup steps above to start automating your WhatsApp messages with AI. 
              It only takes a few minutes!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600">
                <a href={brandExists ? '/templates' : '/brand-setup'}>
                  <Rocket className="w-4 h-4 mr-2" />
                  {brandExists ? 'Create Templates' : 'Start Setup'}
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/onboarding">
                  <Eye className="w-4 h-4 mr-2" />
                  Take a Tour
                </a>
              </Button>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>
      )}
    </div>
  )
} 