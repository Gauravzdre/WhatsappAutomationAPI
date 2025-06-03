import AnalyticsDashboard from '@/components/analytics/dashboard'

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your messaging performance, automation flows, and user engagement metrics.
        </p>
      </div>
      <AnalyticsDashboard />
    </div>
  )
} 