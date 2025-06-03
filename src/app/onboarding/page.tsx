import OnboardingWizard from '@/components/onboarding/wizard'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { UserPlus } from 'lucide-react'

export default function OnboardingPage() {
  return (
    <DashboardLayout
      title="Getting Started"
      description="Complete your setup in just a few minutes to start automating your messages"
      icon={<UserPlus className="h-8 w-8" />}
      gradient="blue"
    >
      <OnboardingWizard />
    </DashboardLayout>
  )
} 