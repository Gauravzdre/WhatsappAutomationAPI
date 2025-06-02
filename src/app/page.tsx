'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import AIEnhancedBrandForm from '@/components/ai-enhanced-brand-form'
import { Navigation } from '@/components/layout/navigation'
import { 
  BarChart3, 
  Users, 
  Calendar, 
  MessageSquare, 
  ArrowRight, 
  Brain,
  Zap,
  Target,
  TrendingUp,
  Clock,
  Activity,
  Sparkles,
  Bot,
  Rocket,
  Star,
  Database,
  Globe,
  Shield,
  Building2,
  Palette,
  Settings,
  Menu,
  X
} from 'lucide-react'

interface BrandData {
  name: string
  industry: string
  description: string
  brandVoice: any
  visualIdentity: any
  targetAudience: any
  guidelines: string
  goals: string[]
  budget: number
}

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

export default function HomePage() {
  const [brandCreated, setBrandCreated] = useState(false)
  const [isCreatingBrand, setIsCreatingBrand] = useState(false)
  const [isCheckingBrand, setIsCheckingBrand] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Check authentication and brand status
  useEffect(() => {
    const checkAuthAndBrand = async () => {
      try {
        // Check authentication
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/login')
          return
        }
        
        setAuthenticated(true)

        // Check if brand already exists
        const response = await fetch('/api/brands')
        const data = await response.json()
        
        if (data.success && data.brand) {
          setBrandCreated(true)
          await fetchDashboardData()
        }
      } catch (error) {
        console.error('Error checking auth/brand:', error)
        router.push('/login')
      } finally {
        setIsCheckingBrand(false)
        setIsLoading(false)
      }
    }

    checkAuthAndBrand()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/login')
      } else if (event === 'SIGNED_IN') {
        setAuthenticated(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Helper function for safe querying
      const safeQuery = async (tableName: string, selectQuery: string, options: any = {}) => {
        try {
          return await supabase.from(tableName).select(selectQuery, options)
        } catch (error) {
          console.error(`Error querying ${tableName}:`, error)
          return { count: 0, data: [] }
        }
      }

      const tryMultipleTables = async (tableNames: string[], selectQuery: string, options: any = {}) => {
        for (const tableName of tableNames) {
          try {
            const result = await supabase.from(tableName).select(selectQuery, options)
            if (result.error) {
              if (result.error.code === '42P01') continue
              throw result.error
            }
            return result
          } catch (error) {
            continue
          }
        }
        return { count: 0, data: [] }
      }

      // Fetch all data in parallel
      const [
        clientsResult, 
        schedulesResult, 
        brandsResult, 
        agentsResult,
        messagesResult,
        contentResult,
        conversationsResult
      ] = await Promise.all([
        tryMultipleTables(['clients', 'customers'], 'id, created_at', { count: 'exact' }),
        safeQuery('schedules', 'id, last_sent, created_at', { count: 'exact' }),
        safeQuery('brands', 'id, name, created_at', { count: 'exact' }),
        safeQuery('ai_agents', 'id, type, status, created_at', { count: 'exact' }),
        safeQuery('messages', 'id, created_at, sender_type'),
        tryMultipleTables(['content_generation', 'brand_content'], 'id, created_at', { count: 'exact' }),
        safeQuery('conversations', 'id, status, created_at', { count: 'exact' })
      ])

      // Calculate metrics
      const totalClients = clientsResult.count || 0
      const totalSchedules = schedulesResult.count || 0
      const totalBrands = brandsResult.count || 0
      const totalAgents = agentsResult.count || 0
      const totalMessages = messagesResult.count || messagesResult.data?.length || 0
      const totalContent = contentResult.count || 0
      const totalConversations = conversationsResult.count || 0

      const activeAgents = agentsResult.data?.filter((a: any) => a.status === 'active').length || 0
      const pendingSchedules = schedulesResult.data?.filter((s: any) => !s.last_sent).length || 0
      const activeConversations = conversationsResult.data?.filter((c: any) => c.status === 'active').length || 0
      
      // Time-based calculations
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const todayMessages = messagesResult.data?.filter((m: any) => 
        new Date(m.created_at) >= today
      ).length || 0

      const todayContent = contentResult.data?.filter((c: any) => 
        new Date(c.created_at) >= today
      ).length || 0

      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)

      const weeklyMessages = messagesResult.data?.filter((m: any) => 
        new Date(m.created_at) > weekAgo
      ).length || 0

      const weeklyContent = contentResult.data?.filter((c: any) => 
        new Date(c.created_at) > weekAgo
      ).length || 0

      const recentConversations = conversationsResult.data?.filter((c: any) => {
        return new Date(c.created_at) > weekAgo
      }).length || 0

      const aiMessages = messagesResult.data?.filter((m: any) => m.sender_type === 'ai') || []
      const aiResponseRate = totalMessages > 0 ? ((aiMessages.length / totalMessages) * 100) : 0

      setDashboardData({
        totalClients,
        totalSchedules,
        totalBrands,
        totalAgents,
        activeAgents,
        totalMessages,
        totalContent,
        totalConversations,
        activeConversations,
        pendingSchedules,
        todayMessages,
        todayContent,
        weeklyMessages,
        weeklyContent,
        aiResponseRate,
        recentConversations
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const handleBrandSubmit = async (brandData: BrandData) => {
    setIsCreatingBrand(true)
    try {
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        setBrandCreated(true)
        await fetchDashboardData()
      } else {
        throw new Error(result.error || 'Failed to create brand')
      }
    } catch (error) {
      console.error('Error creating brand:', error)
    } finally {
      setIsCreatingBrand(false)
    }
  }

  const gradientClasses = {
    blue: 'from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900'
  }

  // Loading state
  if (isLoading || isCheckingBrand) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
        <EnhancedCard className="w-96 shadow-2xl border-0">
          <EnhancedCardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Loading...</h3>
            <p className="text-sm text-muted-foreground">
              {isCheckingBrand ? 'Checking your account status...' : 'Initializing dashboard...'}
            </p>
          </EnhancedCardContent>
        </EnhancedCard>
      </div>
    )
  }

  // Show auth redirect if not authenticated
  if (!authenticated) {
    return null
  }

  // Brand creation form view
  if (!brandCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <Navigation />
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  WhatsApp AI Automation
                </h1>
                <p className="text-sm text-muted-foreground">Powered by Julep AI Agents</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto py-8 px-4">
          <AIEnhancedBrandForm 
            onSubmit={handleBrandSubmit} 
            loading={isCreatingBrand}
          />
        </div>

        {/* Loading overlay */}
        {isCreatingBrand && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <EnhancedCard className="w-96 shadow-2xl border-0">
              <EnhancedCardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Creating Your AI-Enhanced Brand</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Analyzing your brand information</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Initializing AI agents</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Setting up intelligent workflows</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span>Configuring automation rules</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span>Optimizing for your audience</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-6">This may take a few moments...</p>
              </EnhancedCardContent>
            </EnhancedCard>
          </div>
        )}
      </div>
    )
  }

  // Enhanced Dashboard View
  return (
    <div className={`min-h-screen bg-gradient-to-br ${gradientClasses.blue}`}>
      <Navigation />
      
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white/80 backdrop-blur-sm"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Enhanced Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  AI Automation Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1 text-lg">
                  Your intelligent WhatsApp automation command center
                </p>
              </div>
            </div>
            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 rounded-full"></div>
          </div>
          
          {/* Dashboard Content */}
          <div className="space-y-6">
            {/* System Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <EnhancedCard variant="gradient" gradient="blue">
                <EnhancedCardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <EnhancedCardTitle className="text-lg text-white">System Status</EnhancedCardTitle>
                    <Shield className="h-6 w-6 text-blue-200" />
                  </div>
                </EnhancedCardHeader>
                <EnhancedCardContent>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
                    <span className="text-white font-medium">Operational</span>
                  </div>
                  <p className="text-blue-100 text-sm mt-1">All systems online</p>
                </EnhancedCardContent>
              </EnhancedCard>

              <EnhancedCard variant="gradient" gradient="green">
                <EnhancedCardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <EnhancedCardTitle className="text-lg text-white">Active Brands</EnhancedCardTitle>
                    <Sparkles className="h-6 w-6 text-green-200" />
                  </div>
                </EnhancedCardHeader>
                <EnhancedCardContent>
                  <div className="text-3xl font-bold text-white">{dashboardData?.totalBrands || 0}</div>
                  <p className="text-green-100 text-sm mt-1">AI-powered automation</p>
                </EnhancedCardContent>
              </EnhancedCard>

              <EnhancedCard variant="gradient" gradient="purple">
                <EnhancedCardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <EnhancedCardTitle className="text-lg text-white">AI Agents</EnhancedCardTitle>
                    <Bot className="h-6 w-6 text-purple-200" />
                  </div>
                </EnhancedCardHeader>
                <EnhancedCardContent>
                  <div className="text-3xl font-bold text-white">{dashboardData?.activeAgents || 0}</div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Progress 
                      value={dashboardData ? (dashboardData.activeAgents / Math.max(dashboardData.totalAgents, 1)) * 100 : 0} 
                      className="flex-1 h-2" 
                    />
                    <span className="text-xs text-purple-200">{dashboardData?.totalAgents || 0} total</span>
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <EnhancedCard variant="gradient" gradient="orange">
                <EnhancedCardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <EnhancedCardTitle className="text-lg text-white">Total Messages</EnhancedCardTitle>
                    <MessageSquare className="h-6 w-6 text-orange-200" />
                  </div>
                </EnhancedCardHeader>
                <EnhancedCardContent>
                  <div className="text-3xl font-bold text-white">{dashboardData?.totalMessages || 0}</div>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-orange-200" />
                    <span className="text-xs text-orange-200">{dashboardData?.todayMessages || 0} today</span>
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>

              <EnhancedCard variant="gradient" gradient="teal">
                <EnhancedCardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <EnhancedCardTitle className="text-lg text-white">Active Clients</EnhancedCardTitle>
                    <Users className="h-6 w-6 text-teal-200" />
                  </div>
                </EnhancedCardHeader>
                <EnhancedCardContent>
                  <div className="text-3xl font-bold text-white">{dashboardData?.totalClients || 0}</div>
                  <p className="text-teal-100 text-sm mt-1">{dashboardData?.activeConversations || 0} in conversations</p>
                </EnhancedCardContent>
              </EnhancedCard>

              <EnhancedCard variant="gradient" gradient="pink">
                <EnhancedCardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <EnhancedCardTitle className="text-lg text-white">Content Created</EnhancedCardTitle>
                    <Sparkles className="h-6 w-6 text-pink-200" />
                  </div>
                </EnhancedCardHeader>
                <EnhancedCardContent>
                  <div className="text-3xl font-bold text-white">{dashboardData?.totalContent || 0}</div>
                  <p className="text-pink-100 text-sm mt-1">{dashboardData?.todayContent || 0} generated today</p>
                </EnhancedCardContent>
              </EnhancedCard>

              <EnhancedCard variant="gradient" gradient="blue">
                <EnhancedCardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <EnhancedCardTitle className="text-lg text-white">Scheduled Messages</EnhancedCardTitle>
                    <Calendar className="h-6 w-6 text-blue-200" />
                  </div>
                </EnhancedCardHeader>
                <EnhancedCardContent>
                  <div className="text-3xl font-bold text-white">{dashboardData?.totalSchedules || 0}</div>
                  <p className="text-blue-100 text-sm mt-1">{dashboardData?.pendingSchedules || 0} pending</p>
                </EnhancedCardContent>
              </EnhancedCard>
            </div>

            {/* Performance Metrics and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <EnhancedCard variant="glass">
                <EnhancedCardHeader>
                  <EnhancedCardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <span>AI Performance</span>
                  </EnhancedCardTitle>
                </EnhancedCardHeader>
                <EnhancedCardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Response Rate</span>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        {dashboardData?.aiResponseRate.toFixed(1) || '0'}%
                      </Badge>
                    </div>
                    <Progress value={dashboardData?.aiResponseRate || 0} className="h-3" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Conversations</span>
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {dashboardData?.activeConversations || 0}
                      </Badge>
                    </div>
                    <Progress 
                      value={dashboardData ? (dashboardData.activeConversations / Math.max(dashboardData.totalConversations, 1)) * 100 : 0} 
                      className="h-3" 
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Weekly Activity</span>
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                        {(dashboardData?.weeklyMessages || 0) + (dashboardData?.weeklyContent || 0)} events
                      </Badge>
                    </div>
                    <Progress 
                      value={Math.min(((dashboardData?.weeklyMessages || 0) + (dashboardData?.weeklyContent || 0)) / 10, 100)} 
                      className="h-3" 
                    />
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>

              <EnhancedCard variant="glass">
                <EnhancedCardHeader>
                  <EnhancedCardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                    <Clock className="h-5 w-5 text-green-600" />
                    <span>Real-Time Activity</span>
                  </EnhancedCardTitle>
                </EnhancedCardHeader>
                <EnhancedCardContent>
                  <div className="space-y-4">
                    {dashboardData && dashboardData.totalMessages > 0 && (
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {dashboardData.totalMessages} total messages processed
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            AI-powered automation
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {dashboardData && dashboardData.totalContent > 0 && (
                      <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {dashboardData.totalContent} pieces of content generated
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            AI-powered content creation
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {dashboardData && dashboardData.recentConversations > 0 && (
                      <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {dashboardData.recentConversations} new conversations this week
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Active client engagement
                          </p>
                        </div>
                      </div>
                    )}

                    {!dashboardData || (dashboardData.totalMessages === 0 && dashboardData.totalContent === 0) && (
                      <div className="text-center py-4">
                        <Database className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No activity yet. Start by creating content or sending messages!
                        </p>
                      </div>
                    )}
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>
            </div>

            {/* Quick Actions */}
            <EnhancedCard variant="glass">
              <EnhancedCardHeader>
                <EnhancedCardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                  <Rocket className="h-6 w-6 text-blue-600" />
                  <span>AI Workspace - Quick Actions</span>
                </EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <a
                    href={dashboardData && dashboardData.totalBrands > 0 ? "/brand-setup?edit=true" : "/brand-setup"}
                    className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-white/10 transform -skew-y-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <Brain className="h-8 w-8" />
                        <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">
                        {dashboardData && dashboardData.totalBrands > 0 ? 'Edit Brand' : 'Create AI Brand'}
                      </h3>
                      <p className="text-blue-100 text-sm">
                        {dashboardData && dashboardData.totalBrands > 0 
                          ? 'Modify your brand identity and settings' 
                          : 'Launch intelligent brand automation'
                        }
                      </p>
                    </div>
                  </a>
                  
                  <a
                    href="/brand-content"
                    className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-xl text-white hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-white/10 transform -skew-y-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <Palette className="h-8 w-8" />
                        <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">Content Studio</h3>
                      <p className="text-emerald-100 text-sm">AI-powered content creation</p>
                    </div>
                  </a>

                  <a
                    href="/clients"
                    className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-white/10 transform -skew-y-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <Users className="h-8 w-8" />
                        <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">Manage Clients</h3>
                      <p className="text-purple-100 text-sm">Client relationship automation</p>
                    </div>
                  </a>
                  
                  <a
                    href="/schedules"
                    className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-white/10 transform -skew-y-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <Calendar className="h-8 w-8" />
                        <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">Smart Scheduling</h3>
                      <p className="text-orange-100 text-sm">AI-optimized message timing</p>
                    </div>
                  </a>

                  <a
                    href="/ai-agents"
                    className="group relative overflow-hidden bg-gradient-to-br from-pink-500 to-pink-600 p-6 rounded-xl text-white hover:from-pink-600 hover:to-pink-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-white/10 transform -skew-y-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <Bot className="h-8 w-8" />
                        <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">AI Agents</h3>
                      <p className="text-pink-100 text-sm">Configure AI automation</p>
                    </div>
                  </a>

                  <div className="group relative overflow-hidden bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl text-white">
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <BarChart3 className="h-8 w-8" />
                        <Badge className="bg-white/20 text-white text-xs">Coming Soon</Badge>
                      </div>
                      <h3 className="font-bold text-lg mb-2">Analytics Hub</h3>
                      <p className="text-yellow-100 text-sm">Advanced AI insights & reports</p>
                    </div>
                  </div>
                </div>
              </EnhancedCardContent>
            </EnhancedCard>
          </div>
        </div>
      </main>
      
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-600/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  )
} 