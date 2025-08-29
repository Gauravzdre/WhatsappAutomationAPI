import AnalyticsDashboard from '@/components/analytics/dashboard'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { BarChart3 } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <DashboardLayout
      title="Content & Social Media Analytics"
      description="Track performance, engagement, and optimize your content strategy across all social platforms"
      icon={<BarChart3 className="h-8 w-8" />}
      gradient="purple"
    >
      <AnalyticsDashboard />
    </DashboardLayout>
  )
} 