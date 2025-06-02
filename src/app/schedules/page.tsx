'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Force dynamic rendering since we use authentication
export const dynamic = 'force-dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { ScheduleBuilder } from '@/components/schedule-builder'
import { Trash2, Edit, Calendar, Clock, Send, Plus, Activity, MessageCircle, Timer, CalendarPlus } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

interface Client {
  id: string
  name: string
  phone: string
  email: string
}

interface Schedule {
  id: string
  client_id: string
  message: string
  cron: string
  last_sent: string | null
  created_at: string
  clients?: Client
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [testingSchedule, setTestingSchedule] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    client_id: '',
    message: '',
    cron: '',
  })

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Fetch clients and schedules separately to avoid foreign key issues
      const [schedulesResponse, clientsResponse] = await Promise.all([
        supabase
          .from('schedules')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('clients')
          .select('*')
          .eq('user_id', user.id)
          .order('name', { ascending: true })
      ])

      if (schedulesResponse.error) {
        console.error('Error fetching schedules:', schedulesResponse.error)
        throw schedulesResponse.error
      }

      if (clientsResponse.error) {
        console.error('Error fetching clients:', clientsResponse.error)
        throw clientsResponse.error
      }

      const schedulesData = schedulesResponse.data || []
      const clientsData = clientsResponse.data || []

      // Manually join schedules with clients
      const schedulesWithClients = schedulesData.map(schedule => {
        const client = clientsData.find(c => c.id === schedule.client_id)
        return {
          ...schedule,
          clients: client
        }
      })

      setSchedules(schedulesWithClients)
      setClients(clientsData)
    } catch (error) {
      console.error('Error in fetchData:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (editingSchedule) {
        const { error } = await supabase
          .from('schedules')
          .update(formData)
          .eq('id', editingSchedule.id)

        if (error) throw error
        toast({ title: 'Success ✅', description: 'Schedule updated successfully' })
      } else {
        const { error } = await supabase
          .from('schedules')
          .insert([{ ...formData, user_id: user.id }])

        if (error) throw error
        toast({ title: 'Success ✅', description: 'Schedule created successfully' })
      }

      setIsDialogOpen(false)
      setEditingSchedule(null)
      setFormData({ client_id: '', message: '', cron: '' })
      fetchData()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save schedule',
        variant: 'destructive',
      })
    }
  }

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    setFormData({
      client_id: schedule.client_id,
      message: schedule.message,
      cron: schedule.cron,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return

    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast({ title: 'Deleted ✅', description: 'Schedule removed successfully' })
      fetchData()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete schedule',
        variant: 'destructive',
      })
    }
  }

  const openNewScheduleDialog = () => {
    setEditingSchedule(null)
    setFormData({ client_id: '', message: '', cron: '' })
    setIsDialogOpen(true)
  }

  const testScheduleMessage = async (schedule: Schedule) => {
    if (!schedule.clients) {
      toast({
        title: 'Error',
        description: 'Client information not found',
        variant: 'destructive',
      })
      return
    }

    setTestingSchedule(schedule.id)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get user's WhatsApp settings
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('whatsapp_phone_id, whatsapp_access_token, whatsapp_api_url')
        .eq('user_id', user.id)
        .single()

      if (settingsError || !settings?.whatsapp_phone_id || !settings?.whatsapp_access_token) {
        toast({
          title: 'WhatsApp Not Configured',
          description: 'Please configure your WhatsApp settings first',
          variant: 'destructive',
        })
        return
      }

      // Send test message
      const response = await fetch('/api/test-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneId: settings.whatsapp_phone_id,
          accessToken: settings.whatsapp_access_token,
          apiUrl: settings.whatsapp_api_url,
          to: schedule.clients.phone,
          message: schedule.message
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({
          title: 'Test Successful! 🎉',
          description: `Message sent to ${schedule.clients.name}`,
        })
      } else {
        throw new Error(result.error || 'Failed to send test message')
      }
    } catch (error) {
      toast({
        title: 'Test Failed ❌',
        description: error instanceof Error ? error.message : 'Failed to send test message',
        variant: 'destructive',
      })
    } finally {
      setTestingSchedule(null)
    }
  }

  const getReadableSchedule = (cron: string): string => {
    // Convert cron expression to readable format
    const parts = cron.split(' ')
    if (parts.length !== 5) return cron

    const [minute, hour, day, month, dayOfWeek] = parts

    const formatTime = (time: string): string => {
      const [h, m] = time.split(':')
      const hour24 = parseInt(h)
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
      const period = hour24 >= 12 ? 'PM' : 'AM'
      return `${hour12}:${m} ${period}`
    }

    if (minute !== '*' && hour !== '*' && day === '*' && month === '*' && dayOfWeek === '*') {
      return `Daily at ${formatTime(`${hour}:${minute.padStart(2, '0')}`)}`
    }

    if (minute !== '*' && hour !== '*' && day === '*' && month === '*' && dayOfWeek !== '*') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      return `${days[parseInt(dayOfWeek)]} at ${formatTime(`${hour}:${minute.padStart(2, '0')}`)}`
    }

    return cron
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getActiveSchedules = () => schedules.length
  const getPendingSchedules = () => schedules.filter(s => !s.last_sent).length
  const getCompletedSchedules = () => schedules.filter(s => s.last_sent).length

  if (loading) {
    return (
      <DashboardLayout
        title="Schedules"
        description="Automate your messaging with intelligent scheduling"
        icon={<Calendar className="h-8 w-8" />}
        gradient="orange"
      >
        <div className="flex justify-center items-center h-64">
          <div className="flex items-center space-x-2">
            <Activity className="h-6 w-6 animate-spin text-orange-600" />
            <span className="text-gray-600 dark:text-gray-300 text-lg">Loading schedules...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Schedules"
      description="Automate your messaging with intelligent scheduling"
      icon={<Calendar className="h-8 w-8" />}
      gradient="orange"
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <EnhancedCard variant="gradient" gradient="orange">
          <EnhancedCardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <EnhancedCardTitle className="text-lg text-white">Active Schedules</EnhancedCardTitle>
              <Calendar className="h-6 w-6 text-orange-200" />
            </div>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="text-3xl font-bold text-white">{getActiveSchedules()}</div>
            <p className="text-orange-100 text-sm mt-1">Total schedules</p>
          </EnhancedCardContent>
        </EnhancedCard>

        <EnhancedCard variant="gradient" gradient="blue">
          <EnhancedCardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <EnhancedCardTitle className="text-lg text-white">Pending</EnhancedCardTitle>
              <Timer className="h-6 w-6 text-blue-200" />
            </div>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="text-3xl font-bold text-white">{getPendingSchedules()}</div>
            <p className="text-blue-100 text-sm mt-1">Awaiting execution</p>
          </EnhancedCardContent>
        </EnhancedCard>

        <EnhancedCard variant="gradient" gradient="green">
          <EnhancedCardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <EnhancedCardTitle className="text-lg text-white">Completed</EnhancedCardTitle>
              <MessageCircle className="h-6 w-6 text-green-200" />
            </div>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="text-3xl font-bold text-white">{getCompletedSchedules()}</div>
            <p className="text-green-100 text-sm mt-1">Messages sent</p>
          </EnhancedCardContent>
        </EnhancedCard>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewScheduleDialog} className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700">
              <CalendarPlus className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-2xl max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white text-xl">
                {editingSchedule ? 'Edit Schedule' : 'Create New Schedule'}
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Set up automated messaging for your clients
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client_id" className="text-gray-700 dark:text-gray-300 font-medium">Client</Label>
                  <Select value={formData.client_id} onValueChange={(value) => setFormData({ ...formData, client_id: value })}>
                    <SelectTrigger className="bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 mt-1">
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          <div className="flex items-center space-x-2">
                            <span>{client.name}</span>
                            <span className="text-gray-400 text-sm">({client.phone})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cron" className="text-gray-700 dark:text-gray-300 font-medium">Schedule</Label>
                  <Input
                    id="cron"
                    value={formData.cron}
                    onChange={(e) => setFormData({ ...formData, cron: e.target.value })}
                    placeholder="0 9 * * *"
                    required
                    className="bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 mt-1"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Cron format: minute hour day month dayOfWeek
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="message" className="text-gray-700 dark:text-gray-300 font-medium">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter your automated message..."
                  required
                  rows={4}
                  className="bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 mt-1"
                />
              </div>

              {formData.cron && (
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-1">Schedule Preview</h4>
                  <p className="text-orange-700 dark:text-orange-300 text-sm">
                    {getReadableSchedule(formData.cron)}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                >
                  {editingSchedule ? 'Update' : 'Create'} Schedule
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Schedules Table */}
      <EnhancedCard variant="glass">
        <EnhancedCardHeader>
          <EnhancedCardTitle className="text-gray-900 dark:text-white flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-orange-600" />
            <span>Scheduled Messages</span>
            <Badge variant="secondary" className="ml-2">{schedules.length} total</Badge>
          </EnhancedCardTitle>
        </EnhancedCardHeader>
        <EnhancedCardContent>
          {schedules.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No schedules yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first automated message schedule.</p>
              <Button onClick={openNewScheduleDialog} className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700">
                <CalendarPlus className="h-4 w-4 mr-2" />
                Create Your First Schedule
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 dark:border-gray-700">
                    <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Client</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Message</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Schedule</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Status</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id} className="border-gray-200 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                      <TableCell className="font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {schedule.clients?.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{schedule.clients?.name}</p>
                            <p className="text-sm text-gray-500">{schedule.clients?.phone}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-300 max-w-xs">
                        <p className="truncate" title={schedule.message}>
                          {schedule.message}
                        </p>
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-300">
                        <Badge variant="outline" className="text-xs">
                          {getReadableSchedule(schedule.cron)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {schedule.last_sent ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            Sent {formatDate(schedule.last_sent)}
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testScheduleMessage(schedule)}
                            disabled={testingSchedule === schedule.id}
                            className="text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/20"
                          >
                            {testingSchedule === schedule.id ? (
                              <Activity className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(schedule)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(schedule.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </EnhancedCardContent>
      </EnhancedCard>
    </DashboardLayout>
  )
} 