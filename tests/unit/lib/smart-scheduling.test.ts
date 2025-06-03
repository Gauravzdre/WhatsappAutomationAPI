// Mock the dependencies first
jest.mock('@supabase/auth-helpers-nextjs')
jest.mock('@/lib/ai-agent-manager')

import { SmartSchedulingService } from '@/lib/smart-scheduling'

// Mock Supabase client with proper typing
const mockSupabaseQuery = {
  data: [
    {
      sent_at: '2024-01-15T10:00:00Z',
      response_received: true,
      response_time: 300,
      client_id: 'client1',
      clients: { user_id: 'user1', brand_id: 'brand1' }
    },
    {
      sent_at: '2024-01-15T14:00:00Z',
      response_received: false,
      response_time: null,
      client_id: 'client2',
      clients: { user_id: 'user1', brand_id: 'brand1' }
    }
  ] as any[],
  error: null as any
}

const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        gte: jest.fn(() => ({
          order: jest.fn(() => mockSupabaseQuery)
        })),
        eq: jest.fn(() => ({
          gte: jest.fn(() => ({
            order: jest.fn(() => mockSupabaseQuery)
          }))
        }))
      }))
    }))
  }))
}

// Mock AI agent manager
const mockAIManager = {
  optimizeScheduling: jest.fn(() => Promise.resolve([
    {
      recommendedTime: '10:00',
      confidence: 0.85,
      reasoning: 'Based on audience analysis',
      alternativeTimes: ['11:00', '14:00'],
      expectedEngagement: 0.4,
      audienceSize: 100
    }
  ]))
}

// Set up the mocks
const { createClientComponentClient } = require('@supabase/auth-helpers-nextjs')
const { getAIAgentManager } = require('@/lib/ai-agent-manager')

;(createClientComponentClient as jest.Mock).mockReturnValue(mockSupabase)
;(getAIAgentManager as jest.Mock).mockReturnValue(mockAIManager)

