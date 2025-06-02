'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { 
  Bot, 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Trash2,
  Edit,
  Play,
  Pause,
  Activity,
  Brain,
  Calendar,
  BarChart3,
  MessageSquare,
  Target,
  Zap
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AIAgent {
  id: string
  user_id: string
  brand_id: string
  name: string
  type: string
  julep_agent_id: string
  configuration: any
  status: 'active' | 'inactive' | 'error'
  memory_context: any
  performance_metrics: any
  last_active: string
  created_at: string
  updated_at: string
  brands?: {
    name: string
  }
}

const agentTypeIcons = {
  brand_persona: Brain,
  content_creator: Edit,
  scheduler: Calendar,
  sales: Target,
  analytics: BarChart3,
  campaign_orchestrator: Zap
}

const agentTypeColors = {
  brand_persona: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  content_creator: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  scheduler: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  sales: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  analytics: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  campaign_orchestrator: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
}

export default function AIAgentsPage() {
  const [agents, setAgents] = useState<AIAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [cleaningUp, setCleaningUp] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const supabase = createClientComponentClient()

  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('ai_agents')
        .select(`
          *,
          brands:brand_id (
            name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setAgents(data || [])
    } catch (error) {
      console.error('Error loading agents:', error)
      toast({
        title: 'Error',
        description: 'Failed to load AI agents',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const updateAgentStatus = async (agentId: string, newStatus: 'active' | 'inactive') => {
    try {
      const { error } = await supabase
        .from('ai_agents')
        .update({ status: newStatus })
        .eq('id', agentId)

      if (error) throw error

      setAgents(prev => prev.map(agent => 
        agent.id === agentId ? { ...agent, status: newStatus } : agent
      ))

      toast({
        title: 'Success',
        description: `Agent ${newStatus === 'active' ? 'activated' : 'deactivated'}`,
      })
    } catch (error) {
      console.error('Error updating agent status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update agent status',
        variant: 'destructive',
      })
    }
  }

  const deleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return

    try {
      const { error } = await supabase
        .from('ai_agents')
        .delete()
        .eq('id', agentId)

      if (error) throw error

      setAgents(prev => prev.filter(agent => agent.id !== agentId))

      toast({
        title: 'Success',
        description: 'Agent deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting agent:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete agent',
        variant: 'destructive',
      })
    }
  }

  const cleanupDuplicateAgents = async () => {
    try {
      setCleaningUp(true)
      const response = await fetch('/api/ai-agents/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Cleanup Completed',
          description: result.message,
        })
        
        // Reload agents after cleanup
        await loadAgents()
      } else {
        throw new Error(result.error || 'Cleanup failed')
      }
    } catch (error) {
      console.error('Error cleaning up agents:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to cleanup duplicate agents',
        variant: 'destructive',
      })
    } finally {
      setCleaningUp(false)
    }
  }

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || agent.type === filterType
    const matchesStatus = filterStatus === 'all' || agent.status === filterStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  if (loading) {
    return (
      <DashboardLayout
        title="AI Agents"
        description="Manage your AI automation agents"
        icon={<Bot className="h-8 w-8 text-blue-600 dark:text-blue-400" />}
      >
        <div className="flex justify-center items-center py-12">
          <Activity className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading agents...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="AI Agents"
      description="Manage your AI automation agents"
      icon={<Bot className="h-8 w-8 text-blue-600 dark:text-blue-400" />}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Agents</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {filteredAgents.length} of {agents.length} agents
              {agents.length > 6 && (
                <span className="text-amber-600 dark:text-amber-400 ml-2">
                  (Possible duplicates detected)
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            {agents.length > 6 && (
              <Button 
                variant="outline" 
                onClick={cleanupDuplicateAgents}
                disabled={cleaningUp}
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                {cleaningUp ? (
                  <>
                    <Activity className="mr-2 h-4 w-4 animate-spin" />
                    Cleaning...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove Duplicates
                  </>
                )}
              </Button>
            )}
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Create Agent
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="brand_persona">Brand Persona</SelectItem>
              <SelectItem value="content_creator">Content Creator</SelectItem>
              <SelectItem value="scheduler">Scheduler</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="analytics">Analytics</SelectItem>
              <SelectItem value="campaign_orchestrator">Campaign Orchestrator</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Agents Grid */}
        {filteredAgents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {agents.length === 0 ? 'No AI agents yet' : 'No agents match your filters'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {agents.length === 0 
                  ? 'Create your first AI agent to start automating your workflows'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => {
              const IconComponent = agentTypeIcons[agent.type as keyof typeof agentTypeIcons] || Bot
              return (
                <Card key={agent.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">
                            {agent.name}
                          </CardTitle>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {agent.brands?.name || 'No brand assigned'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => updateAgentStatus(
                            agent.id, 
                            agent.status === 'active' ? 'inactive' : 'active'
                          )}
                        >
                          {agent.status === 'active' ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteAgent(agent.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className={agentTypeColors[agent.type as keyof typeof agentTypeColors]}>
                        {agent.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                      <Badge className={getStatusColor(agent.status)}>
                        {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span>{new Date(agent.created_at).toLocaleDateString()}</span>
                      </div>
                      {agent.last_active && (
                        <div className="flex justify-between">
                          <span>Last Active:</span>
                          <span>{new Date(agent.last_active).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {agent.performance_metrics && Object.keys(agent.performance_metrics).length > 0 && (
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Performance</span>
                          <BarChart3 className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 