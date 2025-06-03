'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { 
  Clock, 
  Calendar, 
  Repeat, 
  Brain, 
  TrendingUp, 
  Users, 
  Zap,
  BarChart3,
  Target,
  Lightbulb,
  RefreshCw
} from 'lucide-react'

interface SmartScheduleBuilderProps {
  value: string
  onChange: (cronExpression: string) => void
  messageContent?: string
  onOptimizationChange?: (optimization: any) => void
}

interface ScheduleConfig {
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
  time: string
  days?: string[]
  dayOfMonth?: number
}

interface AudienceInsights {
  mostActiveHours: number[]
  mostActiveDays: string[]
  averageResponseTime: number
  timeZone: string
}

interface ScheduleOptimization {
  recommendedTime: string
  confidence: number
  reasoning: string
  alternativeTimes: string[]
  expectedEngagement: number
}

const DAYS_OF_WEEK = [
  { value: 'sun', label: 'Sunday', short: 'Sun' },
  { value: 'mon', label: 'Monday', short: 'Mon' },
  { value: 'tue', label: 'Tuesday', short: 'Tue' },
  { value: 'wed', label: 'Wednesday', short: 'Wed' },
  { value: 'thu', label: 'Thursday', short: 'Thu' },
  { value: 'fri', label: 'Friday', short: 'Fri' },
  { value: 'sat', label: 'Saturday', short: 'Sat' },
]

const TIMES = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00'
]

