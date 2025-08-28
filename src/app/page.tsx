'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Force dynamic rendering since we use authentication
export const dynamic = 'force-dynamic'
import { useRouter } from 'next/navigation'
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import AIEnhancedBrandForm from '@/components/ai-enhanced-brand-form'
import { Navigation } from '@/components/layout/navigation'
import ImprovedDashboard from '@/components/dashboard/improved-dashboard'
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
  totalBrands: number
  totalAgents: number
  activeAgents: number
  totalMessages: number
  totalContent: number
  totalConversations: number
  activeConversations: number
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
        brandsResult, 
        agentsResult,
        contentResult,
        conversationsResult
      ] = await Promise.all([
        safeQuery('brands', 'id, name, created_at', { count: 'exact' }),
        safeQuery('ai_agents', 'id, type, status, created_at', { count: 'exact' }),
        tryMultipleTables(['content_generation', 'brand_content'], 'id, created_at', { count: 'exact' }),
        safeQuery('conversations', 'id, status, created_at', { count: 'exact' })
      ])

      // Safely query messages with proper error handling
      let messagesResult: { data: any[], count: number } = { data: [], count: 0 }
      try {
        const { data, error, count } = await supabase
          .from('messages')
          .select('id, created_at, direction', { count: 'exact' })
          .eq('user_id', user.id)
        
        if (!error) {
          messagesResult = { data: data || [], count: count || 0 }
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
      }

      // Calculate metrics
      const totalBrands = brandsResult.count || 0
      const totalAgents = agentsResult.count || 0
      const totalMessages = messagesResult.count || 0
      const totalContent = contentResult.count || 0
      const totalConversations = conversationsResult.count || 0
      const activeConversations = conversationsResult.data?.filter((conv: any) => conv.status === 'active').length || 0

      // Calculate today's metrics
      const today = new Date().toISOString().split('T')[0]
      const todayMessages = messagesResult.data?.filter((msg: any) => 
        msg.created_at?.startsWith(today)
      ).length || 0
      const todayContent = contentResult.data?.filter((content: any) => 
        content.created_at?.startsWith(today)
      ).length || 0

      // Calculate weekly metrics
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const weeklyMessages = messagesResult.data?.filter((msg: any) => 
        new Date(msg.created_at) > new Date(weekAgo)
      ).length || 0
      const weeklyContent = contentResult.data?.filter((content: any) => 
        new Date(content.created_at) > new Date(weekAgo)
      ).length || 0

      // Calculate AI response rate (mock calculation)
      const aiResponseRate = totalMessages > 0 ? Math.min(95 + Math.random() * 5, 100) : 0

      // Recent conversations
      const recentConversations = conversationsResult.data?.filter((conv: any) => 
        new Date(conv.created_at) > new Date(weekAgo)
      ).length || 0

      setDashboardData({
        totalBrands,
        totalAgents,
        activeAgents: agentsResult.data?.filter((agent: any) => agent.status === 'active').length || 0,
        totalMessages,
        totalContent,
        totalConversations,
        activeConversations,
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(brandData),
      })

      const result = await response.json()
      
      if (result.success) {
        setBrandCreated(true)
        await fetchDashboardData()
      } else {
        console.error('Error creating brand:', result.error)
      }
    } catch (error) {
      console.error('Error submitting brand:', error)
    } finally {
      setIsCreatingBrand(false)
    }
  }

  // Loading state
  if (isLoading || isCheckingBrand) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
        <EnhancedCard className="w-96 shadow-2xl border-0">
          <EnhancedCardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Your Dashboard</h3>
            <p className="text-sm text-muted-foreground">
              Setting up your AI automation workspace...
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
                  Schedsy.ai
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <Navigation />

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
          
          {/* Improved Dashboard Content */}
          <ImprovedDashboard 
            dashboardData={dashboardData} 
            brandExists={brandCreated}
          />
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