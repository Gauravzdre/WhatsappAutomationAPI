import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { BarChart3, Users, Calendar, MessageSquare, ArrowRight } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return <div>Not authenticated</div>
  }

  // Fetch summary data for the current user only
  const [clientsResult, schedulesResult] = await Promise.all([
    supabase.from('clients').select('id', { count: 'exact' }).eq('user_id', user.id),
    supabase.from('schedules').select('id, last_sent', { count: 'exact' }).eq('user_id', user.id),
  ])

  const totalClients = clientsResult.count || 0
  const totalSchedules = schedulesResult.count || 0
  const pendingSchedules = schedulesResult.data?.filter(s => !s.last_sent).length || 0

  return (
    <DashboardLayout
      title="Dashboard"
      description="Overview of your ClientPing automation system"
      icon={<BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Total Clients
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalClients}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Registered clients in your system
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Total Schedules
            </CardTitle>
            <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalSchedules}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Active message schedules
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Pending Messages
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{pendingSchedules}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Schedules that haven't been sent yet
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href="/clients"
              className="group block p-6 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">Manage Clients</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Add, edit, or remove clients</p>
            </a>
            
            <a
              href="/schedules"
              className="group block p-6 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">Manage Schedules</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Create and manage message schedules</p>
            </a>

            <a
              href="/settings"
              className="group block p-6 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">WhatsApp Settings</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Configure your WhatsApp API credentials</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
} 