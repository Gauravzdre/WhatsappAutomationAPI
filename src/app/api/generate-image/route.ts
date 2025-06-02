import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import OpenAI from 'openai'

// Initialize OpenAI client with optional API key for build time
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
})

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
    const {
      prompt,
      style,
      aspectRatio,
      colorScheme,
      brandElements,
      productName,
      additionalDetails,
      brandContext
    } = body

    if (!prompt) {
      return NextResponse.json(
        { error: 'Image description is required' },
        { status: 400 }
      )
    }

    // Build enhanced prompt with brand context
    let enhancedPrompt = prompt

    // Add brand context if available
    if (brandContext) {
      // Add brand voice influence on visual style
      const brandVoiceStyles = {
        'Professional': 'clean, professional, corporate, polished',
        'Casual': 'relaxed, approachable, friendly, informal',
        'Playful': 'fun, vibrant, energetic, creative',
        'Luxury': 'elegant, sophisticated, premium, refined',
        'Friendly': 'warm, welcoming, inviting, personable',
        'Authoritative': 'strong, confident, bold, commanding',
        'Inspirational': 'uplifting, motivating, aspirational, empowering'
      }

      const voiceStyle = brandVoiceStyles[brandContext.brand_voice as keyof typeof brandVoiceStyles]
      if (voiceStyle) {
        enhancedPrompt += `, ${voiceStyle} style`
      }

      // Add industry context
      if (brandContext.industry) {
        const industryVisuals = {
          'Technology': 'modern, sleek, digital, innovative',
          'Healthcare': 'clean, trustworthy, professional, caring',
          'Finance': 'professional, secure, reliable, corporate',
          'Education': 'clear, informative, accessible, inspiring',
          'Food & Beverage': 'appetizing, fresh, vibrant, inviting',
          'Fashion': 'stylish, trendy, aesthetic, visually appealing',
          'Real Estate': 'professional, aspirational, quality, welcoming',
          'Travel & Tourism': 'beautiful, inspiring, adventurous, scenic'
        }
        const industryStyle = industryVisuals[brandContext.industry as keyof typeof industryVisuals]
        if (industryStyle) {
          enhancedPrompt += `, ${industryStyle}`
        }
      }

      // Add brand colors if specified
      if (brandContext.brand_colors?.length && colorScheme === 'brand-colors') {
        const colors = brandContext.brand_colors.join(', ')
        enhancedPrompt += `, using brand colors: ${colors}`
      }

      // Add brand name for context
      if (brandContext.name && brandElements?.includes(brandContext.name)) {
        enhancedPrompt += `, featuring ${brandContext.name} branding`
      }
    }

    // Add style information
    if (style) {
      const styleDescriptions = {
        realistic: 'photorealistic, high quality, professional photography',
        artistic: 'artistic, creative, stylized',
        minimal: 'minimal, clean, simple, modern design',
        vintage: 'vintage, retro, classic aesthetic',
        corporate: 'professional, business-like, corporate style',
        playful: 'fun, colorful, energetic, playful'
      }
      enhancedPrompt += `, ${styleDescriptions[style as keyof typeof styleDescriptions] || style}`
    }

    // Add color scheme (if not brand colors)
    if (colorScheme && colorScheme !== 'brand-colors') {
      enhancedPrompt += `, ${colorScheme.replace(/-/g, ' ')} color scheme`
    }

    // Add brand elements
    if (brandElements) {
      enhancedPrompt += `, incorporating ${brandElements}`
    }

    // Add product context
    if (productName) {
      enhancedPrompt += `, related to ${productName}`
    }

    // Add additional details
    if (additionalDetails) {
      enhancedPrompt += `, ${additionalDetails}`
    }

    // Add quality and composition guidelines
    enhancedPrompt += ', high quality, well-composed, professional'

    // Add brand consistency note if brand context is used
    if (brandContext) {
      enhancedPrompt += `, consistent with ${brandContext.name} brand identity`
    }

    console.log('Enhanced prompt:', enhancedPrompt)

    // Map aspect ratio to DALL-E size parameter
    const sizeMap = {
      '1:1': '1024x1024',
      '16:9': '1792x1024',
      '9:16': '1024x1792',
      '4:3': '1024x1024' // DALL-E doesn't support 4:3, use square
    }
    
    const size = sizeMap[aspectRatio as keyof typeof sizeMap] || '1024x1024'

    // Generate image using DALL-E
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: enhancedPrompt,
      n: 1,
      size: size as any,
      quality: 'standard',
      style: 'natural'
    })

    if (!response.data || response.data.length === 0) {
      throw new Error('Failed to generate image')
    }

    const imageUrl = response.data[0]?.url

    if (!imageUrl) {
      throw new Error('Failed to generate image')
    }

    // Get user's brand ID for saving content
    let brandId = null
    if (brandContext) {
      const { data: brand } = await supabase
        .from('brands')
        .select('id')
        .eq('user_id', user.id)
        .single()
      brandId = brand?.id
    }

    // Save to database using the new content_generation table
    const { data: savedContent, error: saveError } = await supabase
      .from('content_generation')
      .insert({
        user_id: user.id,
        brand_id: brandId,
        content_type: 'image',
        platform: 'general',
        brief: `AI Generated: ${productName || 'Image'}`,
        generated_content: enhancedPrompt,
        status: 'completed',
        metadata: {
          originalPrompt: prompt,
          enhancedPrompt,
          style,
          aspectRatio,
          colorScheme,
          brandElements,
          productName,
          additionalDetails,
          brandContextUsed: !!brandContext,
          brandInfo: brandContext ? {
            name: brandContext.name,
            voice: brandContext.brand_voice,
            industry: brandContext.industry,
            colors: brandContext.brand_colors
          } : null,
          generationParams: {
            model: 'dall-e-3',
            size,
            quality: 'standard',
            style: 'natural'
          },
          image_url: imageUrl,
          created_via: 'image_generator'
        }
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving generated image:', saveError)
      // Still return the generated image even if saving fails
    }

    // Transform savedContent to match expected format
    const transformedSavedContent = savedContent ? {
      id: savedContent.id,
      title: savedContent.brief,
      text_content: savedContent.generated_content,
      image_url: imageUrl,
      platform: savedContent.platform,
      created_at: savedContent.created_at,
      updated_at: savedContent.updated_at
    } : null

    return NextResponse.json({ 
      imageUrl,
      enhancedPrompt,
      savedContent: transformedSavedContent,
      brandContextUsed: !!brandContext
    })

  } catch (error) {
    console.error('Error generating image:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured' },
          { status: 500 }
        )
      }
      
      if (error.message.includes('billing')) {
        return NextResponse.json(
          { error: 'OpenAI API billing issue. Please check your account.' },
          { status: 500 }
        )
      }

      if (error.message.includes('content policy')) {
        return NextResponse.json(
          { error: 'Content violates OpenAI policy. Please modify your prompt.' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate image. Please try again.' },
      { status: 500 }
    )
  }
} 