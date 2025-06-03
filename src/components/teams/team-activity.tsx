'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  UserPlus, 
  UserMinus, 
  Settings, 
  Crown, 
  Shield, 
  Mail,
  Calendar,
  RefreshCw
} from 'lucide-react'

interface TeamActivityLog {
  id: string
  action: string
  resource_type: string
  resource_id: string
  details: any
  created_at: string
  user: {
    id: string
    email: string
    full_name: string
    avatar_url?: string
  } | null
}

interface TeamActivityProps {
  teamId: string
}

export function TeamActivity({ teamId }: TeamActivityProps) {
  const [activities, setActivities] = useState<TeamActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchActivities()
  }, [teamId])

  const fetchActivities = async (refresh = false) => {
    if (refresh) setRefreshing(true)
    else setLoading(true)

    try {
      const response = await fetch(`/api/teams/${teamId}/activity?limit=20`)
      const data = await response.json()
      
      if (data.success) {
        setActivities(data.activities)
      }
    } catch (error) {
      console.error('Error fetching team activities:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'team_created':
        return <Crown className="w-4 h-4 text-yellow-500" />
      case 'member_invited':
        return <Mail className="w-4 h-4 text-blue-500" />
      case 'member_joined':
        return <UserPlus className="w-4 h-4 text-green-500" />
      case 'member_removed':
        return <UserMinus className="w-4 h-4 text-red-500" />
      case 'member_updated':
        return <Shield className="w-4 h-4 text-purple-500" />
      case 'team_updated':
        return <Settings className="w-4 h-4 text-gray-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  const getActivityDescription = (activity: TeamActivityLog) => {
    const userName = activity.user?.full_name || activity.user?.email || 'Team Member'
    
    switch (activity.action) {
      case 'team_created':
        return `${userName} created the team`
      case 'member_invited':
        return `${userName} invited ${activity.details?.email} as ${activity.details?.role}`
      case 'member_joined':
        return `${userName} joined the team`
      case 'member_removed':
        return `${userName} removed a team member`
      case 'member_updated':
        return `${userName} updated a team member's role`
      case 'team_updated':
        return `${userName} updated team settings`
      default:
        return `${userName} performed an action`
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return 'Just now'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} day${days > 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Team Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Team Activity</span>
            </CardTitle>
            <CardDescription>
              Recent team actions and changes
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchActivities(true)}
            disabled={refreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No activity yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Team actions will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {getActivityDescription(activity)}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {activity.resource_type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-gray-500 flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatTimeAgo(activity.created_at)}</span>
                      </span>
                    </div>
                  </div>
                  
                  {activity.user && (
                    <div className="flex items-center space-x-2 mt-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={activity.user.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {activity.user.full_name?.charAt(0) || activity.user.email?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-gray-500">
                        {activity.user.full_name || activity.user.email}
                      </span>
                    </div>
                  )}

                  {activity.details && Object.keys(activity.details).length > 0 && (
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                      {activity.action === 'member_invited' && activity.details.email && (
                        <span>Invited: {activity.details.email}</span>
                      )}
                      {activity.action === 'member_updated' && activity.details.changes && (
                        <span>Changed: {activity.details.changes.join(', ')}</span>
                      )}
                      {activity.action === 'team_created' && activity.details.team_name && (
                        <span>Team: {activity.details.team_name}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 