// Strategy System Type Definitions
// Phase 1: Core strategy management with enhanced template categorization

export type ContentPillar = 'educational' | 'promotional' | 'engagement' | 'support'

export type StrategyStatus = 'draft' | 'active' | 'paused' | 'archived'

export interface Strategy {
  id: string
  user_id: string
  name: string
  description?: string
  business_objectives?: BusinessObjectives
  target_metrics?: TargetMetrics
  content_distribution: ContentDistribution
  status: StrategyStatus
  created_at: string
  updated_at: string
}

export interface BusinessObjectives {
  primary_goal: string
  secondary_goals: string[]
  target_audience: string
  value_proposition: string
  key_challenges: string[]
}

export interface TargetMetrics {
  response_rate_target: number
  engagement_rate_target: number
  conversion_rate_target: number
  monthly_message_target: number
  roi_target?: number
}

export interface ContentDistribution {
  educational: number  // Default: 40
  promotional: number  // Default: 30
  engagement: number   // Default: 20
  support: number      // Default: 10
}

export interface AudienceSegment {
  id: string
  strategy_id: string
  name: string
  description?: string
  criteria: AudienceSegmentCriteria
  communication_preferences: CommunicationPreferences
  created_at: string
}

export interface AudienceSegmentCriteria {
  demographics?: {
    age_range?: string
    location?: string[]
    industry?: string
  }
  behavior_patterns?: {
    engagement_level: 'high' | 'medium' | 'low'
    preferred_contact_times: string[]
    response_patterns: string[]
  }
  customer_stage?: 'prospect' | 'lead' | 'customer' | 'advocate'
}

export interface CommunicationPreferences {
  preferred_channels: string[]
  message_frequency: 'daily' | 'weekly' | 'monthly'
  content_preferences: ContentPillar[]
  timezone: string
}

export interface ContentPillarAnalytics {
  id: string
  strategy_id: string
  pillar_type: ContentPillar
  templates_count: number
  performance_score: number
  engagement_rate: number
  conversion_rate: number
  calculated_at: string
}

export interface StrategyAnalytics {
  id: string
  strategy_id: string
  metric_type: string
  metric_data: Record<string, any>
  calculated_for_date: string
  created_at: string
}

// Enhanced Template interface (extends existing)
export interface StrategyTemplate {
  id: string
  user_id: string
  name: string
  content: string
  variables?: Record<string, any>
  tags?: string[]
  // New strategy-related fields
  content_pillar?: ContentPillar
  strategy_id?: string
  performance_score?: number
  created_at: string
  updated_at: string
}

// Dashboard interfaces
export interface StrategyDashboard {
  strategy_overview: StrategyOverview
  content_pillar_health: ContentPillarHealth[]
  performance_insights: PerformanceInsights
  quick_actions: StrategyAction[]
}

export interface StrategyOverview {
  total_strategies: number
  active_strategies: number
  total_templates: number
  categorized_templates: number
  overall_performance_score: number
  content_distribution_health: number // 0-100 score based on ideal distribution
}

export interface ContentPillarHealth {
  pillar: ContentPillar
  template_count: number
  target_percentage: number
  actual_percentage: number
  performance_score: number
  status: 'optimal' | 'needs_attention' | 'critical'
  recommendations: string[]
}

export interface PerformanceInsights {
  top_performing_pillar: ContentPillar
  underperforming_pillars: ContentPillar[]
  engagement_trends: EngagementTrend[]
  optimization_opportunities: OptimizationOpportunity[]
}

export interface EngagementTrend {
  pillar: ContentPillar
  period: string
  engagement_rate: number
  change_percentage: number
  trend_direction: 'up' | 'down' | 'stable'
}

export interface OptimizationOpportunity {
  type: 'content_balance' | 'timing' | 'personalization' | 'frequency'
  priority: 'high' | 'medium' | 'low'
  description: string
  potential_impact: number
  action_items: string[]
}

