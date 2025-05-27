'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { ScheduleBuilder } from '@/components/schedule-builder'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit, Calendar, Clock } from 'lucide-react'

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
          .order('created_at', { ascending: false }),
        supabase
          .from('clients')
          .select('*')
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
          .insert([formData])

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
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📅 Message Schedules</h1>
          <p className="mt-2 text-gray-600">Set up automated WhatsApp messages - no technical knowledge required!</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewScheduleDialog} className="bg-blue-600 hover:bg-blue-700">
              <Calendar className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="client">Client</Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} ({client.phone})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter your message here..."
                  required
                />
              </div>
              <div>
                <Label className="text-base font-medium mb-4 block">
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

      <Card>
        <CardHeader>
          <CardTitle>All Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules yet</h3>
              <p className="text-gray-500 mb-4">Create your first automated message schedule to get started!</p>
              <Button onClick={openNewScheduleDialog} variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Create Your First Schedule
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Last Sent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-medium">
                      {schedule.clients?.name || 'Unknown'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {schedule.message}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{getReadableSchedule(schedule.cron)}</span>
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {schedule.cron}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
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
                          onClick={() => handleEdit(schedule)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(schedule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 