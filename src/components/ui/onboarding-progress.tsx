"use client"

import { useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  Building2, 
  Palette, 
  Bot, 
  MessageSquare,
  Users,
  Settings
} from "lucide-react"

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  required: boolean
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "brand-setup",
    title: "Brand Setup",
    description: "Configure your brand identity and voice",
    icon: Building2,
    href: "/brand-setup",
    required: true
  },
  {
    id: "brand-content",
    title: "Content Strategy",
    description: "Set up your content guidelines and templates",
    icon: Palette,
    href: "/brand-content",
    required: true
  },
  {
    id: "ai-agents",
    title: "AI Agents",
    description: "Configure AI automation for your workflows",
    icon: Bot,
    href: "/ai-agents",
    required: false
  },
  {
    id: "templates",
    title: "Message Templates",
    description: "Create your first message templates",
    icon: MessageSquare,
    href: "/templates",
    required: false
  },
  {
    id: "teams",
    title: "Team Setup",
    description: "Invite team members and set permissions",
    icon: Users,
    href: "/teams",
    required: false
  },
  {
    id: "settings",
    title: "Preferences",
    description: "Configure your account settings",
    icon: Settings,
    href: "/settings",
    required: false
  }
]

interface OnboardingProgressProps {
  completedSteps: string[]
  currentStep?: string
  onStepClick?: (step: OnboardingStep) => void
}

export function OnboardingProgress({ 
  completedSteps, 
  currentStep, 
  onStepClick 
}: OnboardingProgressProps) {
  const progress = (completedSteps.length / onboardingSteps.filter(s => s.required).length) * 100

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span>Setup Progress</span>
            <Badge variant="secondary">{Math.round(progress)}%</Badge>
          </div>
        </CardTitle>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {onboardingSteps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id)
            const isCurrent = currentStep === step.id
            const Icon = step.icon

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                  isCurrent 
                    ? "bg-primary/5 border-primary/20" 
                    : isCompleted 
                    ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800" 
                    : "hover:bg-muted/50"
                }`}
                onClick={() => onStepClick?.(step)}
              >
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex items-center gap-2 flex-1">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{step.title}</span>
                      {step.required && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>

                {isCurrent && (
                  <Badge variant="default" className="text-xs">
                    Current
                  </Badge>
                )}
              </div>
            )
          })}
        </div>

        {progress === 100 && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950/20 dark:border-green-800">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Setup Complete!</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              You're all set up and ready to start using Schedsy.ai
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function OnboardingTooltip({ 
  step, 
  isVisible, 
  onNext, 
  onSkip 
}: {
  step: OnboardingStep
  isVisible: boolean
  onNext: () => void
  onSkip: () => void
}) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border rounded-lg p-6 max-w-md mx-4 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <step.icon className="h-6 w-6 text-primary" />
          <h3 className="font-semibold">{step.title}</h3>
        </div>
        
        <p className="text-muted-foreground mb-6">{step.description}</p>
        
        <div className="flex gap-2">
          <Button onClick={onNext} className="flex-1">
            Get Started
          </Button>
          <Button variant="outline" onClick={onSkip}>
            Skip
          </Button>
        </div>
      </div>
    </div>
  )
}

