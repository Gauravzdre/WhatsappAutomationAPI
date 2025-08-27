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
      productName,
      productDescription,
      targetAudience,
      keyBenefits,
      callToAction,
      platform,
      tone,
      contentType,
      includeHashtags,
      includeEmojis,
      additionalPrompt,
      brandContext,
      referenceImages
    } = body

    if (!productName || !productDescription || !platform) {
      return NextResponse.json(
        { error: 'Product name, description, and platform are required' },
        { status: 400 }
      )
    }

    let imageAnalysis = ''
    
    // Analyze reference images if provided using OpenAI Vision
    if (referenceImages && referenceImages.length > 0) {
      try {
        console.log(`Analyzing ${referenceImages.length} reference images...`)
        
        // Prepare images for Vision API (limit to first 4 images for token efficiency)
        const imagesToAnalyze = referenceImages.slice(0, 4).map((imageUrl: string) => ({
          type: "image_url" as const,
          image_url: {
            url: imageUrl,
            detail: "low" as const // Use low detail for efficiency
          }
        }))

        const visionCompletion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze these reference images for a ${platform} post about "${productName}". 
                  
                  Please provide:
                  1. Visual style and aesthetic (colors, mood, composition)
                  2. Key visual elements and design patterns
                  3. Brand personality conveyed through the visuals
                  4. Content suggestions that align with the visual style
                  5. Any text, logos, or branding visible in the images
                  
                  Keep your analysis concise and focused on elements that would help create consistent social media content.`
                },
                ...imagesToAnalyze
              ]
            }
          ],
          max_tokens: 500,
          temperature: 0.3,
        })

        imageAnalysis = visionCompletion.choices[0]?.message?.content || ''
        console.log('Image analysis completed')

      } catch (visionError) {
        console.error('Error analyzing images:', visionError)
        imageAnalysis = 'Unable to analyze images at this time.'
      }
    }

    // Build the enhanced prompt with brand context and image analysis
    const systemPrompt = `You are an expert social media content creator and brand strategist. Create engaging, high-converting social media posts that are consistent with brand identity and platform best practices.

Key Requirements:
- Maintain brand voice and messaging consistency
- Align content with brand values and positioning
- Create platform-optimized content
- Ensure visual and textual brand alignment`

    const platformGuidelines = {
      instagram: 'Instagram posts should be visually engaging, use relevant hashtags, tell a story, and encourage engagement. Keep captions conversational with strong visual elements.',
      facebook: 'Facebook posts should encourage conversation, be community-focused, and work well with both text and visual content. Focus on engagement and sharing.',
      twitter: 'Twitter/X posts must be concise (under 280 characters), punchy, and encourage retweets and replies. Use trending hashtags strategically.',
      linkedin: 'LinkedIn posts should be professional, valuable, and industry-focused. Share insights and establish thought leadership while remaining authentic.',
      tiktok: 'TikTok captions should be short, trendy, hook viewers immediately, and align with current trends and challenges.'
    }

    // Build brand context section
    let brandContextPrompt = ''
    if (brandContext) {
      brandContextPrompt = `
BRAND CONTEXT:
- Brand Name: ${brandContext.name}
- Industry: ${brandContext.industry || 'Not specified'}
- Brand Voice: ${brandContext.brand_voice || 'Professional'}
- Target Audience: ${brandContext.target_audience || 'General audience'}
- Business Goals: ${brandContext.business_goals || 'Not specified'}
- Unique Value Proposition: ${brandContext.unique_value_proposition || 'Not specified'}
- Brand Guidelines: ${brandContext.brand_guidelines || 'Use professional tone and maintain consistency'}
${brandContext.brand_colors?.length ? `- Brand Colors: ${brandContext.brand_colors.join(', ')}` : ''}

CRITICAL: Ensure all content aligns with the brand voice, values, and positioning. The tone should match "${brandContext.brand_voice || 'Professional'}" throughout.`
    }

    // Build image analysis section
    let imageAnalysisPrompt = ''
    if (imageAnalysis) {
      imageAnalysisPrompt = `
VISUAL REFERENCE ANALYSIS:
${imageAnalysis}

IMPORTANT: Create content that complements and aligns with the visual style and brand elements identified in the reference images.`
    }

    const userPrompt = `
Create a ${platform} post for the following product:

PRODUCT INFORMATION:
- Product: ${productName}
- Description: ${productDescription}
${targetAudience ? `- Target Audience: ${targetAudience}` : ''}
${keyBenefits ? `- Key Benefits: ${keyBenefits}` : ''}
${callToAction ? `- Call to Action: ${callToAction}` : ''}

CONTENT SPECIFICATIONS:
- Content Type: ${contentType || 'General promotional content'}
- Tone: ${tone || (brandContext?.brand_voice || 'Professional')}
- Platform: ${platform}
- Include Hashtags: ${includeHashtags ? 'Yes' : 'No'}
- Include Emojis: ${includeEmojis ? 'Yes' : 'No'}

PLATFORM GUIDELINES:
${platformGuidelines[platform as keyof typeof platformGuidelines]}

${brandContextPrompt}

${imageAnalysisPrompt}

${additionalPrompt ? `\nADDITIONAL INSTRUCTIONS: ${additionalPrompt}` : ''}

FINAL REQUIREMENTS:
1. Create content that is consistent with brand identity and voice
2. Ensure the messaging aligns with brand values and positioning  
3. Make it engaging and conversion-focused for ${platform}
4. If reference images were provided, ensure content complements the visual style
5. Follow all platform-specific best practices
6. Maintain authentic brand voice throughout

Generate compelling content that will resonate with the target audience and drive engagement while staying true to the brand identity.
`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 800,
      temperature: 0.7,
    })

    const generatedText = completion.choices[0]?.message?.content

    if (!generatedText) {
      throw new Error('Failed to generate content')
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
        content_type: 'text',
        platform: platform,
        brief: `${platform} post for ${productName}`,
        generated_content: generatedText,
        status: 'completed',
        metadata: {
          productName,
          productDescription,
          targetAudience,
          keyBenefits,
          callToAction,
          tone,
          contentType,
          includeHashtags,
          includeEmojis,
          additionalPrompt,
          brandContextUsed: !!brandContext,
          brandInfo: brandContext ? {
            name: brandContext.name,
            voice: brandContext.brand_voice,
            industry: brandContext.industry
          } : null,
          imageAnalysisUsed: !!imageAnalysis,
          imagesAnalyzed: referenceImages?.length || 0,
          generationParams: {
            model: 'gpt-4',
            temperature: 0.7,
            visionModelUsed: !!imageAnalysis
          },
          created_via: 'post_text_generator'
        }
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving generated content:', saveError)
      // Still return the generated text even if saving fails
    }

    // Transform savedContent to match expected format
    const transformedSavedContent = savedContent ? {
      id: savedContent.id,
      title: savedContent.brief,
      text_content: savedContent.generated_content,
      platform: savedContent.platform,
      created_at: savedContent.created_at,
      updated_at: savedContent.updated_at
    } : null

    return NextResponse.json({ 
      generatedText,
      savedContent: transformedSavedContent,
      imageAnalysis: imageAnalysis || null,
      brandContextUsed: !!brandContext,
      imagesAnalyzed: referenceImages?.length || 0
    })

  } catch (error) {
    console.error('Error generating post text:', error)
    
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate post text' },
      { status: 500 }
    )
  }
} 