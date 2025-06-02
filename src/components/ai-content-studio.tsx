'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Sparkles, 
  Calendar, 
  Image as ImageIcon, 
  Video, 
  FileText,
  Instagram,
  MessageSquare,
  Twitter,
  Linkedin,
  Facebook,
  Copy,
  Download,
  Wand2,
  Clock,
  TrendingUp,
  Hash,
  Eye,
  Heart,
  Share2,
  RefreshCw,
  Zap
} from 'lucide-react';

interface ContentRequest {
  platform: string;
  contentType: string;
  topic: string;
  tone: string;
  targetAudience: string;
  callToAction: string;
  includeHashtags: boolean;
  includeEmojis: boolean;
  wordLimit?: number;
}

interface GeneratedContent {
  id: string;
  content: string;
  hashtags: string[];
  suggestedTime: string;
  engagementPrediction: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  };
  platform: string;
  variations: string[];
}

const PLATFORMS = [
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageSquare, color: 'text-green-600' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
  { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-blue-400' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' }
];

const CONTENT_TYPES = [
  { id: 'post', name: 'Social Post', icon: FileText },
  { id: 'story', name: 'Story', icon: ImageIcon },
  { id: 'video', name: 'Video Script', icon: Video },
  { id: 'ad', name: 'Advertisement', icon: TrendingUp }
];

const TONES = [
  'Professional', 'Casual', 'Friendly', 'Humorous', 'Inspirational',
  'Educational', 'Promotional', 'Urgent', 'Conversational', 'Authoritative'
];

