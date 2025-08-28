import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import OpenAI from 'openai'

// Prefer OpenRouter for video generation
const useOpenRouter = !!process.env.OPENROUTER_API_KEY
const client = new OpenAI({
  apiKey: useOpenRouter ? process.env.OPENROUTER_API_KEY! : (process.env.OPENAI_API_KEY || 'dummy-key-for-build'),
  baseURL: useOpenRouter ? 'https://openrouter.ai/api/v1' : undefined,
})

export async function POST(request: NextRequest) {
  try {
    if (!useOpenRouter) {
      return NextResponse.json({ error: 'Video generation requires OPENROUTER_API_KEY.' }, { status: 500 })
    }

    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { prompt, durationSeconds = 5, aspectRatio = '16:9', brandContext } = body
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Enhance prompt with brand context if available
    const enhancedPrompt = brandContext?.name
      ? `${prompt}. Style consistent with ${brandContext.name} brand.`
      : prompt

    // Model id for Wan 2.2 on OpenRouter (can be overridden via env)
    const videoModel = process.env.AI_VIDEO_MODEL || 'kunlun/wan-2.2'

    // Many video models are polled jobs. Here we assume a single create call returns URLs.
    // If the provider requires async polling, replace with job status loop.
    const result = await client.chat.completions.create({
      model: videoModel,
      messages: [
        { role: 'system', content: 'You are a video generation assistant.' },
        { role: 'user', content: `Create a short video.
PROMPT: ${enhancedPrompt}
ASPECT_RATIO: ${aspectRatio}
DURATION_SECONDS: ${durationSeconds}
` }
      ],
      temperature: 0.2,
    })

    const content = result.choices[0]?.message?.content || ''
    // Expect provider to return a URL in content or tool output; try to extract
    const urlMatch = content.match(/https?:\/\/\S+/)
    const videoUrl = urlMatch ? urlMatch[0] : null

    if (!videoUrl) {
      return NextResponse.json({ error: 'Video generation did not return a URL.' }, { status: 502 })
    }

    // Persist metadata
    await supabase.from('content_generation').insert({
      user_id: user.id,
      content_type: 'video',
      platform: 'general',
      brief: 'AI Generated Video',
      generated_content: enhancedPrompt,
      status: 'completed',
      metadata: {
        video_url: videoUrl,
        generationParams: { model: videoModel, durationSeconds, aspectRatio }
      }
    })

    return NextResponse.json({ videoUrl, enhancedPrompt })
  } catch (error) {
    console.error('Error generating video:', error)
    return NextResponse.json({ error: 'Failed to generate video' }, { status: 500 })
  }
}


