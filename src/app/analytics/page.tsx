import AnalyticsDashboard from '@/components/analytics/dashboard'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { BarChart3 } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <DashboardLayout
      title="Analytics Dashboard"
      description="Real-time insights into your messaging performance, automation flows, and user engagement metrics"
      icon={<BarChart3 className="h-8 w-8" />}
      gradient="blue"
    >
      <AnalyticsDashboard />
    </DashboardLayout>
  )
} 