export function SmartScheduleBuilder({ 
  value, 
  onChange, 
  messageContent = '',
  onOptimizationChange 
}: SmartScheduleBuilderProps) {
  const [config, setConfig] = useState<ScheduleConfig>({
    frequency: 'daily',
    time: '09:00',
    days: [],
    dayOfMonth: 1
  })

  const [previewText, setPreviewText] = useState('Every day at 9:00 AM')
  const [audienceInsights, setAudienceInsights] = useState<AudienceInsights | null>(null)
  const [optimization, setOptimization] = useState<ScheduleOptimization | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [showAIRecommendations, setShowAIRecommendations] = useState(false)

  // Parse existing cron expression to config
  useEffect(() => {
    if (value && value.trim()) {
      const parsed = parseCronExpression(value)
      if (parsed) {
        setConfig(parsed)
      }
    }
  }, [value])

  // Generate cron expression and preview text when config changes
  useEffect(() => {
    if (config.time) {
      const { cron, preview } = generateCronFromConfig(config)
      setPreviewText(preview)
      onChange(cron)
    }
  }, [config, onChange])

  // Load audience insights on component mount
  useEffect(() => {
    loadAudienceInsights()
  }, [])

  const loadAudienceInsights = async () => {
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/smart-scheduling/analyze')
      const data = await response.json()
      
      if (data.success) {
        setAudienceInsights(data.insights)
      } else {
        console.error('Failed to load audience insights:', data.error)
      }
    } catch (error) {
      console.error('Error loading audience insights:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getAIOptimization = async () => {
    if (!messageContent.trim()) {
      toast({
        title: 'Message Required',
        description: 'Please enter your message content to get AI optimization',
        variant: 'destructive'
      })
      return
    }

    setIsOptimizing(true)
    try {
      const response = await fetch('/api/smart-scheduling/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageContent,
          currentTime: config.time,
          frequency: config.frequency,
          contentType: 'message',
          platform: 'whatsapp'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setOptimization(data.optimization)
        setShowAIRecommendations(true)
        onOptimizationChange?.(data.optimization)
        
        toast({
          title: 'AI Optimization Complete ✨',
          description: `Recommended time: ${data.optimization.recommendedTime} (${Math.round(data.optimization.confidence * 100)}% confidence)`
        })
      } else {
        toast({
          title: 'Optimization Failed',
          description: data.error || 'Failed to get AI optimization',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error getting AI optimization:', error)
      toast({
        title: 'Error',
        description: 'Failed to connect to AI optimization service',
        variant: 'destructive'
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  const applyAIRecommendation = () => {
    if (optimization) {
      updateConfig({ time: optimization.recommendedTime })
      toast({
        title: 'Applied AI Recommendation ✅',
        description: `Schedule updated to ${optimization.recommendedTime}`
      })
    }
  }

  function parseCronExpression(cron: string): ScheduleConfig | null {
    try {
      const parts = cron.trim().split(' ')
      if (parts.length !== 5) return null

      const [minute, hour, dayOfMonth, month, dayOfWeek] = parts
      
      if (!minute || !hour) return null
      
      const time = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
      
      // Daily
      if (dayOfWeek === '*' && dayOfMonth === '*') {
        return { frequency: 'daily', time, days: [] }
      }
      
      // Weekly
      if (dayOfWeek !== '*' && dayOfMonth === '*') {
        const days = dayOfWeek.split(',').map(d => {
          const dayMap: { [key: string]: string } = { '0': 'sun', '1': 'mon', '2': 'tue', '3': 'wed', '4': 'thu', '5': 'fri', '6': 'sat' }
          return dayMap[d?.trim()]
        }).filter(Boolean)
        return { frequency: 'weekly', time, days }
      }
      
      // Monthly
      if (dayOfWeek === '*' && dayOfMonth !== '*') {
        return { frequency: 'monthly', time, dayOfMonth: parseInt(dayOfMonth), days: [] }
      }

      return { frequency: 'custom', time, days: [] }
    } catch {
      return null
    }
  }

  function generateCronFromConfig(config: ScheduleConfig): { cron: string, preview: string } {
    if (!config.time) {
      return { cron: '0 9 * * *', preview: 'Daily at 9:00 AM' }
    }
    
    const [hour, minute] = config.time.split(':')
    
    switch (config.frequency) {
      case 'daily':
        return {
          cron: `${minute} ${hour} * * *`,
          preview: `Every day at ${formatTime(config.time)}`
        }
      
      case 'weekly':
        if (!Array.isArray(config.days) || config.days.length === 0) {
          return {
            cron: `${minute} ${hour} * * *`,
            preview: `Every day at ${formatTime(config.time)}`
          }
        }
        
        const dayNumbers = config.days.map(day => {
          const dayMap: { [key: string]: string } = { 'sun': '0', 'mon': '1', 'tue': '2', 'wed': '3', 'thu': '4', 'fri': '5', 'sat': '6' }
          return dayMap[day]
        }).filter(Boolean).join(',')
        
        const dayNames = config.days.map(day => 
          DAYS_OF_WEEK.find(d => d.value === day)?.short
        ).filter(Boolean).join(', ')
        
        return {
          cron: `${minute} ${hour} * * ${dayNumbers}`,
          preview: `Every ${dayNames} at ${formatTime(config.time)}`
        }
      
      case 'monthly':
        return {
          cron: `${minute} ${hour} ${config.dayOfMonth} * *`,
          preview: `Day ${config.dayOfMonth} of every month at ${formatTime(config.time)}`
        }
      
      default:
        return {
          cron: `${minute} ${hour} * * *`,
          preview: `Every day at ${formatTime(config.time)}`
        }
    }
  }

  function formatTime(time: string): string {
    const [hour, minute] = time.split(':')
    const h = parseInt(hour)
    const period = h >= 12 ? 'PM' : 'AM'
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h
    return `${displayHour}:${minute} ${period}`
  }

  function updateConfig(updates: Partial<ScheduleConfig>) {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  function toggleDay(day: string) {
    if (!day) return
    
    const currentDays = Array.isArray(config.days) ? config.days : []
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day]
    updateConfig({ days: newDays })
  }

  return (
    <div className="space-y-6">
      {/* AI Insights Panel */}
      {audienceInsights && (
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <Brain className="h-5 w-5" />
              Audience Insights
              <Button
                variant="ghost"
                size="sm"
                onClick={loadAudienceInsights}
                disabled={isAnalyzing}
                className="ml-auto"
              >
                <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Most Active Hours</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {audienceInsights.mostActiveHours.map(h => `${h}:00`).join(', ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Best Days</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {audienceInsights.mostActiveDays.join(', ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Avg Response</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {Math.round(audienceInsights.averageResponseTime / 60)} min
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Optimization Section */}
      <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20 dark:border-purple-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
            <Zap className="h-5 w-5" />
            AI Schedule Optimization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={getAIOptimization}
              disabled={isOptimizing || !messageContent.trim()}
              className="flex items-center gap-2"
              variant="outline"
            >
              {isOptimizing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Brain className="h-4 w-4" />
              )}
              {isOptimizing ? 'Analyzing...' : 'Get AI Recommendation'}
            </Button>
            
            {optimization && (
              <Button
                onClick={applyAIRecommendation}
                className="flex items-center gap-2"
                variant="default"
              >
                <Target className="h-4 w-4" />
                Apply Recommendation
              </Button>
            )}
          </div>

          {optimization && showAIRecommendations && (
            <div className="space-y-3 p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  AI Recommendation
                </h4>
                <Badge variant="secondary">
                  {Math.round(optimization.confidence * 100)}% confidence
                </Badge>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Recommended Time:</strong> {formatTime(optimization.recommendedTime)}
                </p>
                <p className="text-sm">
                  <strong>Expected Engagement:</strong> {Math.round(optimization.expectedEngagement * 100)}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {optimization.reasoning}
                </p>
              </div>

              {optimization.alternativeTimes.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Alternative Times:</p>
                  <div className="flex flex-wrap gap-2">
                    {optimization.alternativeTimes.map((time, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => updateConfig({ time })}
                        className="text-xs"
                      >
                        {formatTime(time)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Traditional Schedule Builder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Frequency Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              How often?
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { value: 'daily', label: 'Daily', icon: '📅' },
                { value: 'weekly', label: 'Weekly', icon: '📊' },
                { value: 'monthly', label: 'Monthly', icon: '🗓️' },
                { value: 'custom', label: 'Custom', icon: '⚙️' },
              ].map((freq) => (
                <Button
                  key={freq.value}
                  type="button"
                  variant={config.frequency === freq.value ? 'default' : 'outline'}
                  className="justify-start gap-2"
                  onClick={() => updateConfig({ frequency: freq.value as any })}
                >
                  <span>{freq.icon}</span>
                  {freq.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              What time?
            </Label>
            <Select value={config.time} onValueChange={(time) => updateConfig({ time })}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMES.map((time) => (
                  <SelectItem key={time} value={time}>
                    {formatTime(time)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Weekly - Day Selection */}
          {config.frequency === 'weekly' && (
            <div className="space-y-3">
              <Label className="text-base font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Which days?
              </Label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border cursor-pointer transition-colors ${
                      Array.isArray(config.days) && config.days.includes(day.value) 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => toggleDay(day.value)}
                  >
                    {day.short}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Monthly - Day Selection */}
          {config.frequency === 'monthly' && (
            <div className="space-y-3">
              <Label className="text-base font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Day of month?
              </Label>
              <Select 
                value={config.dayOfMonth?.toString()} 
                onValueChange={(day) => updateConfig({ dayOfMonth: parseInt(day) })}
              >
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Schedule Preview */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Schedule Preview
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {previewText}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 