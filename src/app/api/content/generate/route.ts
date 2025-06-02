import { NextRequest, NextResponse } from 'next/server';
import { getAIAgentManager } from '@/lib/ai-agent-manager';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { 
      brandId, 
      platform, 
      contentType, 
      topic, 
      tone, 
      targetAudience, 
      callToAction,
      includeHashtags,
      includeEmojis
    } = await request.json();

    // Validate required fields
    if (!brandId || !topic || !platform) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: brandId, topic, platform' 
        },
        { status: 400 }
      );
    }

    // Get AI Agent Manager
    const aiAgentManager = getAIAgentManager();

    // Generate content using AI agents
    const contentRequest = {
      contentType: contentType || 'post',
      platform,
      brief: topic,
      targetAudience: targetAudience || {}
    };

    const generatedTask = await aiAgentManager.generateContent(brandId, contentRequest);
    
    // Mock response for now - replace with actual AI generation
    const mockContent = generateMockContent({
      topic,
      tone,
      platform,
      callToAction,
      includeEmojis,
      includeHashtags
    });

    // Store generated content in database
    const { data: storedContent, error: storeError } = await supabase
      .from('generated_content')
      .insert({
        brand_id: brandId,
        platform,
        content_type: contentType || 'post',
        content: mockContent.content,
        hashtags: mockContent.hashtags,
        engagement_prediction: mockContent.engagementPrediction,
        suggested_time: mockContent.suggestedTime,
        variations: mockContent.variations,
        metadata: {
          topic,
          tone,
          targetAudience,
          callToAction,
          includeHashtags,
          includeEmojis
        }
      })
      .select()
      .single();

    if (storeError) {
      console.error('Error storing content:', storeError);
      // Continue even if storage fails
    }

    return NextResponse.json({
      success: true,
      content: mockContent,
      id: storedContent?.id || Date.now().toString()
    });

  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate content' 
      },
      { status: 500 }
    );
  }
}

function generateMockContent(params: {
  topic: string;
  tone: string;
  platform: string;
  callToAction: string;
  includeEmojis: boolean;
  includeHashtags: boolean;
}) {
  const { topic, tone, platform, callToAction, includeEmojis, includeHashtags } = params;

  // Content templates based on platform and tone
  const templates = {
    whatsapp: {
      professional: `📱 Exciting update about ${topic}!\n\nOur latest insights show remarkable progress in this area. We're committed to delivering exceptional value to our community.\n\n${callToAction}`,
      friendly: `Hey there! 😊\n\nJust wanted to share something amazing about ${topic}! This has been such a game-changer for us.\n\n${callToAction}`,
      casual: `What's up! 👋\n\nSo we've been working on ${topic} and wow... the results are incredible!\n\n${callToAction}`
    },
    instagram: {
      professional: `✨ Spotlight on ${topic}\n\nWe're excited to share our latest developments and how they're making a real difference.\n\n${callToAction}`,
      friendly: `💫 Can we talk about ${topic}? Because this is HUGE! 🎉\n\nSo grateful to share this journey with all of you.\n\n${callToAction}`,
      casual: `Okay but seriously... ${topic} is blowing our minds right now 🤯\n\n${callToAction}`
    },
    facebook: {
      professional: `We're pleased to announce significant progress regarding ${topic}. This development represents our ongoing commitment to innovation and excellence.\n\n${callToAction}`,
      friendly: `Friends! We have some exciting news about ${topic} that we just had to share with you! 🎉\n\n${callToAction}`,
      casual: `Alright Facebook fam, let's talk about ${topic} because this is pretty awesome! 🚀\n\n${callToAction}`
    },
    twitter: {
      professional: `Breaking: Major developments in ${topic}. Our commitment to excellence continues. ${callToAction}`,
      friendly: `Exciting news about ${topic}! 🎉 So grateful to share this with our amazing community. ${callToAction}`,
      casual: `Yo! ${topic} update and it's fire 🔥 ${callToAction}`
    },
    linkedin: {
      professional: `Industry Update: ${topic}\n\nI'm pleased to share insights on the latest developments in our field. This represents a significant step forward in our mission to drive innovation.\n\n${callToAction}`,
      friendly: `Exciting professional update on ${topic}! 📈\n\nI wanted to share this milestone with my network as it represents the collaborative effort of our entire team.\n\n${callToAction}`,
      casual: `Quick update on ${topic} - and it's pretty exciting! 🚀\n\nAlways love sharing wins with this amazing professional community.\n\n${callToAction}`
    }
  };

  const baseContent = templates[platform as keyof typeof templates]?.[tone as keyof typeof templates.whatsapp] || 
    `Great news about ${topic}! ${includeEmojis ? '🎉' : ''}\n\n${callToAction}`;

  // Generate hashtags if requested
  const hashtags = includeHashtags ? generateHashtags(topic, platform) : [];

  // Generate engagement predictions
  const engagementPrediction = {
    likes: Math.floor(Math.random() * 1000) + 100,
    comments: Math.floor(Math.random() * 50) + 10,
    shares: Math.floor(Math.random() * 100) + 5,
    reach: Math.floor(Math.random() * 5000) + 500
  };

  // Generate variations
  const variations = [
    baseContent.replace(/!/g, '.').replace(/🎉|🚀|✨|💫|🤯|🔥|📈/g, ''),
    `Did you know? ${baseContent}`,
    baseContent.replace(/We're|I'm|Our/g, 'Everyone is').replace(/we|our/g, 'they')
  ];

  // Suggested posting times based on platform
  const suggestedTimes = {
    whatsapp: '2:00 PM - 4:00 PM',
    instagram: '6:00 PM - 8:00 PM',
    facebook: '1:00 PM - 3:00 PM',
    twitter: '9:00 AM - 10:00 AM',
    linkedin: '8:00 AM - 9:00 AM'
  };

  return {
    content: includeHashtags && hashtags.length > 0 ? 
      `${baseContent}\n\n${hashtags.map(tag => `#${tag}`).join(' ')}` : 
      baseContent,
    hashtags,
    engagementPrediction,
    suggestedTime: suggestedTimes[platform as keyof typeof suggestedTimes] || '12:00 PM - 1:00 PM',
    variations: variations.slice(0, 2)
  };
}

function generateHashtags(topic: string, platform: string): string[] {
  const topicWords = topic.toLowerCase().split(' ').filter(word => word.length > 3);
  const platformHashtags = {
    instagram: ['insta', 'daily', 'life', 'mood', 'vibes'],
    twitter: ['news', 'update', 'trending', 'breaking'],
    facebook: ['community', 'share', 'connect'],
    linkedin: ['professional', 'business', 'industry', 'growth'],
    whatsapp: ['update', 'news', 'share']
  };

  const commonHashtags = ['motivation', 'success', 'innovation', 'growth', 'business'];
  const platformSpecific = platformHashtags[platform as keyof typeof platformHashtags] || [];

  const allHashtags = [...topicWords, ...platformSpecific, ...commonHashtags];
  return Array.from(new Set(allHashtags)).slice(0, 5);
} 