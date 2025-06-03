import { PerformanceInsightsDashboard } from '@/components/performance-insights-dashboard'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { TrendingUp } from 'lucide-react'

export default function InsightsPage() {
  return (
    <DashboardLayout
      title="Performance Insights"
      description="AI-powered business intelligence and actionable recommendations to optimize your automation performance"
      icon={<TrendingUp className="h-8 w-8" />}
      gradient="purple"
    >
      <PerformanceInsightsDashboard />
    </DashboardLayout>
  )
} 