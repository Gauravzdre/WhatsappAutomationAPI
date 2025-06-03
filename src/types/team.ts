export interface Team {
  id: string
  name: string
  description?: string
  owner_id: string
  plan_type: 'free' | 'pro' | 'enterprise'
  max_members: number
  settings: TeamSettings
  status: 'active' | 'suspended' | 'deleted'
  created_at: string
  updated_at: string
}

export interface TeamSettings {
  allow_member_invites: boolean
  require_approval: boolean
  default_role: TeamRole
  brand_access: 'shared' | 'restricted'
}

export type TeamRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer'

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: TeamRole
  permissions: TeamPermissions
  status: 'active' | 'inactive' | 'pending'
  invited_by?: string
  invited_at: string
  joined_at?: string
  last_active?: string
  created_at: string
  updated_at: string
  // Joined data
  user?: {
    id: string
    email: string
    full_name?: string
    avatar_url?: string
  }
}

export interface TeamPermissions {
  brands: ResourcePermission
  clients: ResourcePermission
  messages: ResourcePermission
  schedules: ResourcePermission
  analytics: ResourcePermission
  team: ResourcePermission
}

export interface ResourcePermission {
  read: boolean
  write: boolean
  delete: boolean
}

export interface TeamInvitation {
  id: string
  team_id: string
  email: string
  role: Exclude<TeamRole, 'owner'>
  invited_by: string
  token: string
  expires_at: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  message?: string
  created_at: string
  updated_at: string
  // Joined data
  team?: {
    id: string
    name: string
    description?: string
  }
  inviter?: {
    id: string
    full_name?: string
    email: string
  }
}

export interface TeamActivityLog {
  id: string
  team_id: string
  user_id?: string
  action: string
  resource_type: string
  resource_id?: string
  details: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
  // Joined data
  user?: {
    id: string
    full_name?: string
    email: string
    avatar_url?: string
  }
}

export interface TeamMemberSummary {
  team_id: string
  team_name: string
  total_members: number
  owners: number
  admins: number
  managers: number
  members: number
  viewers: number
  active_members: number
  active_last_week: number
}

export interface TeamActivitySummary {
  team_id: string
  team_name: string
  total_activities: number
  activities_last_24h: number
  activities_last_week: number
  active_users: number
  last_activity?: string
}

// API Request/Response types
export interface CreateTeamRequest {
  name: string
  description?: string
  plan_type?: 'free' | 'pro' | 'enterprise'
  settings?: Partial<TeamSettings>
}

export interface UpdateTeamRequest {
  name?: string
  description?: string
  settings?: Partial<TeamSettings>
}

export interface InviteTeamMemberRequest {
  email: string
  role: Exclude<TeamRole, 'owner'>
  message?: string
}

export interface UpdateTeamMemberRequest {
  role?: TeamRole
  permissions?: Partial<TeamPermissions>
  status?: 'active' | 'inactive'
}

export interface AcceptInvitationRequest {
  token: string
}

// Role-based permission helpers
export const ROLE_PERMISSIONS: Record<TeamRole, TeamPermissions> = {
  owner: {
    brands: { read: true, write: true, delete: true },
    clients: { read: true, write: true, delete: true },
    messages: { read: true, write: true, delete: true },
    schedules: { read: true, write: true, delete: true },
    analytics: { read: true, write: true, delete: true },
    team: { read: true, write: true, delete: true }
  },
  admin: {
    brands: { read: true, write: true, delete: true },
    clients: { read: true, write: true, delete: true },
    messages: { read: true, write: true, delete: true },
    schedules: { read: true, write: true, delete: true },
    analytics: { read: true, write: true, delete: false },
    team: { read: true, write: true, delete: false }
  },
  manager: {
    brands: { read: true, write: true, delete: false },
    clients: { read: true, write: true, delete: false },
    messages: { read: true, write: true, delete: false },
    schedules: { read: true, write: true, delete: false },
    analytics: { read: true, write: false, delete: false },
    team: { read: true, write: false, delete: false }
  },
  member: {
    brands: { read: true, write: false, delete: false },
    clients: { read: true, write: true, delete: false },
    messages: { read: true, write: true, delete: false },
    schedules: { read: true, write: true, delete: false },
    analytics: { read: true, write: false, delete: false },
    team: { read: true, write: false, delete: false }
  },
  viewer: {
    brands: { read: true, write: false, delete: false },
    clients: { read: true, write: false, delete: false },
    messages: { read: true, write: false, delete: false },
    schedules: { read: true, write: false, delete: false },
    analytics: { read: true, write: false, delete: false },
    team: { read: true, write: false, delete: false }
  }
}

export const ROLE_HIERARCHY: Record<TeamRole, number> = {
  owner: 5,
  admin: 4,
  manager: 3,
  member: 2,
  viewer: 1
}

// Helper functions
export function canManageRole(userRole: TeamRole, targetRole: TeamRole): boolean {
  return ROLE_HIERARCHY[userRole] > ROLE_HIERARCHY[targetRole]
}

export function hasPermission(
  permissions: TeamPermissions,
  resource: keyof TeamPermissions,
  action: keyof ResourcePermission
): boolean {
  return permissions[resource]?.[action] ?? false
}

export function getRoleDisplayName(role: TeamRole): string {
  const names = {
    owner: 'Owner',
    admin: 'Administrator',
    manager: 'Manager',
    member: 'Member',
    viewer: 'Viewer'
  }
  return names[role]
}

export function getRoleDescription(role: TeamRole): string {
  const descriptions = {
    owner: 'Full access to all features and team management',
    admin: 'Manage team members and most features',
    manager: 'Manage content and client interactions',
    member: 'Create and manage content',
    viewer: 'View-only access to team resources'
  }
  return descriptions[role]
} 