'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, AlertCircle, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  validation?: () => boolean;
  onComplete?: () => Promise<void>;
}

interface OnboardingData {
  // Step 1: Platform Selection
  platform: 'telegram' | 'whatsapp' | '';
  
  // Step 2: API Configuration
  telegramBotToken: string;
  whatsappApiKey: string;
  whatsappPhoneNumber: string;
  
  // Step 3: Brand Voice Setup
  brandName: string;
  brandDescription: string;
  brandTone: 'professional' | 'friendly' | 'casual' | 'formal' | '';
  brandIndustry: string;
  
  // Step 4: First Automation
  automationType: 'welcome' | 'support' | 'sales' | '';
  automationMessage: string;
  
  // Step 5: Verification
  setupComplete: boolean;
}

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    platform: '',
    telegramBotToken: '',
    whatsappApiKey: '',
    whatsappPhoneNumber: '',
    brandName: '',
    brandDescription: '',
    brandTone: '',
    brandIndustry: '',
    automationType: '',
    automationMessage: '',
    setupComplete: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
    // Clear related errors when data is updated
    const newErrors = { ...errors };
    Object.keys(updates).forEach(key => {
      delete newErrors[key];
    });
    setErrors(newErrors);
  };

  // Step 1: Platform Selection
  const PlatformSelectionStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Messaging Platform</h2>
        <p className="text-gray-600">Select the platform you want to connect first</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className={`cursor-pointer transition-all ${data.platform === 'telegram' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`}
          onClick={() => updateData({ platform: 'telegram' })}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white font-bold">T</span>
            </div>
            <h3 className="font-semibold mb-2">Telegram Bot</h3>
            <p className="text-sm text-gray-600 mb-4">Quick setup, instant testing, rich features</p>
            <Badge variant="secondary">Recommended for testing</Badge>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${data.platform === 'whatsapp' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:shadow-md'}`}
          onClick={() => updateData({ platform: 'whatsapp' })}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white font-bold">W</span>
            </div>
            <h3 className="font-semibold mb-2">WhatsApp Business</h3>
            <p className="text-sm text-gray-600 mb-4">Production ready, business messaging</p>
            <Badge variant="secondary">Business use</Badge>
          </CardContent>
        </Card>
      </div>

      {data.platform && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">
            {data.platform === 'telegram' ? '🤖 Telegram Bot Setup' : '💼 WhatsApp Business Setup'}
          </h4>
          <p className="text-sm text-gray-600">
            {data.platform === 'telegram' 
              ? 'Perfect for testing and development. You can create a bot in minutes and start automating messages.'
              : 'Ideal for business use. Requires WhatsApp Business API access and verification process.'
            }
          </p>
        </div>
      )}
    </div>
  );

  // Step 2: API Configuration
  const ApiConfigurationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Configure API Access</h2>
        <p className="text-gray-600">
          {data.platform === 'telegram' 
            ? 'Enter your Telegram Bot Token to connect'
            : 'Enter your WhatsApp Business API credentials'
          }
        </p>
      </div>

      {data.platform === 'telegram' ? (
        <div className="space-y-4">
          <div>
            <Label htmlFor="telegramToken">Telegram Bot Token</Label>
            <Input
              id="telegramToken"
              type="password"
              placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
              value={data.telegramBotToken}
              onChange={(e) => updateData({ telegramBotToken: e.target.value })}
              className={errors.telegramBotToken ? 'border-red-500' : ''}
            />
            {errors.telegramBotToken && (
              <p className="text-sm text-red-600 mt-1">{errors.telegramBotToken}</p>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">🔧 How to get your Telegram Bot Token:</h4>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Message @BotFather on Telegram</li>
              <li>Send /newbot command</li>
              <li>Choose a name and username for your bot</li>
              <li>Copy the token provided by BotFather</li>
              <li>Paste it above</li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Label htmlFor="whatsappApiKey">WhatsApp API Key</Label>
            <Input
              id="whatsappApiKey"
              type="password"
              placeholder="Your WhatsApp Business API key"
              value={data.whatsappApiKey}
              onChange={(e) => updateData({ whatsappApiKey: e.target.value })}
              className={errors.whatsappApiKey ? 'border-red-500' : ''}
            />
            {errors.whatsappApiKey && (
              <p className="text-sm text-red-600 mt-1">{errors.whatsappApiKey}</p>
            )}
          </div>

          <div>
            <Label htmlFor="whatsappPhone">WhatsApp Phone Number</Label>
            <Input
              id="whatsappPhone"
              placeholder="+1234567890"
              value={data.whatsappPhoneNumber}
              onChange={(e) => updateData({ whatsappPhoneNumber: e.target.value })}
              className={errors.whatsappPhoneNumber ? 'border-red-500' : ''}
            />
            {errors.whatsappPhoneNumber && (
              <p className="text-sm text-red-600 mt-1">{errors.whatsappPhoneNumber}</p>
            )}
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">📱 WhatsApp Business API Setup:</h4>
            <p className="text-sm text-gray-600">
              You need a verified WhatsApp Business account and API access. 
              Contact WhatsApp Business or use a provider like Twilio, MessageBird, or 360Dialog.
            </p>
          </div>
        </div>
      )}

      <Button 
        onClick={validateApiConfiguration} 
        disabled={loading}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Validating...
          </>
        ) : (
          'Validate Configuration'
        )}
      </Button>
    </div>
  );

  // Step 3: Brand Voice Setup
  const BrandVoiceStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Define Your Brand Voice</h2>
        <p className="text-gray-600">Help AI understand how to communicate as your brand</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="brandName">Brand/Company Name</Label>
            <Input
              id="brandName"
              placeholder="Your Company Name"
              value={data.brandName}
              onChange={(e) => updateData({ brandName: e.target.value })}
              className={errors.brandName ? 'border-red-500' : ''}
            />
            {errors.brandName && (
              <p className="text-sm text-red-600 mt-1">{errors.brandName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="brandIndustry">Industry</Label>
            <Input
              id="brandIndustry"
              placeholder="e.g., Technology, Healthcare, E-commerce"
              value={data.brandIndustry}
              onChange={(e) => updateData({ brandIndustry: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="brandTone">Communication Tone</Label>
            <Select value={data.brandTone} onValueChange={(value) => updateData({ brandTone: value as any })}>
              <SelectTrigger className={errors.brandTone ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
              </SelectContent>
            </Select>
            {errors.brandTone && (
              <p className="text-sm text-red-600 mt-1">{errors.brandTone}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="brandDescription">Brand Description</Label>
          <Textarea
            id="brandDescription"
            placeholder="Describe your brand, what you do, your values, and how you want to communicate with customers..."
            value={data.brandDescription}
            onChange={(e) => updateData({ brandDescription: e.target.value })}
            className={`min-h-[200px] ${errors.brandDescription ? 'border-red-500' : ''}`}
          />
          {errors.brandDescription && (
            <p className="text-sm text-red-600 mt-1">{errors.brandDescription}</p>
          )}
        </div>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">💡 Brand Voice Tips:</h4>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>Be specific about your brand personality and values</li>
          <li>Include examples of how you want to sound</li>
          <li>Mention any specific terminology or phrases you use</li>
          <li>Describe your target audience and how you speak to them</li>
        </ul>
      </div>
    </div>
  );

  // Step 4: First Automation
  const FirstAutomationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Create Your First Automation</h2>
        <p className="text-gray-600">Set up an automated response to get started</p>
      </div>

      <div>
        <Label>Automation Type</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          {[
            { id: 'welcome', title: 'Welcome Message', desc: 'Greet new users automatically' },
            { id: 'support', title: 'Support Helper', desc: 'Help users with common questions' },
            { id: 'sales', title: 'Sales Assistant', desc: 'Qualify leads and provide info' }
          ].map((type) => (
            <Card 
              key={type.id}
              className={`cursor-pointer transition-all ${data.automationType === type.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`}
              onClick={() => updateData({ automationType: type.id as any })}
            >
              <CardContent className="p-4 text-center">
                <h4 className="font-medium mb-1">{type.title}</h4>
                <p className="text-sm text-gray-600">{type.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        {errors.automationType && (
          <p className="text-sm text-red-600 mt-1">{errors.automationType}</p>
        )}
      </div>

      {data.automationType && (
        <div>
          <Label htmlFor="automationMessage">Automation Message</Label>
          <Textarea
            id="automationMessage"
            placeholder={getAutomationPlaceholder()}
            value={data.automationMessage}
            onChange={(e) => updateData({ automationMessage: e.target.value })}
            className={`min-h-[120px] ${errors.automationMessage ? 'border-red-500' : ''}`}
          />
          {errors.automationMessage && (
            <p className="text-sm text-red-600 mt-1">{errors.automationMessage}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            This message will be sent automatically when the automation is triggered.
          </p>
        </div>
      )}

      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">🚀 Automation Preview:</h4>
        <p className="text-sm text-gray-600">
          {data.automationType === 'welcome' && 'When a new user starts a conversation, they\'ll receive your welcome message.'}
          {data.automationType === 'support' && 'When users ask for help, they\'ll get your support message with guidance.'}
          {data.automationType === 'sales' && 'When users inquire about your products/services, they\'ll receive your sales message.'}
        </p>
      </div>
    </div>
  );

  // Step 5: Setup Verification
  const SetupVerificationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Setup Complete!</h2>
        <p className="text-gray-600">Let's verify everything is working correctly</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
            <span>Platform Connection</span>
          </div>
          <Badge variant="secondary">{data.platform}</Badge>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
            <span>Brand Voice Configured</span>
          </div>
          <Badge variant="secondary">{data.brandTone}</Badge>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
            <span>First Automation Created</span>
          </div>
          <Badge variant="secondary">{data.automationType}</Badge>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg text-center">
        <h3 className="font-semibold mb-2">🎉 Your automation platform is ready!</h3>
        <p className="text-gray-600 mb-4">
          You can now start receiving and responding to messages automatically.
        </p>
        <div className="space-y-2">
          <Button onClick={testAutomation} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Send Test Message'
            )}
          </Button>
          <Button variant="outline" onClick={completeSetup} className="w-full">
            Complete Setup
          </Button>
        </div>
      </div>
    </div>
  );

  const steps: OnboardingStep[] = [
    {
      id: 'platform',
      title: 'Platform',
      description: 'Choose messaging platform',
      component: PlatformSelectionStep,
      validation: () => !!data.platform
    },
    {
      id: 'api',
      title: 'API Setup',
      description: 'Configure API access',
      component: ApiConfigurationStep,
      validation: () => data.platform === 'telegram' ? !!data.telegramBotToken : !!(data.whatsappApiKey && data.whatsappPhoneNumber)
    },
    {
      id: 'brand',
      title: 'Brand Voice',
      description: 'Define your brand',
      component: BrandVoiceStep,
      validation: () => !!(data.brandName && data.brandDescription && data.brandTone)
    },
    {
      id: 'automation',
      title: 'First Automation',
      description: 'Create automation',
      component: FirstAutomationStep,
      validation: () => !!(data.automationType && data.automationMessage)
    },
    {
      id: 'verification',
      title: 'Verification',
      description: 'Complete setup',
      component: SetupVerificationStep,
      validation: () => true
    }
  ];

  const validateApiConfiguration = async () => {
    setLoading(true);
    setErrors({});

    try {
      if (data.platform === 'telegram') {
        if (!data.telegramBotToken) {
          setErrors({ telegramBotToken: 'Bot token is required' });
          return;
        }

        // Validate Telegram bot token format
        if (!/^\d+:[A-Za-z0-9_-]+$/.test(data.telegramBotToken)) {
          setErrors({ telegramBotToken: 'Invalid bot token format' });
          return;
        }

        // Test the bot token
        const response = await fetch(`/api/telegram/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: data.telegramBotToken })
        });

        if (!response.ok) {
          setErrors({ telegramBotToken: 'Invalid bot token or bot not accessible' });
          return;
        }
      } else {
        if (!data.whatsappApiKey || !data.whatsappPhoneNumber) {
          setErrors({ 
            whatsappApiKey: !data.whatsappApiKey ? 'API key is required' : '',
            whatsappPhoneNumber: !data.whatsappPhoneNumber ? 'Phone number is required' : ''
          });
          return;
        }
      }

             setCompletedSteps(prev => new Set([...Array.from(prev), currentStep]));
      nextStep();
    } catch (error) {
      setErrors({ general: 'Failed to validate configuration. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getAutomationPlaceholder = () => {
    switch (data.automationType) {
      case 'welcome':
        return `Hi! Welcome to ${data.brandName || 'our platform'}! 👋\n\nI'm here to help you get started. How can I assist you today?`;
      case 'support':
        return `Hello! I'm here to help with any questions you have about ${data.brandName || 'our services'}.\n\nWhat can I help you with?`;
      case 'sales':
        return `Hi there! Thanks for your interest in ${data.brandName || 'our products'}!\n\nI'd love to help you find the perfect solution. What are you looking for?`;
      default:
        return 'Enter your automation message here...';
    }
  };

  const testAutomation = async () => {
    setLoading(true);
    try {
      // Send a test message through the automation system
      const response = await fetch('/api/automation/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: data.platform,
          automationType: data.automationType,
          message: data.automationMessage
        })
      });

      if (response.ok) {
        alert('Test message sent successfully! Check your platform for the automated response.');
      } else {
        alert('Test failed. Please check your configuration.');
      }
    } catch (error) {
      alert('Test failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const completeSetup = async () => {
    setLoading(true);
    try {
      // Save the onboarding configuration
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        updateData({ setupComplete: true });
        // Redirect to dashboard or main app
        window.location.href = '/dashboard';
      } else {
        alert('Failed to complete setup. Please try again.');
      }
    } catch (error) {
      alert('Setup completion failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  const canProceed = () => {
    const step = steps[currentStep];
    return step.validation ? step.validation() : true;
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Platform Setup</h1>
          <Badge variant="outline">
            Step {currentStep + 1} of {steps.length}
          </Badge>
        </div>
        
        <Progress value={progress} className="mb-4" />
        
        <div className="flex items-center justify-between text-sm">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              {completedSteps.has(index) ? (
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
              ) : index === currentStep ? (
                <Circle className="w-4 h-4 text-blue-500 mr-1" />
              ) : (
                <Circle className="w-4 h-4 text-gray-300 mr-1" />
              )}
              <span className={index === currentStep ? 'text-blue-600 font-medium' : 'text-gray-500'}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <CurrentStepComponent />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={prevStep} 
          disabled={currentStep === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button 
            onClick={nextStep} 
            disabled={!canProceed() || loading}
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={completeSetup} 
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Completing...
              </>
            ) : (
              'Complete Setup'
            )}
          </Button>
        )}
      </div>

      {/* Error Display */}
      {errors.general && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{errors.general}</span>
          </div>
        </div>
      )}
    </div>
  );
} 