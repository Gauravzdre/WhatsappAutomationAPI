'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStrategy } from '@/hooks/useStrategy'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Edit,
  ArrowLeft,
  Save,
  AlertTriangle,
  Loader2,
  Target,
  Building2,
  Users,
  MessageSquare,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import type { Strategy, StrategyStatus } from '@/types/strategy'

const BRAND_VOICES = [
  { id: 'professional', name: 'Professional', description: 'Formal, authoritative, and trustworthy' },
  { id: 'friendly', name: 'Friendly', description: 'Warm, approachable, and conversational' },
  { id: 'casual', name: 'Casual', description: 'Relaxed, informal, and relatable' },
  { id: 'enthusiastic', name: 'Enthusiastic', description: 'Energetic, passionate, and motivating' },
  { id: 'expert', name: 'Expert', description: 'Knowledgeable, detailed, and educational' }
]

const STATUS_OPTIONS: { value: StrategyStatus; label: string; description: string }[] = [
  { value: 'draft', label: 'Draft', description: 'Strategy is being developed' },
  { value: 'active', label: 'Active', description: 'Strategy is currently in use' },
  { value: 'paused', label: 'Paused', description: 'Strategy is temporarily inactive' },
  { value: 'archived', label: 'Archived', description: 'Strategy is no longer in use' }
]

interface EditFormData {
  name: string
  description: string
  status: StrategyStatus
  business_objectives: {
    primary_goal: string
    target_audience: string
    value_proposition: string
    secondary_goals: string[]
    key_challenges: string[]
  }
  target_metrics: {
    response_rate_target: number
    engagement_rate_target: number
    conversion_rate_target: number
    monthly_message_target: number
  }
  content_distribution: {
    educational: number
    promotional: number
    engagement: number
    support: number
  }
}

