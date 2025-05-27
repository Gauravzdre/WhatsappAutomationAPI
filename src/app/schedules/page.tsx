'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { ScheduleBuilder } from '@/components/schedule-builder'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit, Calendar, Clock, Send } from 'lucide-react'
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

      const [schedulesResult, clientsResult] = await Promise.all([
        supabase
          .from('schedules')
          .select(`
            *,
            clients (
              id,
              name,
              phone,
              email
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('clients')
          .select('*')
          .eq('user_id', user.id)
          .order('name', { ascending: true })
      ])

      if (schedulesResult.error) throw schedulesResult.error
      if (clientsResult.error) throw clientsResult.error

      setSchedules(schedulesResult.data || [])
      setClients(clientsResult.data || [])
    } catch (error) {
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
        toast({ title: 'Success', description: 'Schedule updated successfully' })
      } else {
        const { error } = await supabase
          .from('schedules')
          .insert([{ ...formData, user_id: user.id }])

        if (error) throw error
        toast({ title: 'Success', description: 'Schedule created successfully' })
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
      toast({ title: 'Success', description: 'Schedule deleted successfully' })
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
          title: 'Test Message Sent! ✅',
          description: `Message sent to ${schedule.clients.name} (${schedule.clients.phone})`,
        })
      } else {
        throw new Error(result.error || 'Failed to send test message')
      }
    } catch (error) {
      console.error('Test failed:', error)
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
    try {
      const parts = cron.split(' ')
      if (parts.length !== 5) return cron

      const [minute, hour, dayOfMonth, month, dayOfWeek] = parts
      const time = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
      
      const formatTime = (time: string): string => {
        const [h, m] = time.split(':')
        const hour = parseInt(h)
        const period = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
        return `${displayHour}:${m} ${period}`
      }

      // Daily
      if (dayOfWeek === '*' && dayOfMonth === '*') {
        return `Daily at ${formatTime(time)}`
      }
      
      // Weekly
      if (dayOfWeek !== '*' && dayOfMonth === '*') {
        const dayNames = dayOfWeek.split(',').map(d => {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
          return days[parseInt(d)] || d
        }).join(', ')
        return `${dayNames} at ${formatTime(time)}`
      }
      
      // Monthly
      if (dayOfWeek === '*' && dayOfMonth !== '*') {
        const day = parseInt(dayOfMonth)
        const suffix = day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'
        return `${day}${suffix} of each month at ${formatTime(time)}`
      }

      return cron
    } catch {
      return cron
    }
  }

  if (loading) {
    return (
      <DashboardLayout
        title="Message Schedules"
        description="Set up automated WhatsApp messages - no technical knowledge required!"
        icon={<Calendar className="h-8 w-8 text-green-600 dark:text-green-400" />}
      >
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Message Schedules"
      description="Set up automated WhatsApp messages - no technical knowledge required!"
      icon={<Calendar className="h-8 w-8 text-green-600 dark:text-green-400" />}
    >
      {/* Create Schedule Button */}
      <div className="flex justify-end mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewScheduleDialog} className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800">
              <Calendar className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">
                {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-300">
                {editingSchedule 
                  ? 'Update your automated message schedule settings.' 
                  : 'Set up a new automated WhatsApp message schedule with simple, user-friendly options.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="client" className="text-gray-700 dark:text-gray-300">Client</Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">
                        {client.name} ({client.phone})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="message" className="text-gray-700 dark:text-gray-300">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter your message here..."
                  required
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <Label className="text-base font-medium mb-4 block text-gray-700 dark:text-gray-300">
                  📅 When should this message be sent?
                </Label>
                <ScheduleBuilder
                  value={formData.cron}
                  onChange={(cron) => setFormData({ ...formData, cron })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSchedule ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Schedules Table */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">All Schedules ({schedules.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No schedules yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first automated message schedule to get started!</p>
              <Button onClick={openNewScheduleDialog} variant="outline" className="border-green-300 dark:border-green-600 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20">
                <Calendar className="h-4 w-4 mr-2" />
                Create Your First Schedule
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 dark:border-gray-700">
                    <TableHead className="text-gray-700 dark:text-gray-300">Client</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Message</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Schedule</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Last Sent</TableHead>
                    <TableHead className="text-right text-gray-700 dark:text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id} className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <TableCell className="font-medium text-gray-900 dark:text-white">
                        {schedule.clients?.name || 'Unknown'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-gray-700 dark:text-gray-300">
                        {schedule.message}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-green-500 dark:text-green-400" />
                            <span className="font-medium text-gray-900 dark:text-white">{getReadableSchedule(schedule.cron)}</span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {schedule.cron}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {schedule.last_sent 
                          ? new Date(schedule.last_sent).toLocaleString()
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testScheduleMessage(schedule)}
                            disabled={testingSchedule === schedule.id}
                            title="Send test message now"
                            className="border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            {testingSchedule === schedule.id ? (
                              <Clock className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(schedule)}
                            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(schedule.id)}
                            className="border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
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
        </CardContent>
      </Card>
    </DashboardLayout>
  )
} 