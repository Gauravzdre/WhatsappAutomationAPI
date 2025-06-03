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
import { Team, UpdateTeamRequest } from '@/types/team'
import { Settings, Loader2, AlertTriangle } from 'lucide-react'

interface TeamSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  team: Team
  onTeamUpdated: (team: Team) => void
}

export function TeamSettingsDialog({ open, onOpenChange, team, onTeamUpdated }: TeamSettingsDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<UpdateTeamRequest>({
    name: team.name,
    description: team.description || '',
    settings: team.settings
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name?.trim()) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/teams/${team.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        onTeamUpdated(data.team)
        onOpenChange(false)
      } else {
        console.error('Error updating team:', data.error)
        // TODO: Show error toast
      }
    } catch (error) {
      console.error('Error updating team:', error)
      // TODO: Show error toast
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof UpdateTeamRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSettingChange = (setting: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [setting]: value
      }
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Team Settings</span>
          </DialogTitle>
          <DialogDescription>
            Manage your team's basic information and collaboration settings.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name *</Label>
              <Input
                id="team-name"
                placeholder="Enter team name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-description">Description</Label>
              <Textarea
                id="team-description"
                placeholder="Describe your team's purpose"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Team Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Team Settings</h3>
            
            <div className="space-y-2">
              <Label htmlFor="default-role">Default Role for New Members</Label>
              <Select
                value={formData.settings?.default_role || 'member'}
                onValueChange={(value) => handleSettingChange('default_role', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select default role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand-access">Brand Access</Label>
              <Select
                value={formData.settings?.brand_access || 'shared'}
                onValueChange={(value) => handleSettingChange('brand_access', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select brand access level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shared">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Shared</span>
                      <span className="text-sm text-gray-500">All team members can access brands</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="restricted">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Restricted</span>
                      <span className="text-sm text-gray-500">Only owners and admins can access brands</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Plan Information */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Current Plan</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {team.plan_type.charAt(0).toUpperCase() + team.plan_type.slice(1)} Plan
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{team.max_members} members max</p>
                <p className="text-xs text-gray-500">
                  {team.plan_type === 'free' && 'Upgrade for more members'}
                  {team.plan_type === 'pro' && 'Professional features included'}
                  {team.plan_type === 'enterprise' && 'All features included'}
                </p>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900 dark:text-red-100">Danger Zone</h4>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Deleting a team is permanent and cannot be undone. All team data will be lost.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20"
                  onClick={() => {
                    // TODO: Implement team deletion with confirmation
                    console.log('Delete team clicked')
                  }}
                >
                  Delete Team
                </Button>
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
            <Button type="submit" disabled={loading || !formData.name?.trim()}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 