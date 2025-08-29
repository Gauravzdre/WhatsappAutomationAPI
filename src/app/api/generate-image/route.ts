import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'

// Initialize AI client: prefer OpenRouter for images if configured
const useOpenRouter = !!process.env.OPENROUTER_API_KEY
const openai = new OpenAI({
  apiKey: useOpenRouter
    ? process.env.OPENROUTER_API_KEY!
    : (process.env.OPENAI_API_KEY || 'dummy-key-for-build'),
  baseURL: useOpenRouter ? 'https://openrouter.ai/api/v1' : undefined,
})

// Helper function to save response for debugging
function saveResponseForDebugging(response: any, approach: string) {
  try {
    const debugDir = path.join(process.cwd(), 'debug-responses')
    if (!fs.existsSync(debugDir)) {
      fs.mkdirSync(debugDir, { recursive: true })
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `gemini-response-${approach}-${timestamp}.json`
    const filepath = path.join(debugDir, filename)
    
    fs.writeFileSync(filepath, JSON.stringify(response, null, 2))
    console.log(`Saved debug response to: ${filepath}`)
  } catch (error) {
    console.error('Failed to save debug response:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if at least one provider key is configured
    if (!useOpenRouter && (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key-for-build')) {
      return NextResponse.json(
        { error: 'No AI provider configured. Set OPENROUTER_API_KEY or OPENAI_API_KEY.' },
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

    // Map aspect ratio to size parameter
    const sizeMap = {
      '1:1': '1024x1024',
      '16:9': '1792x1024',
      '9:16': '1024x1792',
      '4:3': '1024x1024'
    }
    
    const size = sizeMap[aspectRatio as keyof typeof sizeMap] || '1024x1024'

         // Generate image using selected provider/model
     const imageModel = process.env.AI_IMAGE_MODEL || (useOpenRouter ? 'google/gemini-2.5-flash-image-preview:free' : 'dall-e-3')
    
    let imageUrl: string
    
    if (useOpenRouter) {
      // For OpenRouter models, we need to handle different model types
      const isGeminiModel = imageModel.includes('gemini')
      
             if (isGeminiModel) {
         // Gemini models use chat completions with specific image generation format
         try {
           console.log('Using Gemini model for image generation:', imageModel)
           
           // Try different approaches for Gemini 2.5 Flash Image Preview
           let response
           let content = ''
           
           // Approach 1: Direct image generation request
           try {
             console.log('Trying direct image generation approach...')
             response = await openai.chat.completions.create({
               model: imageModel,
               messages: [
                 {
                   role: 'user',
                   content: [
                     {
                       type: 'text',
                       text: `Create an image: ${enhancedPrompt}
                       
                       Requirements:
                       - Aspect ratio: ${aspectRatio}
                       - Style: ${style || 'natural'}
                       - Quality: high resolution
                       
                       Generate the image and provide the URL.`
                     }
                   ]
                 }
               ],
               max_tokens: 4000,
               temperature: 0.7,
             })
             
                         content = response.choices[0]?.message?.content || ''
            console.log('Gemini direct approach response:', content)
            
            // Check if the response has image data in the message structure
            const message = response.choices[0]?.message
            if (message && message.content && Array.isArray(message.content)) {
              console.log('Checking message content array for image data...')
              for (const contentItem of message.content) {
                if (contentItem.type === 'image_url' && contentItem.image_url) {
                  console.log('Found image_url in message content')
                  imageUrl = contentItem.image_url.url || contentItem.image_url
                  break
                }
              }
            }
             
           } catch (directError) {
             console.log('Direct approach failed, trying alternative...')
             
             // Approach 2: Alternative prompt format
             response = await openai.chat.completions.create({
               model: imageModel,
               messages: [
                 {
                   role: 'user',
                   content: [
                     {
                       type: 'text',
                       text: `Generate an image based on this description: "${enhancedPrompt}"
                       
                       The image should be:
                       - ${aspectRatio} aspect ratio
                       - ${style || 'natural'} style
                       - High quality and professional
                       
                       Please provide the image URL.`
                     }
                   ]
                 }
               ],
               max_tokens: 4000,
               temperature: 0.7,
             })
             
                           content = response.choices[0]?.message?.content || ''
              console.log('Gemini alternative approach response:', content)
              
              // Save full response for debugging (alternative approach)
              console.log('=== FULL GEMINI ALTERNATIVE RESPONSE FOR DEBUGGING ===')
              console.log('Response object:', JSON.stringify(response, null, 2))
              console.log('Response content:', content)
              console.log('Message structure:', JSON.stringify(response.choices[0]?.message, null, 2))
              console.log('=== END ALTERNATIVE DEBUG INFO ===')
              
              // Save response to file for detailed debugging
              saveResponseForDebugging(response, 'alternative')
              
              // Check if the response has image data in the message structure
              const message = response.choices[0]?.message
              if (message && message.content && Array.isArray(message.content)) {
                console.log('Checking message content array for image data...')
                for (const contentItem of message.content) {
                  if (contentItem.type === 'image_url' && contentItem.image_url) {
                    console.log('Found image_url in message content')
                    imageUrl = contentItem.image_url.url || contentItem.image_url
                    break
                  }
                }
              }
              
              // Check for images array in the message (Gemini 2.5 Flash Image Preview format)
              if (!imageUrl && message && message.images && Array.isArray(message.images)) {
                console.log('Found images array in message, checking for base64 data...')
                for (const imageItem of message.images) {
                  if (imageItem.type === 'image_url' && imageItem.image_url) {
                    console.log('Found image_url in images array')
                    // Handle both URL strings and objects with url property
                    if (typeof imageItem.image_url === 'string') {
                      imageUrl = imageItem.image_url
                    } else if (imageItem.image_url.url) {
                      imageUrl = imageItem.image_url.url
                    }
                    break
                  }
                }
              }
           }
           
                       // Save full response for debugging
            console.log('=== FULL GEMINI RESPONSE FOR DEBUGGING ===')
            console.log('Response object:', JSON.stringify(response, null, 2))
            console.log('Response content:', content)
            console.log('Message structure:', JSON.stringify(response.choices[0]?.message, null, 2))
            console.log('=== END DEBUG INFO ===')
            
            // Save response to file for detailed debugging
            saveResponseForDebugging(response, 'direct')
            
            // Check if response contains base64 image data
            console.log('Checking for base64 image data in response...')
            
            // First, check if the response has image data in the message structure
            const message = response.choices[0]?.message
            if (message && message.content && Array.isArray(message.content)) {
              console.log('Checking message content array for image data...')
              for (const contentItem of message.content) {
                if (contentItem.type === 'image_url' && contentItem.image_url) {
                  console.log('Found image_url in message content')
                  imageUrl = contentItem.image_url.url || contentItem.image_url
                  break
                }
              }
            }
            
            // Check for images array in the message (Gemini 2.5 Flash Image Preview format)
            if (!imageUrl && message && message.images && Array.isArray(message.images)) {
              console.log('Found images array in message, checking for base64 data...')
              for (const imageItem of message.images) {
                if (imageItem.type === 'image_url' && imageItem.image_url) {
                  console.log('Found image_url in images array')
                  // Handle both URL strings and objects with url property
                  if (typeof imageItem.image_url === 'string') {
                    imageUrl = imageItem.image_url
                  } else if (imageItem.image_url.url) {
                    imageUrl = imageItem.image_url.url
                  }
                  break
                }
              }
            }
            
            // If no image URL found in structure, check content for base64
            if (!imageUrl) {
              // Look for base64 data in the response content
              const base64Match = content.match(/data:image\/([^;]+);base64,([^"\s]+)/i)
            
              if (base64Match) {
                console.log('Found base64 image data in response')
                const imageFormat = base64Match[1] || 'png'
                const base64Data = base64Match[2]
                
                // Convert base64 to blob URL or save to temporary storage
                // For now, we'll create a data URL that can be used directly
                imageUrl = `data:image/${imageFormat};base64,${base64Data}`
                console.log('Created data URL from base64 image')
                
              } else {
                // Try to find base64 data without the data URL prefix
                const rawBase64Match = content.match(/[A-Za-z0-9+/]{100,}={0,2}/)
                
                if (rawBase64Match) {
                  console.log('Found raw base64 data, assuming PNG format')
                  const base64Data = rawBase64Match[0]
                  imageUrl = `data:image/png;base64,${base64Data}`
                  console.log('Created data URL from raw base64 image')
                  
                } else {
                  // Try multiple patterns to extract image URL (fallback)
                  let urlMatch = content.match(/https?:\/\/[^\s]+\.(?:jpg|jpeg|png|webp|gif)/i)
                  
                  if (!urlMatch) {
                    // Try to find any URL that might contain image
                    urlMatch = content.match(/https?:\/\/[^\s]+/i)
                  }
                  
                  if (!urlMatch) {
                    // Try to find URLs in markdown format
                    urlMatch = content.match(/!\[.*?\]\((https?:\/\/[^\s]+)\)/i)
                    if (urlMatch) {
                      urlMatch = [urlMatch[1]] // Extract the URL from markdown
                    }
                  }
                  
                  if (!urlMatch) {
                    console.error('No image data found in Gemini response')
                    console.error('Content length:', content.length)
                    console.error('Content preview:', content.substring(0, 500))
                    
                    // Check if the model might be returning the image in a different format
                    if (content.toLowerCase().includes('image') || content.toLowerCase().includes('generated')) {
                      console.log('Model seems to have generated something but no URL or base64 found')
                      throw new Error('Gemini generated content but no image data found. Response: ' + content.substring(0, 300))
                    } else {
                      throw new Error('No image data found in Gemini response. Response content: ' + content.substring(0, 200))
                    }
                  }
                  
                  imageUrl = urlMatch[0]
                  console.log('Extracted image URL from Gemini:', imageUrl)
                }
              }
            }
          } catch (geminiError) {
           console.error('Gemini image generation failed:', geminiError)
           
           // If Gemini fails, try fallback to DALL-E 3 via OpenRouter
           console.log('Falling back to DALL-E 3 via OpenRouter...')
           try {
             const fallbackResponse = await openai.images.generate({
               model: 'openai/dall-e-3',
               prompt: enhancedPrompt,
               n: 1,
               size: size as any,
               quality: 'standard',
               style: 'natural'
             })
             
             if (!fallbackResponse.data || fallbackResponse.data.length === 0) {
               throw new Error('Fallback DALL-E 3 also failed')
             }
             
             imageUrl = fallbackResponse.data[0]?.url
             if (!imageUrl) {
               throw new Error('No image URL in fallback response')
             }
             
             console.log('Successfully generated image using DALL-E 3 fallback')
             
           } catch (fallbackError) {
             console.error('Fallback also failed:', fallbackError)
             throw geminiError // Throw original error
           }
         }
        
      } else {
        // For other OpenRouter models (like DALL-E), use images.generate endpoint
        try {
          console.log('Using OpenRouter images.generate for model:', imageModel)
          const response = await openai.images.generate({
            model: imageModel,
            prompt: enhancedPrompt,
            n: 1,
            size: size as any,
            quality: 'standard',
            style: 'natural'
          })
          
          if (!response.data || response.data.length === 0) {
            throw new Error('No image data returned from OpenRouter')
          }
          
          imageUrl = response.data[0]?.url
          if (!imageUrl) {
            throw new Error('No image URL in response data')
          }
          
        } catch (openRouterError) {
          console.error('OpenRouter images.generate failed:', openRouterError)
          throw openRouterError
        }
      }
      
    } else {
      // OpenAI DALL-E uses images.generate
      const response = await openai.images.generate({
        model: imageModel,
        prompt: enhancedPrompt,
        n: 1,
        size: size as any,
        quality: 'standard',
        style: 'natural'
      })

      if (!response.data || response.data.length === 0) {
        throw new Error('Failed to generate image')
      }

      imageUrl = response.data[0]?.url

      if (!imageUrl) {
        throw new Error('Failed to generate image')
      }
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
    
    // If no brand context, try to get the user's default brand
    if (!brandId) {
      const { data: defaultBrand } = await supabase
        .from('brands')
        .select('id')
        .eq('user_id', user.id)
        .single()
      brandId = defaultBrand?.id
    }
    
    // If still no brand, we'll save without brand association (brand_id can be null)
    if (!brandId) {
      console.log('No brand found for user, saving content without brand association');
    }

    // Save to database using the new content_generation table
    const insertData = {
      user_id: user.id,
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
          model: imageModel,
          size,
          quality: 'standard',
          style: 'natural'
        },
        image_url: imageUrl,
        created_via: 'image_generator'
      }
    };

    // Only add brand_id if it exists
    if (brandId) {
      insertData.brand_id = brandId;
    }

    const { data: savedContent, error: saveError } = await supabase
      .from('content_generation')
      .insert(insertData)
      .select()
      .single()

    if (saveError) {
      console.error('Error saving generated image:', saveError)
      // Still return the generated image even if saving fails
    } else {
      console.log('Successfully saved image to database');
      console.log('Saved image URL:', imageUrl);
      console.log('Saved content ID:', savedContent?.id);
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