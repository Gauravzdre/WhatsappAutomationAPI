'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InviteTeamMemberRequest, TeamRole, getRoleDisplayName, getRoleDescription } from '@/types/team'
import { UserPlus, Loader2, Mail } from 'lucide-react'

interface InviteMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamId: string
  onMemberInvited: () => void
}

export function InviteMemberDialog({ open, onOpenChange, teamId, onMemberInvited }: InviteMemberDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<InviteTeamMemberRequest>({
    email: '',
    role: 'member',
    message: ''
  })

  const availableRoles: Exclude<TeamRole, 'owner'>[] = ['admin', 'manager', 'member', 'viewer']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email.trim()) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        onMemberInvited()
        setFormData({ email: '', role: 'member', message: '' })
      } else {
        console.error('Error inviting member:', data.error)
        // TODO: Show error toast
      }
    } catch (error) {
      console.error('Error inviting member:', error)
      // TODO: Show error toast
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof InviteTeamMemberRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <span>Invite Team Member</span>
          </DialogTitle>
          <DialogDescription>
            Send an invitation to join your team. They'll receive an email with instructions to accept.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="member-email">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="member-email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="member-role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value: Exclude<TeamRole, 'owner'>) => 
                handleInputChange('role', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{getRoleDisplayName(role)}</span>
                      <span className="text-sm text-gray-500">{getRoleDescription(role)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invitation-message">Personal Message (Optional)</Label>
            <Textarea
              id="invitation-message"
              placeholder="Add a personal message to the invitation..."
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              rows={3}
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="flex items-start space-x-2">
              <Mail className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium">Invitation will be sent via email</p>
                <p className="text-blue-600 dark:text-blue-300">
                  The recipient will receive an email with a link to accept the invitation and join your team.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.email.trim()}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 