import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface UserCredentials {
  whatsapp_phone_id?: string
  whatsapp_access_token?: string
  whatsapp_api_url?: string
  whatsapp_verify_token?: string
  facebook_access_token?: string
  facebook_page_id?: string
  instagram_access_token?: string
  instagram_account_id?: string
  twitter_api_key?: string
  twitter_api_secret?: string
  twitter_access_token?: string
  twitter_access_token_secret?: string
  linkedin_access_token?: string
  linkedin_page_id?: string
  tiktok_access_token?: string
  youtube_api_key?: string
  youtube_channel_id?: string
}

/**
 * Get user credentials for a specific platform
 * @param userId - The user ID
 * @param platform - The platform to get credentials for
 * @returns Promise<UserCredentials | null>
 */
export async function getUserCredentials(userId: string, platform?: string): Promise<UserCredentials | null> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select(`
        whatsapp_phone_id,
        whatsapp_access_token,
        whatsapp_api_url,
        whatsapp_verify_token,
        facebook_access_token,
        facebook_page_id,
        instagram_access_token,
        instagram_account_id,
        twitter_api_key,
        twitter_api_secret,
        twitter_access_token,
        twitter_access_token_secret,
        linkedin_access_token,
        linkedin_page_id,
        tiktok_access_token,
        youtube_api_key,
        youtube_channel_id
      `)
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user credentials:', error)
      return null
    }

    return data || null
  } catch (error) {
    console.error('Error in getUserCredentials:', error)
    return null
  }
}

/**
 * Check if user has valid credentials for a specific platform
 * @param userId - The user ID
 * @param platform - The platform to check
 * @returns Promise<boolean>
 */
export async function hasValidCredentials(userId: string, platform: string): Promise<boolean> {
  const credentials = await getUserCredentials(userId)
  if (!credentials) return false

  switch (platform.toLowerCase()) {
    case 'whatsapp':
      return !!(credentials.whatsapp_phone_id && credentials.whatsapp_access_token)
    case 'facebook':
      return !!(credentials.facebook_access_token && credentials.facebook_page_id)
    case 'instagram':
      return !!(credentials.instagram_access_token && credentials.instagram_account_id)
    case 'twitter':
    case 'x':
      return !!(credentials.twitter_api_key && credentials.twitter_api_secret && 
               credentials.twitter_access_token && credentials.twitter_access_token_secret)
    case 'linkedin':
      return !!(credentials.linkedin_access_token && credentials.linkedin_page_id)
    case 'tiktok':
      return !!credentials.tiktok_access_token
    case 'youtube':
      return !!(credentials.youtube_api_key && credentials.youtube_channel_id)
    default:
      return false
  }
}

/**
 * Get platform-specific credentials
 * @param userId - The user ID
 * @param platform - The platform name
 * @returns Promise<Partial<UserCredentials> | null>
 */
export async function getPlatformCredentials(userId: string, platform: string): Promise<Partial<UserCredentials> | null> {
  const credentials = await getUserCredentials(userId)
  if (!credentials) return null

  switch (platform.toLowerCase()) {
    case 'whatsapp':
      return {
        whatsapp_phone_id: credentials.whatsapp_phone_id,
        whatsapp_access_token: credentials.whatsapp_access_token,
        whatsapp_api_url: credentials.whatsapp_api_url,
        whatsapp_verify_token: credentials.whatsapp_verify_token
      }
    case 'facebook':
      return {
        facebook_access_token: credentials.facebook_access_token,
        facebook_page_id: credentials.facebook_page_id
      }
    case 'instagram':
      return {
        instagram_access_token: credentials.instagram_access_token,
        instagram_account_id: credentials.instagram_account_id
      }
    case 'twitter':
    case 'x':
      return {
        twitter_api_key: credentials.twitter_api_key,
        twitter_api_secret: credentials.twitter_api_secret,
        twitter_access_token: credentials.twitter_access_token,
        twitter_access_token_secret: credentials.twitter_access_token_secret
      }
    case 'linkedin':
      return {
        linkedin_access_token: credentials.linkedin_access_token,
        linkedin_page_id: credentials.linkedin_page_id
      }
    case 'tiktok':
      return {
        tiktok_access_token: credentials.tiktok_access_token
      }
    case 'youtube':
      return {
        youtube_api_key: credentials.youtube_api_key,
        youtube_channel_id: credentials.youtube_channel_id
      }
    default:
      return null
  }
} 