'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, MessageSquare, Globe, Target, Database, Users, Workflow, Zap, Brain, Settings } from 'lucide-react';

interface ChatbotRequirements {
  name: string;
  description: string;
  industry: string;
  businessType: string;
  channels: string[];
  primaryChannel: string;
  languages: string[];
  defaultLanguage: string;
  useCases: string[];
  customUseCases: string[];
  hasKnowledgeBase: boolean;
  businessData: {
    products: string;
    services: string;
    policies: string;
    faqs: string;
  };
  userSegments: any[];
  conversationStyle: string;
  responseTime: string;
  escalationRules: string[];
  integrations: string[];
  customIntegrations: string[];
  analyticsNeeds: string[];
  reportingFrequency: string;
  advancedFeatures: string[];
  customFeatures: string[];
}

interface ApiResult {
  configurationId: string;
  status: string;
  generatedConfig: {
    systemPrompt: string;
  };
  nextSteps: string[];
}

export default function ChatbotBuilderPage() {
  const [requirements, setRequirements] = useState<ChatbotRequirements>({
    name: '',
    description: '',
    industry: '',
    businessType: '',
    channels: [],
    primaryChannel: '',
    languages: ['English'],
    defaultLanguage: 'English',
    useCases: [],
    customUseCases: [],
    hasKnowledgeBase: false,
    businessData: {
      products: '',
      services: '',
      policies: '',
      faqs: ''
    },
    userSegments: [],
    conversationStyle: '',
    responseTime: '',
    escalationRules: [],
    integrations: [],
    customIntegrations: [],
    analyticsNeeds: [],
    reportingFrequency: '',
    advancedFeatures: [],
    customFeatures: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);

  const INDUSTRIES = [
    'E-commerce', 'Healthcare', 'Education', 'Finance', 'Real Estate',
    'Restaurant', 'Retail', 'Technology', 'Travel', 'Automotive',
    'Insurance', 'Legal', 'Marketing', 'Consulting', 'Other'
  ];

  const CHANNELS = [
    { id: 'whatsapp', name: 'WhatsApp Business', popular: true },
    { id: 'telegram', name: 'Telegram', popular: true },
    { id: 'facebook', name: 'Facebook Messenger', popular: true },
    { id: 'website', name: 'Website Widget', popular: true }
  ];

  const USE_CASES = [
    { id: 'customer_support', name: 'Customer Support', description: 'Answer questions, resolve issues' },
    { id: 'lead_generation', name: 'Lead Generation', description: 'Capture and qualify leads' },
    { id: 'sales_assistance', name: 'Sales Assistance', description: 'Product recommendations, orders' },
    { id: 'appointment_booking', name: 'Appointment Booking', description: 'Schedule meetings, reservations' }
  ];

  const updateRequirements = (updates: Partial<ChatbotRequirements>) => {
    setRequirements(prev => ({ ...prev, ...updates }));
  };

  const handleChannelToggle = (channelId: string) => {
    const isSelected = requirements.channels.includes(channelId);
    if (isSelected) {
      updateRequirements({ 
        channels: requirements.channels.filter(c => c !== channelId),
        primaryChannel: requirements.primaryChannel === channelId ? '' : requirements.primaryChannel
      });
    } else {
      updateRequirements({ channels: [...requirements.channels, channelId] });
    }
  };

  const handleUseCaseToggle = (useCaseId: string) => {
    const isSelected = requirements.useCases.includes(useCaseId);
    if (isSelected) {
      updateRequirements({ useCases: requirements.useCases.filter(u => u !== useCaseId) });
    } else {
      updateRequirements({ useCases: [...requirements.useCases, useCaseId] });
    }
  };

  const handleSubmit = async () => {
    if (!requirements.name || !requirements.industry || !requirements.primaryChannel) {
      alert('Please fill in required fields: Name, Industry, and Primary Channel');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/chatbot/requirements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requirements),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
        alert('Chatbot configuration created successfully!');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create chatbot configuration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🤖 Create Your Intelligent Chatbot
        </h1>
        <p className="text-gray-600">
          Inspired by{' '}
          <a 
            href="https://github.com/Hexastack/hexabot" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:underline"
          >
            Hexabot's
          </a>{' '}
          powerful features - tell us about your needs and we'll build a custom AI assistant
        </p>
        <div className="mt-4">
          <a 
            href="/chatbot-test" 
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            🧪 Test Your Chatbots
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Chatbot Name *</Label>
              <Input
                id="name"
                value={requirements.name}
                onChange={(e) => updateRequirements({ name: e.target.value })}
                placeholder="e.g., CustomerCare Bot"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={requirements.description}
                onChange={(e) => updateRequirements({ description: e.target.value })}
                placeholder="What will your chatbot do?"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="industry">Industry *</Label>
              <Select value={requirements.industry} onValueChange={(value) => updateRequirements({ industry: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map(industry => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="businessType">Business Type</Label>
              <Input
                id="businessType"
                value={requirements.businessType}
                onChange={(e) => updateRequirements({ businessType: e.target.value })}
                placeholder="e.g., B2B SaaS, Local Restaurant"
              />
            </div>
          </CardContent>
        </Card>

        {/* Channels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Channels</span>
            </CardTitle>
            <CardDescription>Multi-channel support inspired by Hexabot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Select Channels *</Label>
              <div className="grid grid-cols-1 gap-3 mt-2">
                {CHANNELS.map(channel => (
                  <div key={channel.id} className="flex items-center space-x-3 p-2 border rounded">
                    <input
                      type="checkbox"
                      id={channel.id}
                      checked={requirements.channels.includes(channel.id)}
                      onChange={() => handleChannelToggle(channel.id)}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <Label htmlFor={channel.id} className="text-sm">{channel.name}</Label>
                      {channel.popular && (
                        <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">Popular</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {requirements.channels.length > 0 && (
              <div>
                <Label htmlFor="primaryChannel">Primary Channel *</Label>
                <Select value={requirements.primaryChannel} onValueChange={(value) => updateRequirements({ primaryChannel: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select main channel" />
                  </SelectTrigger>
                  <SelectContent>
                    {requirements.channels.map(channelId => {
                      const channel = CHANNELS.find(c => c.id === channelId);
                      return channel ? (
                        <SelectItem key={channelId} value={channelId}>{channel.name}</SelectItem>
                      ) : null;
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Use Cases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Use Cases</span>
            </CardTitle>
            <CardDescription>What should your chatbot help with?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {USE_CASES.map(useCase => (
                <div key={useCase.id} className="flex items-start space-x-3 p-3 border rounded">
                  <input
                    type="checkbox"
                    id={useCase.id}
                    checked={requirements.useCases.includes(useCase.id)}
                    onChange={() => handleUseCaseToggle(useCase.id)}
                    className="mt-1 rounded"
                  />
                  <div className="flex-1">
                    <Label htmlFor={useCase.id} className="font-medium text-sm">{useCase.name}</Label>
                    <p className="text-xs text-gray-600 mt-1">{useCase.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Knowledge Base */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Knowledge Base</span>
            </CardTitle>
            <CardDescription>Business-specific information (inspired by Hexabot)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasKnowledgeBase"
                checked={requirements.hasKnowledgeBase}
                onChange={(e) => updateRequirements({ hasKnowledgeBase: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="hasKnowledgeBase" className="text-sm">
                Enable knowledge base
              </Label>
            </div>

            {requirements.hasKnowledgeBase && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="products" className="text-sm">Products/Services</Label>
                  <Textarea
                    id="products"
                    value={requirements.businessData.products}
                    onChange={(e) => updateRequirements({ 
                      businessData: { ...requirements.businessData, products: e.target.value }
                    })}
                    placeholder="List your main products or services..."
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="faqs" className="text-sm">Common Questions</Label>
                  <Textarea
                    id="faqs"
                    value={requirements.businessData.faqs}
                    onChange={(e) => updateRequirements({ 
                      businessData: { ...requirements.businessData, faqs: e.target.value }
                    })}
                    placeholder="Frequently asked questions..."
                    rows={2}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversation Style */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Workflow className="w-5 h-5" />
              <span>Conversation Style</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="conversationStyle">Communication Style</Label>
              <Select value={requirements.conversationStyle} onValueChange={(value) => updateRequirements({ conversationStyle: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="How should it communicate?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional & Formal</SelectItem>
                  <SelectItem value="friendly">Friendly & Casual</SelectItem>
                  <SelectItem value="helpful">Helpful & Supportive</SelectItem>
                  <SelectItem value="enthusiastic">Enthusiastic & Energetic</SelectItem>
                  <SelectItem value="concise">Concise & Direct</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="responseTime">Response Speed</Label>
              <Select value={requirements.responseTime} onValueChange={(value) => updateRequirements({ responseTime: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Response timing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instant">Instant (&lt; 1 second)</SelectItem>
                  <SelectItem value="fast">Fast (1-3 seconds)</SelectItem>
                  <SelectItem value="normal">Normal (3-5 seconds)</SelectItem>
                  <SelectItem value="thoughtful">Thoughtful (5-10 seconds)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5" />
              <span>Analytics</span>
            </CardTitle>
            <CardDescription>Insights and reporting (inspired by Hexabot)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="reportingFrequency">Reporting Frequency</Label>
              <Select value={requirements.reportingFrequency} onValueChange={(value) => updateRequirements({ reportingFrequency: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="How often?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Real-time dashboard</SelectItem>
                  <SelectItem value="daily">Daily reports</SelectItem>
                  <SelectItem value="weekly">Weekly summaries</SelectItem>
                  <SelectItem value="monthly">Monthly reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex justify-center">
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !requirements.name || !requirements.industry || !requirements.primaryChannel}
          className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
        >
          {isSubmitting ? 'Creating Chatbot...' : '🚀 Create My Intelligent Chatbot'}
        </Button>
      </div>

      {/* Result Display */}
      {result && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-green-600">✅ Chatbot Configuration Created!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>Configuration ID:</strong> {result.configurationId}
              </div>
              <div>
                <strong>Status:</strong> {result.status}
              </div>
              <div>
                <strong>Generated System Prompt:</strong>
                <pre className="bg-gray-100 p-3 rounded text-sm mt-2 whitespace-pre-wrap">
                  {result.generatedConfig.systemPrompt}
                </pre>
              </div>
              <div>
                <strong>Next Steps:</strong>
                <ul className="list-disc list-inside mt-2">
                  {result.nextSteps.map((step, index) => (
                    <li key={index} className="text-sm">{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 