export default function EditStrategyPage() {
  const params = useParams()
  const router = useRouter()
  const strategyId = params.id as string
  
  const { strategies, updateStrategy, loading: updateLoading } = useStrategy()
  const [strategy, setStrategy] = useState<Strategy | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<EditFormData>({
    name: '',
    description: '',
    status: 'draft',
    business_objectives: {
      primary_goal: '',
      target_audience: '',
      value_proposition: '',
      secondary_goals: [],
      key_challenges: []
    },
    target_metrics: {
      response_rate_target: 25,
      engagement_rate_target: 15,
      conversion_rate_target: 5,
      monthly_message_target: 100
    },
    content_distribution: {
      educational: 40,
      promotional: 30,
      engagement: 20,
      support: 10
    }
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [brandVoice, setBrandVoice] = useState('professional')

  // Load strategy data
  useEffect(() => {
    const loadStrategy = () => {
      const foundStrategy = strategies.find(s => s.id === strategyId)
      if (foundStrategy) {
        setStrategy(foundStrategy)
        setFormData({
          name: foundStrategy.name,
          description: foundStrategy.description || '',
          status: foundStrategy.status,
          business_objectives: foundStrategy.business_objectives || {
            primary_goal: '',
            target_audience: '',
            value_proposition: '',
            secondary_goals: [],
            key_challenges: []
          },
          target_metrics: foundStrategy.target_metrics || {
            response_rate_target: 25,
            engagement_rate_target: 15,
            conversion_rate_target: 5,
            monthly_message_target: 100
          },
          content_distribution: foundStrategy.content_distribution
        })
        setLoading(false)
      }
    }

    if (strategies.length > 0) {
      loadStrategy()
    }
  }, [strategies, strategyId])

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const updateNestedData = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof EditFormData] as any),
        [field]: value
      }
    }))
  }

  const updateContentDistribution = (pillar: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      content_distribution: {
        ...prev.content_distribution,
        [pillar]: value
      }
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Strategy name is required'
    }
    
    if (!formData.business_objectives.primary_goal.trim()) {
      newErrors.primary_goal = 'Primary goal is required'
    }
    
    if (!formData.business_objectives.target_audience.trim()) {
      newErrors.target_audience = 'Target audience is required'
    }
    
    const total = Object.values(formData.content_distribution).reduce((sum, val) => sum + val, 0)
    if (Math.abs(total - 100) > 0.1) {
      newErrors.content_distribution = 'Content distribution must total 100%'
    }
    
    if (formData.target_metrics.response_rate_target < 1 || formData.target_metrics.response_rate_target > 100) {
      newErrors.response_rate_target = 'Response rate must be between 1-100%'
    }
    
    if (formData.target_metrics.engagement_rate_target < 1 || formData.target_metrics.engagement_rate_target > 100) {
      newErrors.engagement_rate_target = 'Engagement rate must be between 1-100%'
    }
    
    if (formData.target_metrics.conversion_rate_target < 1 || formData.target_metrics.conversion_rate_target > 100) {
      newErrors.conversion_rate_target = 'Conversion rate must be between 1-100%'
    }
    
    if (formData.target_metrics.monthly_message_target < 1) {
      newErrors.monthly_message_target = 'Monthly message target must be at least 1'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      await updateStrategy(strategyId, formData)
      router.push(`/strategy/${strategyId}`)
    } catch (error) {
      console.error('Failed to update strategy:', error)
      setErrors({ submit: 'Failed to update strategy. Please try again.' })
    }
  }

  if (loading) {
    return (
      <DashboardLayout
        title="Edit Strategy"
        description="Modify your content strategy settings"
        icon={<Edit className="h-8 w-8" />}
        gradient="purple"
      >
        <div className="animate-pulse space-y-6">
          <Card className="h-32 bg-gray-200"></Card>
          <Card className="h-64 bg-gray-200"></Card>
        </div>
      </DashboardLayout>
    )
  }

  if (!strategy) {
    return (
      <DashboardLayout
        title="Edit Strategy"
        description="Modify your content strategy settings"
        icon={<Edit className="h-8 w-8" />}
        gradient="purple"
      >
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Strategy not found
          </AlertDescription>
        </Alert>
        <Link href="/strategy">
          <Button className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Strategy
          </Button>
        </Link>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Edit Strategy"
      description={`Modify "${strategy.name}" strategy settings`}
      icon={<Edit className="h-8 w-8" />}
      gradient="purple"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Link href={`/strategy/${strategyId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Details
              </Button>
            </Link>
            <Badge variant="outline">
              Last updated: {new Date(strategy.updated_at).toLocaleDateString()}
            </Badge>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-100">
                <Building2 className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Update the fundamental details of your strategy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Strategy Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    placeholder="Enter strategy name"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: StrategyStatus) => updateFormData('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-gray-500">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Describe your strategy"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Objectives */}
          <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-100">
                <Target className="h-5 w-5" />
                <span>Business Objectives</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Define your business goals and value proposition
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primary_goal">Primary Goal *</Label>
                <Textarea
                  id="primary_goal"
                  value={formData.business_objectives.primary_goal}
                  onChange={(e) => updateNestedData('business_objectives', 'primary_goal', e.target.value)}
                  placeholder="What is your main business objective?"
                  rows={2}
                />
                {errors.primary_goal && (
                  <p className="text-sm text-red-600">{errors.primary_goal}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="target_audience">Target Audience *</Label>
                <Textarea
                  id="target_audience"
                  value={formData.business_objectives.target_audience}
                  onChange={(e) => updateNestedData('business_objectives', 'target_audience', e.target.value)}
                  placeholder="Describe your ideal customers"
                  rows={3}
                />
                {errors.target_audience && (
                  <p className="text-sm text-red-600">{errors.target_audience}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="value_proposition">Value Proposition</Label>
                <Textarea
                  id="value_proposition"
                  value={formData.business_objectives.value_proposition}
                  onChange={(e) => updateNestedData('business_objectives', 'value_proposition', e.target.value)}
                  placeholder="What unique value do you provide?"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Distribution */}
          <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-100">
                <MessageSquare className="h-5 w-5" />
                <span>Content Distribution</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Adjust your content pillar distribution (must total 100%)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(formData.content_distribution).map(([pillar, value]) => (
                  <div key={pillar} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="capitalize flex items-center space-x-2">
                        <span>{pillar === 'educational' ? '📚' : pillar === 'promotional' ? '💰' : pillar === 'engagement' ? '🤝' : '🛠️'}</span>
                        <span>{pillar}</span>
                      </Label>
                      <span className="text-sm font-medium">{value}%</span>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={value}
                      onChange={(e) => updateContentDistribution(pillar, parseInt(e.target.value) || 0)}
                    />
                  </div>
                ))}
              </div>
              
              {errors.content_distribution && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {errors.content_distribution}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="text-sm text-gray-300">
                <strong>Total: {Object.values(formData.content_distribution).reduce((sum, val) => sum + val, 0)}%</strong>
              </div>
            </CardContent>
          </Card>

          {/* Target Metrics */}
          <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-100">
                <BarChart3 className="h-5 w-5" />
                <span>Target Metrics</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Update your performance targets and goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="response_rate">Target Response Rate (%)</Label>
                  <Input
                    id="response_rate"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.target_metrics.response_rate_target}
                    onChange={(e) => updateNestedData('target_metrics', 'response_rate_target', parseInt(e.target.value) || 0)}
                  />
                  {errors.response_rate_target && (
                    <p className="text-sm text-red-600">{errors.response_rate_target}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="engagement_rate">Target Engagement Rate (%)</Label>
                  <Input
                    id="engagement_rate"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.target_metrics.engagement_rate_target}
                    onChange={(e) => updateNestedData('target_metrics', 'engagement_rate_target', parseInt(e.target.value) || 0)}
                  />
                  {errors.engagement_rate_target && (
                    <p className="text-sm text-red-600">{errors.engagement_rate_target}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="conversion_rate">Target Conversion Rate (%)</Label>
                  <Input
                    id="conversion_rate"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.target_metrics.conversion_rate_target}
                    onChange={(e) => updateNestedData('target_metrics', 'conversion_rate_target', parseInt(e.target.value) || 0)}
                  />
                  {errors.conversion_rate_target && (
                    <p className="text-sm text-red-600">{errors.conversion_rate_target}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="monthly_messages">Monthly Message Target</Label>
                  <Input
                    id="monthly_messages"
                    type="number"
                    min="1"
                    value={formData.target_metrics.monthly_message_target}
                    onChange={(e) => updateNestedData('target_metrics', 'monthly_message_target', parseInt(e.target.value) || 0)}
                  />
                  {errors.monthly_message_target && (
                    <p className="text-sm text-red-600">{errors.monthly_message_target}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          {errors.submit && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {errors.submit}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between pt-6 border-t">
            <Link href={`/strategy/${strategyId}`}>
              <Button variant="outline" type="button">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </Link>
            
            <Button 
              type="submit"
              disabled={updateLoading}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              {updateLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
} 