export interface StrategyAction {
  id: string
  type: 'create_template' | 'rebalance_content' | 'optimize_timing' | 'review_performance'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  estimated_time: string
  category: 'content' | 'automation' | 'analysis' | 'optimization'
}

// Strategy Creation Wizard interfaces
export interface StrategyWizardStep {
  id: number
  title: string
  description: string
  fields: StrategyWizardField[]
  validation?: (data: any) => boolean
  isComplete?: boolean
}

export interface StrategyWizardField {
  id: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'slider'
  required: boolean
  options?: Array<{ label: string; value: string }>
  placeholder?: string
  min?: number
  max?: number
  step?: number
}

export interface StrategyWizardData {
  business_foundation: {
    business_name: string
    industry: string
    target_audience: string
    primary_goal: string
    value_proposition: string
  }
  objectives: {
    primary_objective: string
    secondary_objectives: string[]
    target_metrics: TargetMetrics
  }
  content_strategy: {
    content_distribution: ContentDistribution
    content_themes: string[]
    brand_voice: string
  }
  audience_insights: {
    segments: Partial<AudienceSegment>[]
    communication_preferences: CommunicationPreferences
  }
}

// API Response interfaces
export interface StrategyListResponse {
  strategies: Strategy[]
  total_count: number
  pagination?: {
    page: number
    limit: number
    total_pages: number
  }
}

export interface StrategyDetailResponse {
  strategy: Strategy
  analytics: ContentPillarAnalytics[]
  segments: AudienceSegment[]
  template_count: number
  performance_summary: PerformanceInsights
}

export interface ContentPillarInsights {
  pillar_distribution: {
    educational: { count: number; percentage: number }
    promotional: { count: number; percentage: number }
    engagement: { count: number; percentage: number }
    support: { count: number; percentage: number }
  }
  recommendations: {
    missing_pillars: ContentPillar[]
    overweight_pillars: ContentPillar[]
    suggested_actions: string[]
  }
  performance_comparison: {
    best_performing: ContentPillar
    worst_performing: ContentPillar
    average_engagement: number
  }
}

// Hook return types
export interface UseStrategyReturn {
  strategies: Strategy[]
  loading: boolean
  error: string | null
  createStrategy: (data: Partial<Strategy>) => Promise<Strategy>
  updateStrategy: (id: string, data: Partial<Strategy>) => Promise<Strategy>
  deleteStrategy: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

export interface UseStrategyDashboardReturn {
  dashboard: StrategyDashboard | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export interface UseContentPillarAnalyticsReturn {
  analytics: ContentPillarAnalytics[]
  insights: ContentPillarInsights | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

// Strategy Templates interfaces
export interface StrategyTemplateData {
  id: string
  name: string
  description: string
  industry: string
  business_type: string
  business_objectives: BusinessObjectives
  target_metrics: TargetMetrics
  content_distribution: ContentDistribution
  sample_content: SampleContent
  recommended_posting_schedule: PostingSchedule
  target_audience_profile: AudienceProfile
  brand_voice: string
  tags: string[]
  is_premium: boolean
  created_at: string
  updated_at: string
}

export interface SampleContent {
  educational: string[]
  promotional: string[]
  engagement: string[]
  support: string[]
}

export interface PostingSchedule {
  optimal_times: string[]
  frequency: string
  days: string[]
  avoid_times: string[]
}

export interface AudienceProfile {
  age_range: string
  interests: string[]
  behavior: string
  communication_style: string
}

export interface UseStrategyTemplatesReturn {
  templates: StrategyTemplateData[]
  loading: boolean
  error: string | null
  getTemplatesByIndustry: (industry: string) => StrategyTemplateData[]
  getTemplatesByBusinessType: (businessType: string) => StrategyTemplateData[]
  createStrategyFromTemplate: (templateId: string, customizations?: Partial<Strategy>) => Promise<Strategy>
  refresh: () => Promise<void>
} 