import { useState, useEffect, useCallback } from 'react'
import { strategyService } from '@/lib/strategy-service'
import type {
  Strategy,
  StrategyDashboard,
  ContentPillarInsights,
  UseStrategyReturn,
  UseStrategyDashboardReturn,
  UseContentPillarAnalyticsReturn,
  StrategyWizardData
} from '@/types/strategy'

/**
 * Hook for managing strategies
 */
export function useStrategy(): UseStrategyReturn {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await strategyService.getStrategies()
      setStrategies(data)
    } catch (err) {
      console.error('Error fetching strategies:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch strategies')
    } finally {
      setLoading(false)
    }
  }, [])

  const createStrategy = useCallback(async (data: Partial<Strategy>): Promise<Strategy> => {
    try {
      setError(null)
      const strategy = await strategyService.createStrategy(data)
      await refresh()
      return strategy
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create strategy'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [refresh])

  const createStrategyFromWizard = useCallback(async (wizardData: StrategyWizardData): Promise<Strategy> => {
    try {
      setError(null)
      const strategy = await strategyService.createStrategyFromWizard(wizardData)
      await refresh()
      return strategy
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create strategy from wizard'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [refresh])

  const updateStrategy = useCallback(async (id: string, data: Partial<Strategy>): Promise<Strategy> => {
    try {
      setError(null)
      const strategy = await strategyService.updateStrategy(id, data)
      await refresh()
      return strategy
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update strategy'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [refresh])

  const deleteStrategy = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null)
      await strategyService.deleteStrategy(id)
      await refresh()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete strategy'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [refresh])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    strategies,
    loading,
    error,
    createStrategy,
    updateStrategy,
    deleteStrategy,
    refresh,
    createStrategyFromWizard
  } as UseStrategyReturn & { createStrategyFromWizard: typeof createStrategyFromWizard }
}

/**
 * Hook for strategy dashboard data
 */
export function useStrategyDashboard(): UseStrategyDashboardReturn {
  const [dashboard, setDashboard] = useState<StrategyDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await strategyService.getStrategyDashboard()
      setDashboard(data)
    } catch (err) {
      console.error('Error fetching strategy dashboard:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
      setDashboard(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    dashboard,
    loading,
    error,
    refresh
  }
}

/**
 * Hook for content pillar analytics
 */
export function useContentPillarAnalytics(strategyId?: string): UseContentPillarAnalyticsReturn {
  const [analytics, setAnalytics] = useState<any[]>([])
  const [insights, setInsights] = useState<ContentPillarInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [insightsData] = await Promise.all([
        strategyService.getContentPillarInsights(strategyId)
      ])
      
      setInsights(insightsData)
      setAnalytics([]) // Will be populated when we have the analytics data
    } catch (err) {
      console.error('Error fetching content pillar analytics:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
      setInsights(null)
      setAnalytics([])
    } finally {
      setLoading(false)
    }
  }, [strategyId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    analytics,
    insights,
    loading,
    error,
    refresh
  }
}

/**
 * Hook for individual strategy details
 */
export function useStrategyDetails(strategyId: string) {
  const [strategy, setStrategy] = useState<Strategy | null>(null)
  const [analytics, setAnalytics] = useState<any[]>([])
  const [segments, setSegments] = useState<any[]>([])
  const [templateCount, setTemplateCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!strategyId) return

    try {
      setLoading(true)
      setError(null)
      const data = await strategyService.getStrategy(strategyId)
      setStrategy(data.strategy)
      setAnalytics(data.analytics)
      setSegments(data.segments)
      setTemplateCount(data.template_count)
    } catch (err) {
      console.error('Error fetching strategy details:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch strategy details')
    } finally {
      setLoading(false)
    }
  }, [strategyId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    strategy,
    analytics,
    segments,
    templateCount,
    loading,
    error,
    refresh
  }
}

/**
 * Hook for template categorization
 */
export function useTemplateCategorizaton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateTemplateContentPillar = useCallback(async (
    templateId: string, 
    pillar: 'educational' | 'promotional' | 'engagement' | 'support', 
    strategyId?: string
  ) => {
    try {
      setLoading(true)
      setError(null)
      await strategyService.updateTemplateContentPillar(templateId, pillar, strategyId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update template'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const autoCategorizeTemplates = useCallback(async (strategyId: string) => {
    try {
      setLoading(true)
      setError(null)
      const result = await strategyService.autoCategorizeTemplates(strategyId)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to auto-categorize templates'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    updateTemplateContentPillar,
    autoCategorizeTemplates,
    loading,
    error
  }
} 