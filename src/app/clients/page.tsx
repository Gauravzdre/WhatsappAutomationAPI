'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { Trash2, Edit, Upload, Users, UserPlus, Phone, Mail, Calendar, Activity } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

interface Client {
  id: string
  name: string
  phone: string
  email: string
  created_at: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  })

  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Temporary: Query without user_id filter until database is updated
      console.log('Fetching clients without user_id filter (temporary)...')
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Fetched clients:', data)
      setClients(data || [])
    } catch (error) {
      console.error('Full error:', error)
      toast({
        title: 'Error',
        description: `Failed to fetch clients: ${error instanceof Error ? error.message : 'Unknown error'}`,
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

      if (editingClient) {
        const { error } = await supabase
          .from('clients')
          .update(formData)
          .eq('id', editingClient.id)

        if (error) throw error
        toast({ title: 'Success ✅', description: 'Client updated successfully' })
      } else {
        // Temporary: Insert without user_id until database is updated
        const { error } = await supabase
          .from('clients')
          .insert([formData])

        if (error) throw error
        toast({ title: 'Success ✅', description: 'Client created successfully' })
      }

      setIsDialogOpen(false)
      setEditingClient(null)
      setFormData({ name: '', phone: '', email: '' })
      fetchClients()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save client',
        variant: 'destructive',
      })
    }
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      phone: client.phone,
      email: client.email,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast({ title: 'Deleted ✅', description: 'Client removed successfully' })
      fetchClients()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete client',
        variant: 'destructive',
      })
    }
  }

  const openNewClientDialog = () => {
    setEditingClient(null)
    setFormData({ name: '', phone: '', email: '' })
    setIsDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <DashboardLayout
        title="Clients"
        description="Manage your client contacts and communications"
        icon={<Users className="h-8 w-8" />}
        gradient="green"
      >
        <div className="flex justify-center items-center h-64">
          <div className="flex items-center space-x-2">
            <Activity className="h-6 w-6 animate-spin text-green-600" />
            <span className="text-gray-600 dark:text-gray-300 text-lg">Loading clients...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Clients"
      description="Manage your client contacts and communications"
      icon={<Users className="h-8 w-8" />}
      gradient="green"
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <EnhancedCard variant="gradient" gradient="green">
          <EnhancedCardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <EnhancedCardTitle className="text-lg text-white">Total Clients</EnhancedCardTitle>
              <Users className="h-6 w-6 text-green-200" />
            </div>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="text-3xl font-bold text-white">{clients.length}</div>
            <p className="text-green-100 text-sm mt-1">Active contacts</p>
          </EnhancedCardContent>
        </EnhancedCard>

        <EnhancedCard variant="gradient" gradient="blue">
          <EnhancedCardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <EnhancedCardTitle className="text-lg text-white">Recent Additions</EnhancedCardTitle>
              <Calendar className="h-6 w-6 text-blue-200" />
            </div>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="text-3xl font-bold text-white">
              {clients.filter(c => {
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return new Date(c.created_at) > weekAgo
              }).length}
            </div>
            <p className="text-blue-100 text-sm mt-1">This week</p>
          </EnhancedCardContent>
        </EnhancedCard>

        <EnhancedCard variant="gradient" gradient="purple">
          <EnhancedCardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <EnhancedCardTitle className="text-lg text-white">Engagement</EnhancedCardTitle>
              <Activity className="h-6 w-6 text-purple-200" />
            </div>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="text-3xl font-bold text-white">89%</div>
            <p className="text-purple-100 text-sm mt-1">Response rate</p>
          </EnhancedCardContent>
        </EnhancedCard>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mb-6">
        <Button
          variant="outline"
          onClick={() => router.push('/clients/import')}
          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewClientDialog} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white text-xl">
                {editingClient ? 'Edit Client' : 'Add New Client'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 font-medium">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white mt-1"
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300 font-medium">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white mt-1"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white mt-1"
                    placeholder="client@example.com"
                  />
                </div>
              </div>
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
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  {editingClient ? 'Update' : 'Create'} Client
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Clients Table */}
      <EnhancedCard variant="glass">
        <EnhancedCardHeader>
          <EnhancedCardTitle className="text-gray-900 dark:text-white flex items-center space-x-2">
            <Users className="h-6 w-6 text-green-600" />
            <span>Client Directory</span>
            <Badge variant="secondary" className="ml-2">{clients.length} total</Badge>
          </EnhancedCardTitle>
        </EnhancedCardHeader>
        <EnhancedCardContent>
          {clients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No clients yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Get started by adding your first client to the system.</p>
              <Button onClick={openNewClientDialog} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Your First Client
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 dark:border-gray-700">
                    <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Name</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Contact</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Added</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id} className="border-gray-200 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                      <TableCell className="font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{client.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-300">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{client.phone}</span>
                          </div>
                          {client.email && (
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{client.email}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-300">
                        <Badge variant="outline" className="text-xs">
                          {formatDate(client.created_at)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(client)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(client.id)}
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