describe('SmartSchedulingService', () => {
  let service: SmartSchedulingService

  beforeEach(() => {
    service = new SmartSchedulingService()
    jest.clearAllMocks()
  })

  describe('analyzeAudienceBehavior', () => {
    it('should analyze audience behavior patterns correctly', async () => {
      const result = await service.analyzeAudienceBehavior('user1', 'brand1')

      expect(result).toHaveProperty('mostActiveHours')
      expect(result).toHaveProperty('mostActiveDays')
      expect(result).toHaveProperty('engagementPatterns')
      expect(result).toHaveProperty('timeZone')
      expect(result).toHaveProperty('averageResponseTime')

      expect(Array.isArray(result.mostActiveHours)).toBe(true)
      expect(Array.isArray(result.mostActiveDays)).toBe(true)
      expect(Array.isArray(result.engagementPatterns)).toBe(true)
      expect(typeof result.averageResponseTime).toBe('number')
    })

    it('should handle empty message data gracefully', async () => {
      // Override mock for this test
      mockSupabaseQuery.data = []
      
      const result = await service.analyzeAudienceBehavior('user1', 'brand1')

      expect(result.mostActiveHours).toEqual([])
      expect(result.mostActiveDays).toEqual([])
      expect(result.averageResponseTime).toBe(0)
      
      // Reset mock
      mockSupabaseQuery.data = [
        {
          sent_at: '2024-01-15T10:00:00Z',
          response_received: true,
          response_time: 300,
          client_id: 'client1',
          clients: { user_id: 'user1', brand_id: 'brand1' }
        }
      ]
    })

    it('should handle database errors', async () => {
      // Override mock for this test
      mockSupabaseQuery.error = new Error('Database error')
      mockSupabaseQuery.data = []
      
      await expect(service.analyzeAudienceBehavior('user1', 'brand1'))
        .rejects.toThrow('Database error')
      
      // Reset mock
      mockSupabaseQuery.error = null
      mockSupabaseQuery.data = []
    })
  })

  describe('getScheduleOptimization', () => {
    const mockScheduleConfig = {
      messageContent: 'Test message',
      currentTime: '09:00',
      frequency: 'daily',
      contentType: 'message',
      platform: 'whatsapp'
    }

    it('should return AI-powered optimization when brandId is provided', async () => {
      const result = await service.getScheduleOptimization('user1', mockScheduleConfig, 'brand1')

      expect(result).toHaveProperty('recommendedTime')
      expect(result).toHaveProperty('confidence')
      expect(result).toHaveProperty('reasoning')
      expect(result).toHaveProperty('alternativeTimes')
      expect(result).toHaveProperty('expectedEngagement')
      expect(result).toHaveProperty('audienceSize')

      expect(typeof result.confidence).toBe('number')
      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
      expect(Array.isArray(result.alternativeTimes)).toBe(true)
    })

    it('should fallback to rule-based optimization when AI fails', async () => {
      // Mock AI failure
      mockAIManager.optimizeScheduling.mockRejectedValueOnce(new Error('AI service unavailable'))

      const result = await service.getScheduleOptimization('user1', mockScheduleConfig, 'brand1')

      expect(result).toHaveProperty('recommendedTime')
      expect(result).toHaveProperty('confidence')
      expect(result.confidence).toBe(0.7) // Rule-based confidence
    })

    it('should use rule-based optimization when no brandId provided', async () => {
      const result = await service.getScheduleOptimization('user1', mockScheduleConfig)

      expect(result).toHaveProperty('recommendedTime')
      expect(result).toHaveProperty('confidence')
      expect(result.confidence).toBe(0.7) // Rule-based confidence
    })

    it('should validate required parameters', async () => {
      const invalidConfig = {
        messageContent: '',
        currentTime: '',
        frequency: '',
        contentType: 'message',
        platform: 'whatsapp'
      }

      // This should still work but with default values
      const result = await service.getScheduleOptimization('user1', invalidConfig)
      expect(result).toHaveProperty('recommendedTime')
    })
  })

  describe('getSchedulePerformanceAnalytics', () => {
    it('should calculate performance metrics correctly', async () => {
      const result = await service.getSchedulePerformanceAnalytics('user1')

      expect(result).toHaveProperty('totalMessages')
      expect(result).toHaveProperty('responsesReceived')
      expect(result).toHaveProperty('responseRate')
      expect(result).toHaveProperty('averageResponseTime')
      expect(result).toHaveProperty('hourlyPerformance')
      expect(result).toHaveProperty('bestPerformingHours')

      expect(typeof result.totalMessages).toBe('number')
      expect(typeof result.responseRate).toBe('number')
      expect(result.responseRate).toBeGreaterThanOrEqual(0)
      expect(result.responseRate).toBeLessThanOrEqual(1)
      expect(Array.isArray(result.bestPerformingHours)).toBe(true)
    })

    it('should filter by schedule ID when provided', async () => {
      const result = await service.getSchedulePerformanceAnalytics('user1', 'schedule1')

      expect(mockSupabase.from).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('should handle empty analytics data', async () => {
      // Override mock for this test
      const originalData = mockSupabaseQuery.data
      mockSupabaseQuery.data = []
      
      const result = await service.getSchedulePerformanceAnalytics('user1')

      expect(result.totalMessages).toBe(0)
      expect(result.responsesReceived).toBe(0)
      expect(result.responseRate).toBe(0)
      expect(result.averageResponseTime).toBe(0)
      
      // Reset mock
      mockSupabaseQuery.data = originalData
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete optimization workflow', async () => {
      const scheduleConfig = {
        messageContent: 'Test message for optimization',
        currentTime: '14:30',
        frequency: 'daily',
        contentType: 'message',
        platform: 'whatsapp'
      }

      // Test audience analysis
      const insights = await service.analyzeAudienceBehavior('user1', 'brand1')
      expect(insights).toBeDefined()

      // Test optimization
      const optimization = await service.getScheduleOptimization('user1', scheduleConfig, 'brand1')
      expect(optimization).toBeDefined()
      expect(optimization.recommendedTime).toBeDefined()

      // Test analytics
      const analytics = await service.getSchedulePerformanceAnalytics('user1')
      expect(analytics).toBeDefined()
    })

    it('should work without brand ID (rule-based only)', async () => {
      const scheduleConfig = {
        messageContent: 'Test message',
        currentTime: '09:00',
        frequency: 'daily',
        contentType: 'message',
        platform: 'whatsapp'
      }

      const optimization = await service.getScheduleOptimization('user1', scheduleConfig)
      expect(optimization).toBeDefined()
      expect(optimization.confidence).toBe(0.7) // Rule-based
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      mockSupabase.from.mockImplementationOnce(() => {
        throw new Error('Network error')
      })

      await expect(service.analyzeAudienceBehavior('user1', 'brand1'))
        .rejects.toThrow('Network error')
    })

    it('should handle invalid user IDs', async () => {
      const result = await service.analyzeAudienceBehavior('', 'brand1')
      expect(result).toBeDefined()
    })

    it('should handle malformed data gracefully', async () => {
      // Override mock with malformed data
      const originalData = mockSupabaseQuery.data
      mockSupabaseQuery.data = [
        {
          sent_at: 'invalid-date',
          response_received: true,
          response_time: 0,
          client_id: 'test-client',
          clients: { user_id: 'user1', brand_id: 'brand1' }
        }
      ]

      const result = await service.analyzeAudienceBehavior('user1', 'brand1')
      expect(result).toBeDefined()
      expect(result.averageResponseTime).toBe(0)
      
      // Reset mock
      mockSupabaseQuery.data = originalData
    })
  })

  describe('Time and Cron Utilities', () => {
    it('should handle various time formats', async () => {
      const testCases = [
        { input: '09:00', expected: true },
        { input: '23:59', expected: true },
        { input: '00:00', expected: true },
        { input: '14:30', expected: true }
      ]

      for (const testCase of testCases) {
        const scheduleConfig = {
          messageContent: 'Test',
          currentTime: testCase.input,
          frequency: 'daily',
          contentType: 'message',
          platform: 'whatsapp'
        }

        const result = await service.getScheduleOptimization('user1', scheduleConfig)
        expect(result).toBeDefined()
      }
    })

    it('should handle different frequency types', async () => {
      const frequencies = ['daily', 'weekly', 'monthly', 'custom']

      for (const frequency of frequencies) {
        const scheduleConfig = {
          messageContent: 'Test',
          currentTime: '10:00',
          frequency,
          contentType: 'message',
          platform: 'whatsapp'
        }

        const result = await service.getScheduleOptimization('user1', scheduleConfig)
        expect(result).toBeDefined()
      }
    })
  })
}) 