export default function AIContentStudio() {
  const [contentRequest, setContentRequest] = useState<ContentRequest>({
    platform: 'whatsapp',
    contentType: 'post',
    topic: '',
    tone: 'friendly',
    targetAudience: '',
    callToAction: '',
    includeHashtags: true,
    includeEmojis: true
  });

  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null);

  const generateContent = async () => {
    if (!contentRequest.topic) return;

    setIsGenerating(true);
    try {
      // Mock AI content generation - replace with actual AI integration
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mockContent: GeneratedContent = {
        id: Date.now().toString(),
        content: generateMockContent(contentRequest),
        hashtags: generateMockHashtags(contentRequest.topic),
        suggestedTime: getSuggestedPostingTime(contentRequest.platform),
        engagementPrediction: {
          likes: Math.floor(Math.random() * 1000) + 100,
          comments: Math.floor(Math.random() * 50) + 10,
          shares: Math.floor(Math.random() * 100) + 5,
          reach: Math.floor(Math.random() * 5000) + 500
        },
        platform: contentRequest.platform,
        variations: [
          generateMockContent(contentRequest, 'variation1'),
          generateMockContent(contentRequest, 'variation2')
        ]
      };

      setGeneratedContent(prev => [mockContent, ...prev]);
      setSelectedContent(mockContent);
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockContent = (request: ContentRequest, variation?: string) => {
    const topics = {
      'new product launch': 'Excited to introduce our latest innovation! 🚀 This game-changing product will revolutionize your daily routine.',
      'customer testimonial': '⭐ Amazing feedback from our customers! Here\'s what Sarah had to say about her experience with us...',
      'behind the scenes': '👀 Ever wondered how we create our products? Take a peek behind the scenes at our creative process!',
      'tips and tricks': '💡 Pro tip: Here are 5 ways to maximize your productivity and achieve better results!',
      'industry news': '📰 Breaking: The latest trends in our industry are here! Stay ahead of the curve with these insights.'
    };

    const baseContent = topics[request.topic.toLowerCase() as keyof typeof topics] || 
      `Here's some amazing content about ${request.topic}! ${request.includeEmojis ? '✨' : ''}`;

    if (variation === 'variation1') {
      return baseContent.replace(/!/g, '.').replace(/🚀|✨|💡|👀|⭐|📰/g, '');
    } else if (variation === 'variation2') {
      return `Did you know? ${baseContent} ${request.callToAction}`;
    }

    return `${baseContent} ${request.callToAction}`;
  };

  const generateMockHashtags = (topic: string) => {
    const commonHashtags = ['motivation', 'success', 'business', 'innovation', 'growth'];
    const topicHashtags = topic.toLowerCase().split(' ');
    return [...topicHashtags, ...commonHashtags].slice(0, 5);
  };

  const getSuggestedPostingTime = (platform: string) => {
    const times = {
      whatsapp: '2:00 PM - 4:00 PM',
      instagram: '6:00 PM - 8:00 PM',
      facebook: '1:00 PM - 3:00 PM',
      twitter: '9:00 AM - 10:00 AM',
      linkedin: '8:00 AM - 9:00 AM'
    };
    return times[platform as keyof typeof times] || '12:00 PM - 1:00 PM';
  };

  const handleScheduleContent = async (content: GeneratedContent) => {
    // Implement scheduling logic
    console.log('Scheduling content:', content);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Show toast notification
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Content Studio</h1>
          <p className="text-gray-600 mt-1">Create engaging content with AI-powered intelligence</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
          <Button size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Campaign
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Generation Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wand2 className="w-5 h-5" />
                <span>Content Generator</span>
              </CardTitle>
              <CardDescription>
                Let AI create engaging content for your brand
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PLATFORMS.map((platform) => {
                    const IconComponent = platform.icon;
                    return (
                      <button
                        key={platform.id}
                        onClick={() => setContentRequest(prev => ({ ...prev, platform: platform.id }))}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          contentRequest.platform === platform.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <IconComponent className={`w-5 h-5 mx-auto mb-1 ${platform.color}`} />
                        <p className="text-xs font-medium">{platform.name}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type
                </label>
                <Select 
                  value={contentRequest.contentType}
                  onValueChange={(value) => setContentRequest(prev => ({ ...prev, contentType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center space-x-2">
                          <type.icon className="w-4 h-4" />
                          <span>{type.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic / Brief
                </label>
                <Textarea
                  placeholder="Describe what you want to post about..."
                  value={contentRequest.topic}
                  onChange={(e) => setContentRequest(prev => ({ ...prev, topic: e.target.value }))}
                  className="h-20"
                />
              </div>

              {/* Tone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tone
                </label>
                <Select 
                  value={contentRequest.tone}
                  onValueChange={(value) => setContentRequest(prev => ({ ...prev, tone: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map((tone) => (
                      <SelectItem key={tone} value={tone.toLowerCase()}>
                        {tone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <Input
                  placeholder="e.g., Young professionals, tech enthusiasts..."
                  value={contentRequest.targetAudience}
                  onChange={(e) => setContentRequest(prev => ({ ...prev, targetAudience: e.target.value }))}
                />
              </div>

              {/* Call to Action */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call to Action
                </label>
                <Input
                  placeholder="e.g., Visit our website, DM us for more info..."
                  value={contentRequest.callToAction}
                  onChange={(e) => setContentRequest(prev => ({ ...prev, callToAction: e.target.value }))}
                />
              </div>

              {/* Options */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hashtags"
                    checked={contentRequest.includeHashtags}
                    onChange={(e) => setContentRequest(prev => ({ ...prev, includeHashtags: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="hashtags" className="text-sm text-gray-700">
                    Include hashtags
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="emojis"
                    checked={contentRequest.includeEmojis}
                    onChange={(e) => setContentRequest(prev => ({ ...prev, includeEmojis: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="emojis" className="text-sm text-gray-700">
                    Include emojis
                  </label>
                </div>
              </div>

              {/* Generate Button */}
              <Button 
                onClick={generateContent}
                disabled={!contentRequest.topic || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating Content...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Generated Content */}
        <div className="lg:col-span-2">
          {selectedContent ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      <span>Generated Content</span>
                    </CardTitle>
                    <CardDescription>
                      AI-generated content optimized for {selectedContent.platform}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(selectedContent.content)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button size="sm" onClick={() => handleScheduleContent(selectedContent)}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="content" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="variations">Variations</TabsTrigger>
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                  </TabsList>

                  <TabsContent value="content" className="space-y-4">
                    {/* Main Content */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedContent.content}</p>
                    </div>

                    {/* Hashtags */}
                    {selectedContent.hashtags.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <Hash className="w-4 h-4 mr-1" />
                          Suggested Hashtags
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedContent.hashtags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggested Posting Time */}
                    <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Optimal Posting Time</p>
                        <p className="text-sm text-blue-700">{selectedContent.suggestedTime}</p>
                      </div>
                    </div>

                    {/* Engagement Prediction */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Engagement Prediction</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <Heart className="w-5 h-5 text-red-600 mx-auto mb-1" />
                          <p className="text-lg font-bold text-red-600">{selectedContent.engagementPrediction.likes}</p>
                          <p className="text-xs text-red-700">Likes</p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <MessageSquare className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                          <p className="text-lg font-bold text-blue-600">{selectedContent.engagementPrediction.comments}</p>
                          <p className="text-xs text-blue-700">Comments</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <Share2 className="w-5 h-5 text-green-600 mx-auto mb-1" />
                          <p className="text-lg font-bold text-green-600">{selectedContent.engagementPrediction.shares}</p>
                          <p className="text-xs text-green-700">Shares</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <Eye className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                          <p className="text-lg font-bold text-purple-600">{selectedContent.engagementPrediction.reach}</p>
                          <p className="text-xs text-purple-700">Reach</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="variations" className="space-y-4">
                    <div className="space-y-4">
                      {selectedContent.variations.map((variation, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900">Variation {index + 1}</h4>
                            <Button size="sm" variant="outline" onClick={() => copyToClipboard(variation)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">{variation}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="insights" className="space-y-4">
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <h4 className="font-medium text-blue-900">Platform Optimization</h4>
                        <p className="text-sm text-blue-800 mt-1">
                          This content is optimized for {selectedContent.platform} based on platform-specific best practices and your audience behavior.
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                        <h4 className="font-medium text-green-900">Engagement Potential</h4>
                        <p className="text-sm text-green-800 mt-1">
                          High engagement potential detected. The tone and content structure align well with your audience preferences.
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                        <h4 className="font-medium text-purple-900">Brand Consistency</h4>
                        <p className="text-sm text-purple-800 mt-1">
                          Content maintains your brand voice and follows established guidelines while incorporating trending elements.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No content generated yet</h3>
                <p className="text-sm">Fill out the form and click "Generate Content" to get started</p>
              </div>
            </Card>
          )}

          {/* Content History */}
          {generatedContent.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Content</CardTitle>
                <CardDescription>Previously generated content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {generatedContent.slice(0, 5).map((content) => (
                    <div 
                      key={content.id}
                      onClick={() => setSelectedContent(content)}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 line-clamp-2">{content.content}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className="text-xs">{content.platform}</Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(parseInt(content.id)).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 