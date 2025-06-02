'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Loader2, Sparkles, Brain, Target, Palette } from 'lucide-react';
import { getAIAgentManager } from '@/lib/ai-agent-manager';

interface BrandFormData {
  name: string;
  industry: string;
  description: string;
  brandVoice: {
    tone: string;
    personality: string[];
    keywords: string[];
  };
  visualIdentity: {
    primaryColor: string;
    secondaryColor: string;
    fontStyle: string;
    logoUrl?: string;
  };
  targetAudience: {
    demographics: string;
    interests: string[];
    painPoints: string[];
    platforms: string[];
  };
  guidelines: string;
  goals: string[];
  budget: number;
}

interface AIEnhancedBrandFormProps {
  onSubmit: (data: BrandFormData) => void;
  loading?: boolean;
}

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Retail',
  'Food & Beverage', 'Travel', 'Fashion', 'Real Estate', 'Automotive',
  'Entertainment', 'Sports', 'Non-profit', 'B2B Services', 'Other'
];

const BRAND_TONES = [
  'Professional', 'Friendly', 'Authoritative', 'Playful', 'Inspirational',
  'Trustworthy', 'Innovation', 'Luxury', 'Casual', 'Energetic'
];

const PERSONALITY_TRAITS = [
  'Helpful', 'Innovative', 'Trustworthy', 'Expert', 'Approachable',
  'Premium', 'Eco-friendly', 'Fun', 'Reliable', 'Cutting-edge',
  'Community-focused', 'Results-driven', 'Authentic', 'Bold', 'Caring'
];

const TARGET_PLATFORMS = [
  'WhatsApp', 'Instagram', 'Facebook', 'Twitter', 'LinkedIn',
  'TikTok', 'YouTube', 'Email', 'SMS', 'Website'
];

