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
import { CreateTeamRequest, Team } from '@/types/team'
import { Users, Loader2 } from 'lucide-react'

interface CreateTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTeamCreated: (team: Team) => void
}

export function CreateTeamDialog({ open, onOpenChange, onTeamCreated }: CreateTeamDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateTeamRequest>({
    name: '',
    description: '',
    plan_type: 'free'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        onTeamCreated(data.team)
        setFormData({ name: '', description: '', plan_type: 'free' })
      } else {
        console.error('Error creating team:', data.error)
      }
    } catch (error) {
      console.error('Error creating team:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateTeamRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Create New Team</span>
          </DialogTitle>
          <DialogDescription>
            Create a new team to collaborate with others on your WhatsApp automation projects.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Describe your team's purpose (optional)"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan-type">Plan Type</Label>
            <Select
              value={formData.plan_type}
              onValueChange={(value: 'free' | 'pro' | 'enterprise') => 
                handleInputChange('plan_type', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select plan type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Free</span>
                    <span className="text-sm text-gray-500">Up to 5 members</span>
                  </div>
                </SelectItem>
                <SelectItem value="pro">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Pro</span>
                    <span className="text-sm text-gray-500">Up to 25 members</span>
                  </div>
                </SelectItem>
                <SelectItem value="enterprise">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Enterprise</span>
                    <span className="text-sm text-gray-500">Unlimited members</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
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
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Team
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 