'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TeamMember, TeamRole, getRoleDisplayName, getRoleDescription } from '@/types/team'
import { Crown, Shield, UserCheck, Users, Eye, Trash2, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface MemberManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: TeamMember | null
  teamId: string
  currentUserRole: TeamRole
  onMemberUpdated: () => void
}

export function MemberManagementDialog({
  open,
  onOpenChange,
  member,
  teamId,
  currentUserRole,
  onMemberUpdated
}: MemberManagementDialogProps) {
  const [selectedRole, setSelectedRole] = useState<TeamRole | ''>('')
  const [loading, setLoading] = useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)

  const getRoleIcon = (role: TeamRole) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />
      case 'manager':
        return <UserCheck className="w-4 h-4 text-green-500" />
      case 'member':
        return <Users className="w-4 h-4 text-gray-500" />
      case 'viewer':
        return <Eye className="w-4 h-4 text-gray-400" />
      default:
        return <Users className="w-4 h-4 text-gray-500" />
    }
  }

  const canManageRole = (userRole: TeamRole, targetRole: TeamRole) => {
    const roleHierarchy = { owner: 5, admin: 4, manager: 3, member: 2, viewer: 1 }
    return roleHierarchy[userRole] > roleHierarchy[targetRole]
  }

  const getAvailableRoles = (): TeamRole[] => {
    const allRoles: TeamRole[] = ['admin', 'manager', 'member', 'viewer']
    
    if (currentUserRole === 'owner') {
      return allRoles
    } else if (currentUserRole === 'admin') {
      return ['manager', 'member', 'viewer']
    }
    
    return []
  }

  const handleRoleChange = async () => {
    if (!member || !selectedRole) return

    setLoading(true)
    try {
      const response = await fetch(`/api/teams/${teamId}/members/${member.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: selectedRole
        }),
      })

      const data = await response.json()

      if (data.success) {
        onMemberUpdated()
        onOpenChange(false)
        setSelectedRole('')
      } else {
        console.error('Failed to update member role:', data.error)
      }
    } catch (error) {
      console.error('Error updating member role:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async () => {
    if (!member) return

    setLoading(true)
    try {
      const response = await fetch(`/api/teams/${teamId}/members/${member.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        onMemberUpdated()
        onOpenChange(false)
        setShowRemoveConfirm(false)
      } else {
        console.error('Failed to remove member:', data.error)
      }
    } catch (error) {
      console.error('Error removing member:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!member) return null

  const canManage = canManageRole(currentUserRole, member.role)
  const availableRoles = getAvailableRoles()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle>Manage Team Member</DialogTitle>
          <DialogDescription>
            Update role or remove team member
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Member Info */}
          <div className="flex items-center space-x-4 p-4 border rounded-lg">
            <Avatar>
              <AvatarImage src={member.user?.avatar_url} />
              <AvatarFallback>
                {member.user?.full_name?.charAt(0) || member.user?.email?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium">
                {member.user?.full_name || 'Unknown User'}
              </div>
              <div className="text-sm text-gray-500">
                {member.user?.email}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                {getRoleIcon(member.role)}
                <span className="text-sm">
                  {getRoleDisplayName(member.role)}
                </span>
                <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                  {member.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Role Management */}
          {canManage && member.role !== 'owner' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Change Role</label>
                <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as TeamRole)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select new role" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(role)}
                          <span>{getRoleDisplayName(role)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedRole && (
                  <p className="text-sm text-gray-500 mt-1">
                    {getRoleDescription(selectedRole)}
                  </p>
                )}
              </div>

              {selectedRole && selectedRole !== member.role && (
                <Button 
                  onClick={handleRoleChange} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Updating...' : 'Update Role'}
                </Button>
              )}
            </div>
          )}

          {/* Remove Member */}
          {canManage && member.role !== 'owner' && (
            <div className="space-y-4">
              {!showRemoveConfirm ? (
                <Button
                  variant="destructive"
                  onClick={() => setShowRemoveConfirm(true)}
                  className="w-full flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove from Team</span>
                </Button>
              ) : (
                <div className="space-y-3">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Are you sure you want to remove this member? This action cannot be undone.
                    </AlertDescription>
                  </Alert>
                  <div className="flex space-x-2">
                    <Button
                      variant="destructive"
                      onClick={handleRemoveMember}
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? 'Removing...' : 'Yes, Remove'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowRemoveConfirm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!canManage && (
            <Alert>
              <AlertDescription>
                You don't have permission to manage this team member.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 