export default function AIEnhancedBrandForm({ onSubmit, loading = false }: AIEnhancedBrandFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState<any>({});
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<BrandFormData>({
    defaultValues: {
      name: '',
      industry: '',
      description: '',
      brandVoice: {
        tone: '',
        personality: [],
        keywords: []
      },
      visualIdentity: {
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        fontStyle: 'modern'
      },
      targetAudience: {
        demographics: '',
        interests: [],
        painPoints: [],
        platforms: []
      },
      guidelines: '',
      goals: [],
      budget: 1000
    }
  });

  const watchedData = watch();

  const steps = [
    { id: 'basic', title: 'Basic Info', icon: Brain },
    { id: 'voice', title: 'Brand Voice', icon: Sparkles },
    { id: 'visual', title: 'Visual Identity', icon: Palette },
    { id: 'audience', title: 'Target Audience', icon: Target },
    { id: 'guidelines', title: 'Guidelines & Goals', icon: Brain }
  ];

  // AI Enhancement: Generate suggestions based on industry and description
  const generateAISuggestions = async () => {
    if (!watchedData.industry || !watchedData.description) return;
    
    setIsGeneratingAI(true);
    try {
      // This would call your AI service for intelligent suggestions
      const suggestions = await generateBrandSuggestions({
        industry: watchedData.industry,
        description: watchedData.description,
        name: watchedData.name
      });
      
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Mock AI suggestions function (replace with actual AI integration)
  const generateBrandSuggestions = async (data: any) => {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      voice: {
        tone: data.industry === 'Technology' ? 'Professional' : 'Friendly',
        personality: data.industry === 'Technology' ? ['Innovative', 'Expert', 'Cutting-edge'] : ['Helpful', 'Trustworthy', 'Approachable'],
        keywords: generateKeywords(data.industry, data.description)
      },
      audience: {
        demographics: generateDemographics(data.industry),
        interests: generateInterests(data.industry),
        painPoints: generatePainPoints(data.industry),
        platforms: generateRecommendedPlatforms(data.industry)
      },
      guidelines: generateGuidelines(data.industry, data.description),
      colors: generateColorPalette(data.industry)
    };
  };

  const generateKeywords = (industry: string, description: string) => {
    const keywordMap: Record<string, string[]> = {
      Technology: ['innovation', 'digital', 'solutions', 'efficient', 'cutting-edge'],
      Healthcare: ['care', 'wellness', 'trust', 'health', 'professional'],
      Finance: ['security', 'growth', 'trust', 'investment', 'reliable'],
      Education: ['learning', 'growth', 'knowledge', 'development', 'success'],
      // Add more industry-specific keywords
    };
    return keywordMap[industry] || ['quality', 'service', 'excellence', 'value', 'customer-focused'];
  };

  const generateDemographics = (industry: string) => {
    const demoMap: Record<string, string> = {
      Technology: 'Tech professionals, business owners, 25-45 years old',
      Healthcare: 'Health-conscious individuals, patients, 30-60 years old',
      Finance: 'Working professionals, investors, 25-55 years old',
      Education: 'Students, parents, professionals, 18-50 years old',
    };
    return demoMap[industry] || 'General consumers, 25-50 years old';
  };

  const generateInterests = (industry: string) => {
    const interestMap: Record<string, string[]> = {
      Technology: ['Innovation', 'Productivity', 'Digital Transformation', 'Automation'],
      Healthcare: ['Wellness', 'Fitness', 'Nutrition', 'Mental Health'],
      Finance: ['Investment', 'Savings', 'Financial Planning', 'Wealth Building'],
      Education: ['Learning', 'Career Development', 'Skills', 'Personal Growth'],
    };
    return interestMap[industry] || ['Quality', 'Value', 'Convenience', 'Service'];
  };

  const generatePainPoints = (industry: string) => {
    const painPointMap: Record<string, string[]> = {
      Technology: ['Complex solutions', 'Poor support', 'Outdated systems', 'Security concerns'],
      Healthcare: ['Long wait times', 'High costs', 'Poor communication', 'Limited access'],
      Finance: ['Hidden fees', 'Poor returns', 'Complex processes', 'Lack of transparency'],
      Education: ['Expensive courses', 'Outdated content', 'Limited flexibility', 'Poor outcomes'],
    };
    return painPointMap[industry] || ['High prices', 'Poor service', 'Limited options', 'Complexity'];
  };

  const generateRecommendedPlatforms = (industry: string) => {
    const platformMap: Record<string, string[]> = {
      Technology: ['LinkedIn', 'Twitter', 'WhatsApp', 'Email'],
      Healthcare: ['Facebook', 'WhatsApp', 'Email', 'Instagram'],
      Finance: ['LinkedIn', 'WhatsApp', 'Email', 'Twitter'],
      Education: ['Facebook', 'Instagram', 'WhatsApp', 'YouTube'],
    };
    return platformMap[industry] || ['WhatsApp', 'Facebook', 'Instagram', 'Email'];
  };

  const generateGuidelines = (industry: string, description: string) => {
    return `Brand guidelines for ${industry}:\n\n1. Always maintain a ${industry === 'Technology' ? 'professional and innovative' : 'friendly and approachable'} tone\n2. Focus on ${industry === 'Healthcare' ? 'care and wellness' : 'value and quality'}\n3. Use clear, simple language that resonates with your target audience\n4. Ensure all communications reflect your brand values\n5. Maintain consistency across all platforms and touchpoints`;
  };

  const generateColorPalette = (industry: string) => {
    const colorMap: Record<string, { primary: string; secondary: string }> = {
      Technology: { primary: '#2563EB', secondary: '#1E40AF' },
      Healthcare: { primary: '#059669', secondary: '#047857' },
      Finance: { primary: '#1F2937', secondary: '#374151' },
      Education: { primary: '#7C3AED', secondary: '#6D28D9' },
    };
    return colorMap[industry] || { primary: '#3B82F6', secondary: '#1E40AF' };
  };

  useEffect(() => {
    if (watchedData.industry && watchedData.description && watchedData.description.length > 20) {
      const timer = setTimeout(() => {
        generateAISuggestions();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [watchedData.industry, watchedData.description]);

  // Apply AI suggestion
  const applySuggestion = (field: string, value: any) => {
    setValue(field as keyof BrandFormData, value);
  };

  const onFormSubmit = async (data: BrandFormData) => {
    console.log('Form submitted:', data)
    
    // Here you would submit to your API
    // Example:
    try {
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Create AI agents for the brand
        const agentConfigs = [
          { name: `${data.name} Brand Persona`, type: 'brand_persona', configuration: { brandVoice: data.brandVoice } },
          { name: `${data.name} Content Creator`, type: 'content_creator', configuration: { targetAudience: data.targetAudience } },
          { name: `${data.name} Scheduler`, type: 'scheduler', configuration: { goals: data.goals } },
          { name: `${data.name} Sales Agent`, type: 'sales', configuration: { budget: data.budget } },
          { name: `${data.name} Analytics`, type: 'analytics', configuration: {} },
          { name: `${data.name} Campaign Orchestrator`, type: 'campaign_orchestrator', configuration: { guidelines: data.guidelines } }
        ]
        
        await fetch('/api/ai-agents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            brandId: result.brand.id,
            agents: agentConfigs
          }),
        })
        
        alert('Brand and AI agents created successfully! 🎉')
        // Redirect to dashboard or brand management page
        window.location.href = '/'
      } else {
        alert('Error creating brand: ' + result.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error creating brand. Please try again.')
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your AI-Enhanced Brand</h1>
        <p className="text-gray-600">Let AI help you build a comprehensive brand strategy with intelligent recommendations.</p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between mb-8">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center space-x-2 ${
              index <= currentStep ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              <step.icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">{step.title}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
        {/* Step 1: Basic Information */}
        {currentStep === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5" />
                <span>Basic Brand Information</span>
              </CardTitle>
              <CardDescription>
                Tell us about your brand and we'll provide AI-powered insights.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name
                </label>
                <Input
                  {...register('name', { required: 'Brand name is required' })}
                  placeholder="Enter your brand name"
                  className="w-full"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <Select onValueChange={(value) => setValue('industry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Description
                </label>
                <Textarea
                  {...register('description', { required: 'Description is required' })}
                  placeholder="Describe your brand, what you do, and what makes you unique..."
                  className="w-full h-24"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  The more details you provide, the better our AI can assist you.
                </p>
              </div>

              {isGeneratingAI && (
                <div className="flex items-center space-x-2 text-blue-600 p-4 bg-blue-50 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">AI is analyzing your brand and generating suggestions...</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Brand Voice */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span>Brand Voice & Personality</span>
              </CardTitle>
              <CardDescription>
                Define how your brand communicates with your audience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Tone
                </label>
                <Select onValueChange={(value) => setValue('brandVoice.tone', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your brand tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRAND_TONES.map((tone) => (
                      <SelectItem key={tone} value={tone}>
                        {tone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {aiSuggestions.voice?.tone && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-800">
                        AI Suggestion: <strong>{aiSuggestions.voice.tone}</strong>
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => applySuggestion('brandVoice.tone', aiSuggestions.voice.tone)}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personality Traits
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PERSONALITY_TRAITS.map((trait) => (
                    <div key={trait} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={trait}
                        value={trait}
                        {...register('brandVoice.personality')}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={trait} className="text-sm text-gray-700">
                        {trait}
                      </label>
                    </div>
                  ))}
                </div>

                {aiSuggestions.voice?.personality && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-blue-800 font-medium">AI Suggested Traits:</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => applySuggestion('brandVoice.personality', aiSuggestions.voice.personality)}
                      >
                        Apply All
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {aiSuggestions.voice.personality.map((trait: string) => (
                        <Badge key={trait} variant="secondary" className="text-xs">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Brand Keywords
                </label>
                <Input
                  placeholder="Enter keywords separated by commas (e.g., innovative, reliable, premium)"
                  onChange={(e) => setValue('brandVoice.keywords', e.target.value.split(',').map(k => k.trim()))}
                />
                
                {aiSuggestions.voice?.keywords && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-blue-800 font-medium">AI Suggested Keywords:</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => applySuggestion('brandVoice.keywords', aiSuggestions.voice.keywords)}
                      >
                        Apply
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {aiSuggestions.voice.keywords.map((keyword: string) => (
                        <Badge key={keyword} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Visual Identity */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>Visual Identity</span>
              </CardTitle>
              <CardDescription>
                Define your brand's visual elements and aesthetic.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      {...register('visualIdentity.primaryColor')}
                      className="w-12 h-10 rounded border"
                    />
                    <Input
                      {...register('visualIdentity.primaryColor')}
                      placeholder="#3B82F6"
                      className="flex-1"
                    />
                  </div>
                  
                  {aiSuggestions.colors && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-800">AI Suggestion:</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            applySuggestion('visualIdentity.primaryColor', aiSuggestions.colors.primary);
                            applySuggestion('visualIdentity.secondaryColor', aiSuggestions.colors.secondary);
                          }}
                        >
                          Apply Palette
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <div 
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: aiSuggestions.colors.primary }}
                        />
                        <span className="text-sm">{aiSuggestions.colors.primary}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      {...register('visualIdentity.secondaryColor')}
                      className="w-12 h-10 rounded border"
                    />
                    <Input
                      {...register('visualIdentity.secondaryColor')}
                      placeholder="#1E40AF"
                      className="flex-1"
                    />
                  </div>
                  
                  {aiSuggestions.colors && (
                    <div className="mt-2 flex items-center space-x-2">
                      <div 
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: aiSuggestions.colors.secondary }}
                      />
                      <span className="text-sm text-gray-600">{aiSuggestions.colors.secondary}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Style
                </label>
                <Select onValueChange={(value) => setValue('visualIdentity.fontStyle', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select font style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern Sans-serif</SelectItem>
                    <SelectItem value="classic">Classic Serif</SelectItem>
                    <SelectItem value="playful">Playful & Rounded</SelectItem>
                    <SelectItem value="elegant">Elegant Script</SelectItem>
                    <SelectItem value="bold">Bold & Strong</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo URL (Optional)
                </label>
                <Input
                  {...register('visualIdentity.logoUrl')}
                  placeholder="https://example.com/logo.png"
                  type="url"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Target Audience */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Target Audience</span>
              </CardTitle>
              <CardDescription>
                Define who your brand is trying to reach.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Demographics
                </label>
                <Textarea
                  {...register('targetAudience.demographics')}
                  placeholder="Describe your target audience demographics (age, location, profession, etc.)"
                  className="w-full h-20"
                />
                
                {aiSuggestions.audience?.demographics && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-800">AI Suggestion:</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => applySuggestion('targetAudience.demographics', aiSuggestions.audience.demographics)}
                      >
                        Apply
                      </Button>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{aiSuggestions.audience.demographics}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interests & Behaviors
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {aiSuggestions.audience?.interests ? 
                    aiSuggestions.audience.interests.map((interest: string) => (
                      <div key={interest} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={interest}
                          value={interest}
                          {...register('targetAudience.interests')}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={interest} className="text-sm text-gray-700">
                          {interest}
                        </label>
                      </div>
                    )) :
                    ['Technology', 'Health & Fitness', 'Travel', 'Food', 'Fashion', 'Business'].map((interest) => (
                      <div key={interest} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={interest}
                          value={interest}
                          {...register('targetAudience.interests')}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={interest} className="text-sm text-gray-700">
                          {interest}
                        </label>
                      </div>
                    ))
                  }
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pain Points
                </label>
                <Textarea
                  placeholder="What problems does your audience face that your brand can solve?"
                  className="w-full h-20"
                  onChange={(e) => setValue('targetAudience.painPoints', e.target.value.split('\n'))}
                />
                
                {aiSuggestions.audience?.painPoints && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-blue-800 font-medium">AI Identified Pain Points:</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => applySuggestion('targetAudience.painPoints', aiSuggestions.audience.painPoints)}
                      >
                        Apply
                      </Button>
                    </div>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {aiSuggestions.audience.painPoints.map((point: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-blue-600">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Platforms
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TARGET_PLATFORMS.map((platform) => (
                    <div key={platform} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={platform}
                        value={platform}
                        {...register('targetAudience.platforms')}
                        className="rounded border-gray-300"
                        defaultChecked={aiSuggestions.audience?.platforms?.includes(platform) || false}
                      />
                      <label htmlFor={platform} className="text-sm text-gray-700">
                        {platform}
                      </label>
                    </div>
                  ))}
                </div>

                {aiSuggestions.audience?.platforms && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-blue-800 font-medium">AI Recommended Platforms:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {aiSuggestions.audience.platforms.map((platform: string) => (
                        <Badge key={platform} variant="secondary" className="text-xs">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Brand Guidelines & Goals */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5" />
                <span>Brand Guidelines & Goals</span>
              </CardTitle>
              <CardDescription>
                Set your brand rules and objectives.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Brand Guidelines
                </label>
                <textarea
                  placeholder="Define your brand guidelines, dos and don'ts, communication rules..."
                  value={watchedData.guidelines || ''}
                  onChange={(e) => setValue('guidelines', e.target.value)}
                  className="w-full min-h-[150px] p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Business Goals
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['Increase Brand Awareness', 'Generate Leads', 'Drive Sales', 'Build Community', 'Educate Audience', 'Launch Product'].map((goal) => (
                    <label key={goal} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer bg-white">
                      <input
                        type="checkbox"
                        checked={watchedData.goals?.includes(goal) || false}
                        onChange={(e) => {
                          const currentGoals = watchedData.goals || [];
                          if (e.target.checked) {
                            setValue('goals', [...currentGoals, goal]);
                          } else {
                            setValue('goals', currentGoals.filter(g => g !== goal));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{goal}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Monthly Marketing Budget (USD)
                </label>
                <input
                  type="number"
                  placeholder="1000"
                  value={watchedData.budget || 0}
                  onChange={(e) => setValue('budget', parseInt(e.target.value) || 0)}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Previous
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button type="button" onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Brand & AI Agents...
                </>
              ) : (
                'Create Brand with AI Agents'
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
} 