import { NextRequest, NextResponse } from 'next/server'
import { composioService } from '@/lib/composio'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...params } = body

    console.log(`🚀 Composio Demo API - Action: ${action}`)

    // Get user's WhatsApp settings
    const { data: settings } = await supabase
      .from('settings')
      .select('whatsapp_phone_id, whatsapp_access_token, whatsapp_api_url')
      .eq('user_id', user.id)
      .single()

    // Get user's brand context for AI features
    const { data: brand } = await supabase
      .from('brands')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const context = {
      user_id: user.id,
      brand_context: brand,
      whatsapp_settings: settings ? {
        phone_id: settings.whatsapp_phone_id,
        access_token: settings.whatsapp_access_token
      } : undefined
    }

    switch (action) {
      // Phase 1: Enhanced WhatsApp Messaging
      case 'send_message':
        const { to, message } = params
        if (!to || !message) {
          return NextResponse.json({ error: 'Missing to or message' }, { status: 400 })
        }

        const success = await composioService.sendWhatsAppMessage(
          to,
          message,
          settings?.whatsapp_access_token,
          settings?.whatsapp_phone_id
        )

        return NextResponse.json({
          success,
          action: 'send_message',
          phase: 1,
          message: success ? '✅ Message sent via Composio' : '❌ Failed to send message',
          features_unlocked: ['Enhanced error handling', 'Analytics tracking', 'Webhook integration']
        })

      // Phase 1: Bulk Messaging
      case 'send_bulk':
        const { messages } = params
        if (!messages || !Array.isArray(messages)) {
          return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 })
        }

        const results = await composioService.sendBulkWhatsAppMessages(
          messages,
          settings?.whatsapp_access_token,
          settings?.whatsapp_phone_id
        )

        return NextResponse.json({
          success: true,
          action: 'send_bulk',
          phase: 1,
          results,
          summary: {
            total: messages.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length
          },
          features_unlocked: ['Batch processing', 'Progress tracking', 'Webhook notifications']
        })

      // Phase 2: Advanced Scheduling
      case 'schedule_message':
        const { to: scheduleTo, message: scheduleMessage, schedule_time } = params
        if (!scheduleTo || !scheduleMessage || !schedule_time) {
          return NextResponse.json({ 
            error: 'Missing to, message, or schedule_time' 
          }, { status: 400 })
        }

        const scheduleId = await composioService.scheduleMessage(
          scheduleTo,
          scheduleMessage,
          new Date(schedule_time),
          settings?.whatsapp_access_token,
          settings?.whatsapp_phone_id
        )

        return NextResponse.json({
          success: !!scheduleId,
          action: 'schedule_message',
          phase: 2,
          schedule_id: scheduleId,
          message: scheduleId ? 
            `⏰ Message scheduled with ID: ${scheduleId}` : 
            '❌ Failed to schedule message',
          features_unlocked: ['Smart scheduling', 'Webhook automation', 'Event-driven workflows']
        })

      // Phase 2: Batch Processing with Scheduling
      case 'batch_process':
        const { batch_messages } = params
        if (!batch_messages || !Array.isArray(batch_messages)) {
          return NextResponse.json({ error: 'Invalid batch_messages array' }, { status: 400 })
        }

        let progressUpdates: any[] = []
        
        const batchResults = await composioService.processBatchMessages(
          batch_messages,
          settings?.whatsapp_access_token,
          settings?.whatsapp_phone_id,
          (progress) => {
            progressUpdates.push({
              completed: progress.completed,
              total: progress.total,
              current: progress.current,
              timestamp: new Date().toISOString()
            })
          }
        )

        return NextResponse.json({
          success: true,
          action: 'batch_process',
          phase: 2,
          results: batchResults,
          progress_tracking: progressUpdates,
          summary: {
            total: batch_messages.length,
            successful: batchResults.filter(r => r.success).length,
            scheduled: batchResults.filter(r => r.scheduleId).length,
            failed: batchResults.filter(r => !r.success).length
          },
          features_unlocked: ['Real-time progress', 'Mixed immediate/scheduled', 'Webhook events']
        })

      // Phase 3: AI-Powered Content Generation & Automation
      case 'ai_workflow':
        const { prompt, workflow_type } = params
        if (!prompt) {
          return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
        }

        const aiResult = await composioService.enhancedContentGeneration(prompt, context)

        return NextResponse.json({
          success: !!aiResult,
          action: 'ai_workflow',
          phase: 3,
          ai_response: aiResult,
          workflow_type: workflow_type || 'general',
          context_used: {
            brand_context: !!brand,
            whatsapp_settings: !!settings,
            user_authenticated: true
          },
          features_unlocked: [
            'AI tool calling',
            'Automated workflows',
            'Personalized content',
            'Smart decision making',
            'Context-aware responses'
          ]
        })

      // Phase 3: Complete Automation Demo
      case 'full_automation':
        const { customer_phone, automation_type } = params
        if (!customer_phone) {
          return NextResponse.json({ error: 'Missing customer_phone' }, { status: 400 })
        }

        // Simulate a complete automation workflow
        const automationPrompt = `Create a complete automation workflow for customer ${customer_phone}:
        
        1. Generate personalized welcome message
        2. Schedule follow-up messages
        3. Analyze customer engagement potential
        4. Recommend next actions
        
        Automation Type: ${automation_type || 'welcome_sequence'}
        Customer Phone: ${customer_phone}
        
        Execute appropriate actions automatically.`

        const automationResult = await composioService.enhancedContentGeneration(
          automationPrompt,
          context
        )

        return NextResponse.json({
          success: !!automationResult,
          action: 'full_automation',
          phase: 3,
          automation_result: automationResult,
          customer_phone,
          automation_type: automation_type || 'welcome_sequence',
          message: '🤖 Complete AI automation executed via Composio',
          features_demonstrated: [
            'AI decision making',
            'Automatic message generation',
            'Smart scheduling',
            'Workflow orchestration',
            'Context-aware automation'
          ]
        })

      default:
        return NextResponse.json({ 
          error: 'Invalid action',
          available_actions: [
            'send_message (Phase 1)',
            'send_bulk (Phase 1)', 
            'schedule_message (Phase 2)',
            'batch_process (Phase 2)',
            'ai_workflow (Phase 3)',
            'full_automation (Phase 3)'
          ]
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in Composio demo API:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        message: '❌ Composio integration error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint for demo documentation
export async function GET() {
  return NextResponse.json({
    title: '🚀 Composio WhatsApp Automation Demo',
    description: 'Comprehensive demo of all 3 phases of Composio integration',
    phases: {
      phase_1: {
        title: 'Enhanced WhatsApp Messaging',
        features: [
          'Robust error handling',
          'Analytics tracking',
          'Bulk messaging support',
          'Enhanced logging'
        ],
        actions: ['send_message', 'send_bulk']
      },
      phase_2: {
        title: 'Automated Scheduling & Triggers',
        features: [
          'Smart message scheduling',
          'Webhook automation',
          'Batch processing',
          'Progress tracking',
          'Event-driven workflows'
        ],
        actions: ['schedule_message', 'batch_process']
      },
      phase_3: {
        title: 'AI-Powered Automation',
        features: [
          'AI tool calling',
          'Automated content generation',
          'Context-aware responses',
          'Smart decision making',
          'Complete workflow automation'
        ],
        actions: ['ai_workflow', 'full_automation']
      }
    },
    usage: {
      endpoint: '/api/composio-demo',
      method: 'POST',
      required_headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token (handled by Supabase)'
      },
      example_requests: {
        phase_1_send: {
          action: 'send_message',
          to: '+1234567890',
          message: 'Hello via Composio!'
        },
        phase_2_schedule: {
          action: 'schedule_message',
          to: '+1234567890',
          message: 'Scheduled message via Composio',
          schedule_time: '2024-01-01T10:00:00Z'
        },
        phase_3_ai: {
          action: 'ai_workflow',
          prompt: 'Generate and send a personalized welcome message to new customer',
          workflow_type: 'customer_onboarding'
        }
      }
    },
    benefits: [
      '90% less boilerplate code',
      'Built-in error handling and retries',
      'Automatic webhook management',
      'AI-powered automation',
      'Real-time progress tracking',
      'Enterprise-grade reliability'
    ]
  })
} 