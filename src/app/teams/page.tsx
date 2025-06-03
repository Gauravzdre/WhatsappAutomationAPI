'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Navigation } from '@/components/layout/navigation'
import { 
  Users, 
  Plus, 
  Settings, 
  Crown, 
  Shield, 
  UserCheck, 
  Eye,
  Calendar,
  Activity,
  MoreVertical,
  Mail,
  UserPlus
} from 'lucide-react'
import { Team, TeamMember, TeamRole, getRoleDisplayName, getRoleDescription } from '@/types/team'
import { CreateTeamDialog } from '@/components/teams/create-team-dialog'
import { InviteMemberDialog } from '@/components/teams/invite-member-dialog'
import { TeamSettingsDialog } from '@/components/teams/team-settings-dialog'
import { MemberManagementDialog } from '@/components/teams/member-management-dialog'
import { TeamActivity } from '@/components/teams/team-activity'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface TeamWithMembers extends Team {
  team_members: Array<{
    id: string
    role: TeamRole
    status: string
    joined_at: string
  }>
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamWithMembers[]>([])
  const [selectedTeam, setSelectedTeam] = useState<TeamWithMembers | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [membersLoading, setMembersLoading] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [memberManagementOpen, setMemberManagementOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

  useEffect(() => {
    fetchTeams()
  }, [])

  useEffect(() => {
    if (selectedTeam) {
      fetchTeamMembers(selectedTeam.id)
    }
  }, [selectedTeam])

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams')
      const data = await response.json()
      
      if (data.success) {
        setTeams(data.teams)
        if (data.teams.length > 0 && !selectedTeam) {
          setSelectedTeam(data.teams[0])
        }
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTeamMembers = async (teamId: string) => {
    setMembersLoading(true)
    try {
      const response = await fetch(`/api/teams/${teamId}/members`)
      const data = await response.json()
      
      if (data.success) {
        setTeamMembers(data.members)
      }
    } catch (error) {
      console.error('Error fetching team members:', error)
    } finally {
      setMembersLoading(false)
    }
  }

  const handleTeamCreated = (newTeam: Team) => {
    fetchTeams()
    setCreateDialogOpen(false)
  }

  const handleMemberInvited = () => {
    if (selectedTeam) {
      fetchTeamMembers(selectedTeam.id)
    }
    setInviteDialogOpen(false)
  }

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(member)
    setMemberManagementOpen(true)
  }

  const handleMemberUpdated = () => {
    if (selectedTeam) {
      fetchTeamMembers(selectedTeam.id)
    }
    setMemberManagementOpen(false)
    setSelectedMember(null)
  }

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Enhanced Page Header - Mobile Optimized */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                    Team Collaboration
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base lg:text-lg">
                    Manage your teams and collaborate with team members
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setCreateDialogOpen(true)} 
                className="flex items-center justify-center space-x-2 w-full sm:w-auto"
                size="lg"
              >
                <Plus className="w-4 h-4" />
                <span>Create Team</span>
              </Button>
            </div>
            <div className="h-1 w-16 sm:w-24 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 rounded-full"></div>
          </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Teams List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Your Teams</span>
              </CardTitle>
              <CardDescription>
                Teams you're a member of
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {teams.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No teams yet</p>
                  <Button 
                    onClick={() => setCreateDialogOpen(true)}
                    variant="outline"
                    size="sm"
                  >
                    Create your first team
                  </Button>
                </div>
              ) : (
                teams.map((team) => (
                  <div
                    key={team.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedTeam?.id === team.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedTeam(team)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {team.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {team.team_members.length} member{team.team_members.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(team.team_members[0]?.role)}
                        <Badge variant="outline" className="text-xs">
                          {team.plan_type}
                        </Badge>
                      </div>
                    </div>
                    {team.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                        {team.description}
                      </p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Team Details */}
        <div className="lg:col-span-2">
          {selectedTeam ? (
            <div className="space-y-6">
              {/* Team Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-3">
                        <span>{selectedTeam.name}</span>
                        {getRoleIcon(selectedTeam.team_members[0]?.role)}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {selectedTeam.description || 'No description provided'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => setInviteDialogOpen(true)}
                        size="sm"
                        className="flex items-center space-x-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Invite</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSettingsDialogOpen(true)}>
                            <Settings className="w-4 h-4 mr-2" />
                            Team Settings
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedTeam.team_members.length}
                      </div>
                      <div className="text-sm text-gray-500">Members</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedTeam.team_members.filter(m => m.status === 'active').length}
                      </div>
                      <div className="text-sm text-gray-500">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedTeam.plan_type}
                      </div>
                      <div className="text-sm text-gray-500">Plan</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {selectedTeam.max_members}
                      </div>
                      <div className="text-sm text-gray-500">Max Members</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Team Members */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Team Members</span>
                  </CardTitle>
                  <CardDescription>
                    Manage team members and their roles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {membersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {teamMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer transition-colors"
                          onClick={() => handleMemberClick(member)}
                        >
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarImage src={member.user?.avatar_url} />
                              <AvatarFallback>
                                {member.user?.full_name?.charAt(0) || member.user?.email?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {member.user?.full_name || 'Unknown User'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {member.user?.email}
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                {getRoleIcon(member.role)}
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                  {getRoleDisplayName(member.role)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {getStatusBadge(member.status)}
                            {member.joined_at && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {new Date(member.joined_at).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Team Activity */}
              <TeamActivity teamId={selectedTeam.id} />
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Select a team
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Choose a team from the list to view details and manage members
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <CreateTeamDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onTeamCreated={handleTeamCreated}
      />

      {selectedTeam && (
        <>
          <InviteMemberDialog
            open={inviteDialogOpen}
            onOpenChange={setInviteDialogOpen}
            teamId={selectedTeam.id}
            onMemberInvited={handleMemberInvited}
          />

          <TeamSettingsDialog
            open={settingsDialogOpen}
            onOpenChange={setSettingsDialogOpen}
            team={selectedTeam}
            onTeamUpdated={(updatedTeam) => {
              // Convert Team to TeamWithMembers by adding team_members array
              const teamWithMembers: TeamWithMembers = {
                ...updatedTeam,
                team_members: selectedTeam?.team_members || []
              }
              setSelectedTeam(teamWithMembers)
              fetchTeams()
            }}
          />

          <MemberManagementDialog
            open={memberManagementOpen}
            onOpenChange={setMemberManagementOpen}
            member={selectedMember}
            teamId={selectedTeam.id}
            currentUserRole={selectedTeam.team_members[0]?.role || 'member'}
            onMemberUpdated={handleMemberUpdated}
          />
        </>
      )}
        </div>
      </main>
      
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-600/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  )
} 