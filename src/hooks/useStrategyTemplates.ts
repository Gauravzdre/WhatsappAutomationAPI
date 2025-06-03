import { useState, useEffect, useCallback } from 'react'
import { strategyTemplatesService } from '@/lib/strategy-templates-service'
import type { StrategyTemplateData, Strategy, UseStrategyTemplatesReturn } from '@/types/strategy'

export function useStrategyTemplates(): UseStrategyTemplatesReturn {
  const [templates, setTemplates] = useState<StrategyTemplateData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const templatesData = await strategyTemplatesService.getStrategyTemplates()
      setTemplates(templatesData)
    } catch (err) {
      console.error('Error fetching strategy templates:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch templates')
    } finally {
      setLoading(false)
    }
  }, [])

  const getTemplatesByIndustry = useCallback((industry: string): StrategyTemplateData[] => {
    return templates.filter(template => 
      template.industry.toLowerCase().includes(industry.toLowerCase())
    )
  }, [templates])

  const getTemplatesByBusinessType = useCallback((businessType: string): StrategyTemplateData[] => {
    return templates.filter(template => 
      template.business_type.toLowerCase().includes(businessType.toLowerCase())
    )
  }, [templates])

  const createStrategyFromTemplate = useCallback(async (
    templateId: string, 
    customizations?: Partial<Strategy>
  ): Promise<Strategy> => {
    try {
      setError(null)
      return await strategyTemplatesService.createStrategyFromTemplate(templateId, customizations)
    } catch (err) {
      console.error('Error creating strategy from template:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to create strategy from template'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const refresh = useCallback(async () => {
    await fetchTemplates()
  }, [fetchTemplates])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  return {
    templates,
    loading,
    error,
    getTemplatesByIndustry,
    getTemplatesByBusinessType,
    createStrategyFromTemplate,
    refresh
  }
} 