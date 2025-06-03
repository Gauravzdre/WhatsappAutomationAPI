'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStrategy } from '@/hooks/useStrategy'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Wand2,
  ArrowLeft,
  ArrowRight,
  Building2,
  Users,
  MessageSquare,
  Target,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

const WIZARD_STEPS = [
  {
    id: 1,
    title: 'Business Foundation',
    description: 'Tell us about your business and goals',
    icon: Building2
  },
  {
    id: 2,
    title: 'Target Audience',
    description: 'Define who you\'re trying to reach',
    icon: Users
  },
  {
    id: 3,
    title: 'Content Strategy',
    description: 'Set your brand voice and content mix',
    icon: MessageSquare
  },
  {
    id: 4,
    title: 'Success Metrics',
    description: 'Define what success looks like',
    icon: Target
  }
]

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Real Estate',
  'Marketing',
  'Consulting',
  'Food & Beverage',
  'Professional Services',
  'E-commerce',
  'Other'
]

const BRAND_VOICES = [
  { id: 'professional', name: 'Professional', description: 'Formal, authoritative, and trustworthy' },
  { id: 'friendly', name: 'Friendly', description: 'Warm, approachable, and conversational' },
  { id: 'casual', name: 'Casual', description: 'Relaxed, informal, and relatable' },
  { id: 'enthusiastic', name: 'Enthusiastic', description: 'Energetic, passionate, and motivating' },
  { id: 'expert', name: 'Expert', description: 'Knowledgeable, detailed, and educational' }
]

interface WizardData {
  // Step 1: Business Foundation
  businessName: string
  industry: string
  businessGoals: string
  valueProposition: string
  
  // Step 2: Target Audience
  targetAudience: string
  communicationPreferences: {
    messageFrequency: string
    preferredChannels: string[]
    bestContactTimes: string[]
  }
  
  // Step 3: Content Strategy
  brandVoice: string
  contentDistribution: {
    educational: number
    promotional: number
    engagement: number
    support: number
  }
  
  // Step 4: Success Metrics
  targetMetrics: {
    responseRateTarget: number
    engagementRateTarget: number
    conversionRateTarget: number
    monthlyMessageTarget: number
  }
}

