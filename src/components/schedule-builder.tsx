'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Calendar, Repeat } from 'lucide-react'

interface ScheduleBuilderProps {
  value: string
  onChange: (cronExpression: string) => void
}

interface ScheduleConfig {
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
  time: string
  days?: string[]
  dayOfMonth?: number
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

const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => i + 1)

export function ScheduleBuilder({ value, onChange }: ScheduleBuilderProps) {
  const [config, setConfig] = useState<ScheduleConfig>({
    frequency: 'daily',
    time: '09:00',
    days: [],
    dayOfMonth: 1
  })

  const [previewText, setPreviewText] = useState('')

  // Parse existing cron expression to config
  useEffect(() => {
    if (value) {
      const parsed = parseCronExpression(value)
      if (parsed) {
        setConfig(parsed)
      }
    }
  }, [value])

  // Generate cron expression and preview text
  useEffect(() => {
    const { cron, preview } = generateCronFromConfig(config)
    onChange(cron)
    setPreviewText(preview)
  }, [config, onChange])

  function parseCronExpression(cron: string): ScheduleConfig | null {
    try {
      const parts = cron.split(' ')
      if (parts.length !== 5) return null

      const [minute, hour, dayOfMonth, month, dayOfWeek] = parts
      
      const time = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
      
      // Daily
      if (dayOfWeek === '*' && dayOfMonth === '*') {
        return { frequency: 'daily', time }
      }
      
      // Weekly
      if (dayOfWeek !== '*' && dayOfMonth === '*') {
        const days = dayOfWeek.split(',').map(d => {
          const dayMap: { [key: string]: string } = { '0': 'sun', '1': 'mon', '2': 'tue', '3': 'wed', '4': 'thu', '5': 'fri', '6': 'sat' }
          return dayMap[d]
        }).filter(Boolean)
        return { frequency: 'weekly', time, days }
      }
      
      // Monthly
      if (dayOfWeek === '*' && dayOfMonth !== '*') {
        return { frequency: 'monthly', time, dayOfMonth: parseInt(dayOfMonth) }
      }

      return { frequency: 'custom', time }
    } catch {
      return null
    }
  }

  function generateCronFromConfig(config: ScheduleConfig): { cron: string, preview: string } {
    const [hour, minute] = config.time.split(':')
    
    switch (config.frequency) {
      case 'daily':
        return {
          cron: `${minute} ${hour} * * *`,
          preview: `Every day at ${formatTime(config.time)}`
        }
      
      case 'weekly':
        if (!config.days || config.days.length === 0) {
          return {
            cron: `${minute} ${hour} * * *`,
            preview: `Every day at ${formatTime(config.time)}`
          }
        }
        
        const dayNumbers = config.days.map(day => {
          const dayMap: { [key: string]: string } = { 'sun': '0', 'mon': '1', 'tue': '2', 'wed': '3', 'thu': '4', 'fri': '5', 'sat': '6' }
          return dayMap[day]
        }).join(',')
        
        const dayNames = config.days.map(day => 
          DAYS_OF_WEEK.find(d => d.value === day)?.short
        ).join(', ')
        
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
    const currentDays = config.days || []
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day]
    updateConfig({ days: newDays })
  }

  return (
    <div className="space-y-6">
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
              variant={config.frequency === freq.value ? 'default' : 'outline'}
              className="h-auto p-3 flex flex-col items-center gap-1"
              onClick={() => updateConfig({ frequency: freq.value as any })}
            >
              <span className="text-lg">{freq.icon}</span>
              <span className="text-sm">{freq.label}</span>
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
              <Badge
                key={day.value}
                variant={config.days?.includes(day.value) ? 'default' : 'outline'}
                className="cursor-pointer px-3 py-1.5 hover:bg-primary/10"
                onClick={() => toggleDay(day.value)}
              >
                {day.short}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-gray-500">
            Click days to select multiple days of the week
          </p>
        </div>
      )}

      {/* Monthly - Day Selection */}
      {config.frequency === 'monthly' && (
        <div className="space-y-3">
          <Label className="text-base font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Which day of the month?
          </Label>
          <Select 
            value={config.dayOfMonth?.toString()} 
            onValueChange={(day) => updateConfig({ dayOfMonth: parseInt(day) })}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTH_DAYS.map((day) => (
                <SelectItem key={day} value={day.toString()}>
                  {day === 1 ? '1st' : day === 2 ? '2nd' : day === 3 ? '3rd' : `${day}th`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Custom Message */}
      {config.frequency === 'custom' && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <p className="text-sm text-orange-700">
              <strong>Custom scheduling:</strong> For complex schedules, you can still use cron expressions directly in the form below.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-blue-700">Schedule Preview</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="font-medium text-blue-900">{previewText}</p>
          <p className="text-xs text-blue-600 mt-1 font-mono">
            Cron: {generateCronFromConfig(config).cron}
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 