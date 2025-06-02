import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
})

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const chatType = searchParams.get('type')
    const conversationId = searchParams.get('conversationId')

    // Get user's brand
    const { data: brand } = await supabase
      .from('brands')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!brand) {
      return NextResponse.json({ error: 'No brand found' }, { status: 404 })
    }

    // If specific conversation requested
    if (conversationId) {
      const { data: conversation, error } = await supabase
        .from('brand_chat_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('brand_id', brand.id)
        .single()

      if (error) {
        console.error('Error fetching conversation:', error)
        return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 })
      }

      return NextResponse.json({ conversation })
    }

    // Get all conversations for brand
    let query = supabase
      .from('brand_chat_conversations')
      .select('*')
      .eq('brand_id', brand.id)
      .order('updated_at', { ascending: false })

    if (chatType) {
      query = query.eq('chat_type', chatType)
    }

    const { data: conversations, error } = await query

    if (error) {
      console.error('Error fetching conversations:', error)
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
    }

    return NextResponse.json({ conversations })

  } catch (error) {
    console.error('Error in brand-chat GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key-for-build') {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...data } = body

    // Get user's brand
    const { data: brand } = await supabase
      .from('brands')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!brand) {
      return NextResponse.json({ error: 'No brand found' }, { status: 404 })
    }

    if (action === 'start_conversation') {
      const { chat_type, title, initial_message, context_data } = data

      if (!chat_type || !initial_message) {
        return NextResponse.json(
          { error: 'Chat type and initial message are required' },
          { status: 400 }
        )
      }

      // Generate AI response
      const systemPrompt = getSystemPrompt(chat_type, brand, context_data)
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: initial_message }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      })

      const aiResponse = completion.choices[0]?.message?.content

      if (!aiResponse) {
        throw new Error('Failed to generate AI response')
      }

      // Create conversation with initial messages
      const messages = [
        {
          id: Date.now().toString(),
          role: 'user' as const,
          content: initial_message,
          timestamp: new Date().toISOString()
        },
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: aiResponse,
          timestamp: new Date().toISOString()
        }
      ]

      const { data: conversation, error } = await supabase
        .from('brand_chat_conversations')
        .insert({
          brand_id: brand.id,
          chat_type,
          title: title || generateTitle(chat_type, initial_message),
          messages,
          context_data
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating conversation:', error)
        return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
      }

      return NextResponse.json({ conversation })

    } else if (action === 'add_message') {
      const { conversation_id, message } = data

      if (!conversation_id || !message) {
        return NextResponse.json(
          { error: 'Conversation ID and message are required' },
          { status: 400 }
        )
      }

      // Get existing conversation
      const { data: conversation, error: fetchError } = await supabase
        .from('brand_chat_conversations')
        .select('*')
        .eq('id', conversation_id)
        .eq('brand_id', brand.id)
        .single()

      if (fetchError || !conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }

      // Generate AI response
      const systemPrompt = getSystemPrompt(conversation.chat_type, brand, conversation.context_data)
      
      // Build conversation history for context
      const conversationHistory = conversation.messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      })

      const aiResponse = completion.choices[0]?.message?.content

      if (!aiResponse) {
        throw new Error('Failed to generate AI response')
      }

      // Add new messages
      const newMessages = [
        ...conversation.messages,
        {
          id: Date.now().toString(),
          role: 'user' as const,
          content: message,
          timestamp: new Date().toISOString()
        },
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: aiResponse,
          timestamp: new Date().toISOString()
        }
      ]

      // Update conversation
      const { data: updatedConversation, error: updateError } = await supabase
        .from('brand_chat_conversations')
        .update({ messages: newMessages })
        .eq('id', conversation_id)
        .eq('brand_id', brand.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating conversation:', updateError)
        return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 })
      }

      return NextResponse.json({ conversation: updatedConversation })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Error in brand-chat POST:', error)
    
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getSystemPrompt(chatType: string, brand: any, contextData?: any): string {
  const brandContext = `
Brand Information:
- Name: ${brand.name}
- Industry: ${brand.industry || 'Not specified'}
- Target Audience: ${brand.target_audience || 'Not specified'}
- Brand Voice: ${brand.brand_voice || 'Professional'}
- Business Goals: ${brand.business_goals || 'Not specified'}
- Unique Value Proposition: ${brand.unique_value_proposition || 'Not specified'}
`

  switch (chatType) {
    case 'scaling':
      return `You are an expert business scaling consultant. Help the user develop strategies to scale their brand effectively.

${brandContext}

Focus on:
- Growth strategies and market expansion
- Operational scaling and process optimization
- Team building and organizational development
- Financial planning for growth
- Technology and automation opportunities
- Partnership and collaboration strategies

Provide actionable, specific advice tailored to their brand and industry. Ask clarifying questions when needed to give more personalized recommendations.`

    case 'sales_strategy':
      return `You are an expert sales strategist. Help the user develop and optimize their sales processes and strategies.

${brandContext}

Focus on:
- Sales funnel optimization
- Lead generation and conversion strategies
- Customer acquisition and retention
- Pricing strategies and value communication
- Sales process automation
- Team training and performance improvement
- Market penetration tactics

Provide practical, implementable sales strategies. Consider their target audience and industry when making recommendations.`

    case 'content_strategy':
      return `You are an expert content strategist and brand marketing consultant. Help the user develop comprehensive content strategies for their brand.

${brandContext}

${contextData?.content_id ? `Context: User is discussing content with ID: ${contextData.content_id}` : ''}

Focus on:
- Content planning and calendar development
- Platform-specific content optimization
- Brand voice and messaging consistency
- Audience engagement strategies
- Content performance and analytics
- Repurposing and content efficiency
- Trend identification and adaptation

Provide strategic advice on content creation, distribution, and optimization that aligns with their brand goals and audience.`

    default:
      return `You are a helpful business consultant specializing in brand development and growth strategies.

${brandContext}

Provide helpful, actionable advice to help the user grow and develop their brand.`
  }
}

function generateTitle(chatType: string, initialMessage: string): string {
  const messagePreview = initialMessage.slice(0, 50)
  
  switch (chatType) {
    case 'scaling':
      return `Scaling Strategy: ${messagePreview}...`
    case 'sales_strategy':
      return `Sales Strategy: ${messagePreview}...`
    case 'content_strategy':
      return `Content Strategy: ${messagePreview}...`
    default:
      return `Brand Discussion: ${messagePreview}...`
  }
} 