export default function CreateStrategyPage() {
  const router = useRouter()
  const { createStrategy, loading } = useStrategy()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [wizardData, setWizardData] = useState<WizardData>({
    // Business Foundation
    businessName: '',
    industry: '',
    businessGoals: '',
    valueProposition: '',
    
    // Target Audience
    targetAudience: '',
    communicationPreferences: {
      messageFrequency: 'weekly',
      preferredChannels: ['whatsapp'],
      bestContactTimes: ['morning']
    },
    
    // Content Strategy
    brandVoice: 'professional',
    contentDistribution: {
      educational: 40,
      promotional: 30,
      engagement: 20,
      support: 10
    },
    
    // Success Metrics
    targetMetrics: {
      responseRateTarget: 25,
      engagementRateTarget: 15,
      conversionRateTarget: 5,
      monthlyMessageTarget: 100
    }
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateWizardData = (field: string, value: any) => {
    setWizardData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const updateNestedData = (section: string, field: string, value: any) => {
    setWizardData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof WizardData] as any),
        [field]: value
      }
    }))
  }

  const updateContentDistribution = (pillar: string, value: number) => {
    setWizardData(prev => ({
      ...prev,
      contentDistribution: {
        ...prev.contentDistribution,
        [pillar]: value
      }
    }))
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}
    
    switch (step) {
      case 0: // Business Foundation
        if (!wizardData.businessName) newErrors.businessName = 'Business name is required'
        if (!wizardData.industry) newErrors.industry = 'Industry is required'
        if (!wizardData.businessGoals) newErrors.businessGoals = 'Business goals are required'
        if (!wizardData.valueProposition) newErrors.valueProposition = 'Value proposition is required'
        break
        
      case 1: // Target Audience
        if (!wizardData.targetAudience) newErrors.targetAudience = 'Target audience description is required'
        break
        
      case 2: // Content Strategy
        const total = Object.values(wizardData.contentDistribution).reduce((sum, val) => sum + val, 0)
        if (Math.abs(total - 100) > 0.1) {
          newErrors.contentDistribution = 'Content distribution must total 100%'
        }
        break
        
      case 3: // Success Metrics
        if (wizardData.targetMetrics.responseRateTarget < 1 || wizardData.targetMetrics.responseRateTarget > 100) {
          newErrors.responseRateTarget = 'Response rate must be between 1-100%'
        }
        if (wizardData.targetMetrics.engagementRateTarget < 1 || wizardData.targetMetrics.engagementRateTarget > 100) {
          newErrors.engagementRateTarget = 'Engagement rate must be between 1-100%'
        }
        if (wizardData.targetMetrics.conversionRateTarget < 1 || wizardData.targetMetrics.conversionRateTarget > 100) {
          newErrors.conversionRateTarget = 'Conversion rate must be between 1-100%'
        }
        if (wizardData.targetMetrics.monthlyMessageTarget < 1) {
          newErrors.monthlyMessageTarget = 'Monthly message target must be at least 1'
        }
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, WIZARD_STEPS.length - 1))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    try {
      const strategyData = {
        name: `${wizardData.businessName} Strategy`,
        description: `Content strategy for ${wizardData.businessName} in the ${wizardData.industry} industry`,
        business_objectives: {
          primary_goal: wizardData.businessGoals,
          target_audience: wizardData.targetAudience,
          value_proposition: wizardData.valueProposition,
          secondary_goals: [],
          key_challenges: []
        },
        target_metrics: {
          response_rate_target: wizardData.targetMetrics.responseRateTarget,
          engagement_rate_target: wizardData.targetMetrics.engagementRateTarget,
          conversion_rate_target: wizardData.targetMetrics.conversionRateTarget,
          monthly_message_target: wizardData.targetMetrics.monthlyMessageTarget
        },
        content_distribution: wizardData.contentDistribution,
        status: 'active' as const
      }

      const strategy = await createStrategy(strategyData)
      router.push(`/strategy/${strategy.id}`)
    } catch (error) {
      console.error('Failed to create strategy:', error)
      setErrors({ submit: 'Failed to create strategy. Please try again.' })
    }
  }

  const isLastStep = currentStep === WIZARD_STEPS.length - 1
  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100

  return (
    <DashboardLayout
      title="Create Strategy"
      description="Build a comprehensive content strategy with our guided wizard"
      icon={<Wand2 className="h-8 w-8" />}
      gradient="purple"
    >
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg mb-8">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Strategy Creation Wizard</h2>
              <Badge variant="outline">{currentStep + 1} of {WIZARD_STEPS.length}</Badge>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-4">
              {WIZARD_STEPS.map((step, index) => {
                const Icon = step.icon
                const isActive = index === currentStep
                const isCompleted = index < currentStep
                
                return (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center space-y-2 ${
                      isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      isActive ? 'bg-purple-100' : isCompleted ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{step.title}</p>
                      <p className="text-xs hidden sm:block">{step.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardHeader>
        </Card>

        {/* Step Content */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {(() => {
                const Icon = WIZARD_STEPS[currentStep].icon
                return <Icon className="h-6 w-6" />
              })()}
              <span>{WIZARD_STEPS[currentStep].title}</span>
            </CardTitle>
            <CardDescription>
              {WIZARD_STEPS[currentStep].description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Business Foundation Step */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      value={wizardData.businessName}
                      onChange={(e) => updateWizardData('businessName', e.target.value)}
                      placeholder="Enter your business name"
                    />
                    {errors.businessName && (
                      <p className="text-sm text-red-600">{errors.businessName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry *</Label>
                    <Select value={wizardData.industry} onValueChange={(value) => updateWizardData('industry', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((industry) => (
                          <SelectItem key={industry} value={industry.toLowerCase()}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.industry && (
                      <p className="text-sm text-red-600">{errors.industry}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="businessGoals">Business Goals *</Label>
                  <Textarea
                    id="businessGoals"
                    value={wizardData.businessGoals}
                    onChange={(e) => updateWizardData('businessGoals', e.target.value)}
                    placeholder="What are your main business objectives? (e.g., increase sales, build brand awareness, improve customer retention)"
                    rows={3}
                  />
                  {errors.businessGoals && (
                    <p className="text-sm text-red-600">{errors.businessGoals}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="valueProposition">Value Proposition *</Label>
                  <Textarea
                    id="valueProposition"
                    value={wizardData.valueProposition}
                    onChange={(e) => updateWizardData('valueProposition', e.target.value)}
                    placeholder="What unique value do you provide to customers? What makes you different from competitors?"
                    rows={3}
                  />
                  {errors.valueProposition && (
                    <p className="text-sm text-red-600">{errors.valueProposition}</p>
                  )}
                </div>
              </div>
            )}

            {/* Target Audience Step */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience Description *</Label>
                  <Textarea
                    id="targetAudience"
                    value={wizardData.targetAudience}
                    onChange={(e) => updateWizardData('targetAudience', e.target.value)}
                    placeholder="Describe your ideal customers. Include demographics, interests, pain points, and communication preferences."
                    rows={4}
                  />
                  {errors.targetAudience && (
                    <p className="text-sm text-red-600">{errors.targetAudience}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Message Frequency</Label>
                    <Select 
                      value={wizardData.communicationPreferences.messageFrequency} 
                      onValueChange={(value) => updateNestedData('communicationPreferences', 'messageFrequency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Preferred Contact Times</Label>
                    <Select 
                      value={wizardData.communicationPreferences.bestContactTimes[0]} 
                      onValueChange={(value) => updateNestedData('communicationPreferences', 'bestContactTimes', [value])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (9-12 PM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12-5 PM)</SelectItem>
                        <SelectItem value="evening">Evening (5-8 PM)</SelectItem>
                        <SelectItem value="night">Night (8-11 PM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Content Strategy Step */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Brand Voice</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {BRAND_VOICES.map((voice) => (
                      <div
                        key={voice.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          wizardData.brandVoice === voice.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => updateWizardData('brandVoice', voice.id)}
                      >
                        <h4 className="font-medium">{voice.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{voice.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Label>Content Distribution</Label>
                    <Badge variant="outline">Must total 100%</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(wizardData.contentDistribution).map(([pillar, value]) => (
                      <div key={pillar} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="capitalize flex items-center space-x-2">
                            <span>{pillar === 'educational' ? '📚' : pillar === 'promotional' ? '💰' : pillar === 'engagement' ? '🤝' : '🛠️'}</span>
                            <span>{pillar}</span>
                          </Label>
                          <span className="text-sm font-medium">{value}%</span>
                        </div>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={value}
                          onChange={(e) => updateContentDistribution(pillar, parseInt(e.target.value) || 0)}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {errors.contentDistribution && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        {errors.contentDistribution}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="text-sm text-gray-600">
                    <strong>Total: {Object.values(wizardData.contentDistribution).reduce((sum, val) => sum + val, 0)}%</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Success Metrics Step */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <Alert className="border-blue-200 bg-blue-50">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Set realistic targets based on your industry and current performance. You can adjust these later as you gather more data.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="responseRate">Target Response Rate (%)</Label>
                    <Input
                      id="responseRate"
                      type="number"
                      min="1"
                      max="100"
                      value={wizardData.targetMetrics.responseRateTarget}
                      onChange={(e) => updateNestedData('targetMetrics', 'responseRateTarget', parseInt(e.target.value) || 0)}
                    />
                    {errors.responseRateTarget && (
                      <p className="text-sm text-red-600">{errors.responseRateTarget}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="engagementRate">Target Engagement Rate (%)</Label>
                    <Input
                      id="engagementRate"
                      type="number"
                      min="1"
                      max="100"
                      value={wizardData.targetMetrics.engagementRateTarget}
                      onChange={(e) => updateNestedData('targetMetrics', 'engagementRateTarget', parseInt(e.target.value) || 0)}
                    />
                    {errors.engagementRateTarget && (
                      <p className="text-sm text-red-600">{errors.engagementRateTarget}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="conversionRate">Target Conversion Rate (%)</Label>
                    <Input
                      id="conversionRate"
                      type="number"
                      min="1"
                      max="100"
                      value={wizardData.targetMetrics.conversionRateTarget}
                      onChange={(e) => updateNestedData('targetMetrics', 'conversionRateTarget', parseInt(e.target.value) || 0)}
                    />
                    {errors.conversionRateTarget && (
                      <p className="text-sm text-red-600">{errors.conversionRateTarget}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="monthlyMessages">Monthly Message Target</Label>
                    <Input
                      id="monthlyMessages"
                      type="number"
                      min="1"
                      value={wizardData.targetMetrics.monthlyMessageTarget}
                      onChange={(e) => updateNestedData('targetMetrics', 'monthlyMessageTarget', parseInt(e.target.value) || 0)}
                    />
                    {errors.monthlyMessageTarget && (
                      <p className="text-sm text-red-600">{errors.monthlyMessageTarget}</p>
                    )}
                  </div>
                </div>

                {/* Strategy Summary */}
                <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    Strategy Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Business:</strong> {wizardData.businessName}</p>
                      <p><strong>Industry:</strong> {wizardData.industry}</p>
                      <p><strong>Brand Voice:</strong> {BRAND_VOICES.find(v => v.id === wizardData.brandVoice)?.name}</p>
                    </div>
                    <div>
                      <p><strong>Target Response:</strong> {wizardData.targetMetrics.responseRateTarget}%</p>
                      <p><strong>Monthly Messages:</strong> {wizardData.targetMetrics.monthlyMessageTarget}</p>
                      <p><strong>Message Frequency:</strong> {wizardData.communicationPreferences.messageFrequency}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {errors.submit && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {errors.submit}
                </AlertDescription>
              </Alert>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={currentStep === 0 ? () => router.push('/strategy') : handlePrevious}
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {currentStep === 0 ? 'Cancel' : 'Previous'}
              </Button>
              
              <Button 
                onClick={isLastStep ? handleSubmit : handleNext}
                disabled={loading}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : isLastStep ? (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Create Strategy
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 