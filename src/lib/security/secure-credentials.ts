import { createClient } from '@supabase/supabase-js';
import { encrypt, decrypt, isValidEncryptedData, EncryptedData } from './encryption';
import { securityAuditLogger } from './audit-logger';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface SecureCredentials {
  // Telegram credentials
  telegram_bot_token?: EncryptedData | string;
  
  // WhatsApp credentials
  whatsapp_phone_id?: string; // Not sensitive, can be plain text
  whatsapp_access_token?: EncryptedData | string;
  whatsapp_api_url?: string;
  whatsapp_verify_token?: EncryptedData | string;
  
  // Social media credentials
  facebook_access_token?: EncryptedData | string;
  facebook_page_id?: string;
  instagram_access_token?: EncryptedData | string;
  instagram_account_id?: string;
  twitter_api_key?: EncryptedData | string;
  twitter_api_secret?: EncryptedData | string;
  twitter_access_token?: EncryptedData | string;
  twitter_access_token_secret?: EncryptedData | string;
  linkedin_access_token?: EncryptedData | string;
  linkedin_page_id?: string;
  tiktok_access_token?: EncryptedData | string;
  youtube_api_key?: EncryptedData | string;
  youtube_channel_id?: string;
  
  // AI service credentials
  openai_api_key?: EncryptedData | string;
  anthropic_api_key?: EncryptedData | string;
  julep_api_key?: EncryptedData | string;
  
  // Other service credentials
  twilio_account_sid?: EncryptedData | string;
  twilio_auth_token?: EncryptedData | string;
  sendgrid_api_key?: EncryptedData | string;
}

export interface PlainCredentials {
  telegram_bot_token?: string;
  whatsapp_phone_id?: string;
  whatsapp_access_token?: string;
  whatsapp_api_url?: string;
  whatsapp_verify_token?: string;
  facebook_access_token?: string;
  facebook_page_id?: string;
  instagram_access_token?: string;
  instagram_account_id?: string;
  twitter_api_key?: string;
  twitter_api_secret?: string;
  twitter_access_token?: string;
  twitter_access_token_secret?: string;
  linkedin_access_token?: string;
  linkedin_page_id?: string;
  tiktok_access_token?: string;
  youtube_api_key?: string;
  youtube_channel_id?: string;
  openai_api_key?: string;
  anthropic_api_key?: string;
  julep_api_key?: string;
  twilio_account_sid?: string;
  twilio_auth_token?: string;
  sendgrid_api_key?: string;
}

// Fields that should be encrypted (sensitive data)
const ENCRYPTED_FIELDS = [
  'telegram_bot_token',
  'whatsapp_access_token',
  'whatsapp_verify_token',
  'facebook_access_token',
  'instagram_access_token',
  'twitter_api_key',
  'twitter_api_secret',
  'twitter_access_token',
  'twitter_access_token_secret',
  'linkedin_access_token',
  'tiktok_access_token',
  'youtube_api_key',
  'openai_api_key',
  'anthropic_api_key',
  'julep_api_key',
  'twilio_account_sid',
  'twilio_auth_token',
  'sendgrid_api_key'
];

export class SecureCredentialsManager {
  /**
   * Store user credentials securely with encryption
   * @param userId - User ID
   * @param credentials - Credentials to store
   * @returns Promise<boolean>
   */
  async storeCredentials(userId: string, credentials: PlainCredentials): Promise<boolean> {
    try {
      // Encrypt sensitive fields
      const secureCredentials: SecureCredentials = {};
      
      for (const [key, value] of Object.entries(credentials)) {
        if (value === undefined || value === null || value === '') {
          continue;
        }
        
                 if (ENCRYPTED_FIELDS.includes(key) && typeof value === 'string') {
           // Encrypt sensitive data
           (secureCredentials as any)[key] = encrypt(value);
         } else {
           // Store non-sensitive data as plain text
           (secureCredentials as any)[key] = value;
         }
      }

      // Store in database
      const { error } = await supabase
        .from('settings')
        .upsert({
          user_id: userId,
          ...secureCredentials,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Error storing credentials:', error);
        securityAuditLogger.logDataAccess(
          userId,
          'credentials',
          'store',
          false,
          { error: error.message }
        );
        return false;
      }

      // Log successful credential storage
      securityAuditLogger.logDataAccess(
        userId,
        'credentials',
        'store',
        true,
        { 
          fieldsStored: Object.keys(credentials),
          encryptedFields: Object.keys(credentials).filter(key => ENCRYPTED_FIELDS.includes(key))
        }
      );

      return true;
    } catch (error) {
      console.error('❌ Error in storeCredentials:', error);
      securityAuditLogger.logDataAccess(
        userId,
        'credentials',
        'store',
        false,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
      return false;
    }
  }

  /**
   * Retrieve and decrypt user credentials
   * @param userId - User ID
   * @returns Promise<PlainCredentials | null>
   */
  async getCredentials(userId: string): Promise<PlainCredentials | null> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error fetching credentials:', error);
        securityAuditLogger.logDataAccess(
          userId,
          'credentials',
          'retrieve',
          false,
          { error: error.message }
        );
        return null;
      }

      if (!data) {
        return null;
      }

      // Decrypt sensitive fields
      const plainCredentials: PlainCredentials = {};
      
      for (const [key, value] of Object.entries(data)) {
        if (value === undefined || value === null) {
          continue;
        }
        
        if (ENCRYPTED_FIELDS.includes(key)) {
          try {
            if (isValidEncryptedData(value)) {
              // Decrypt encrypted data
              plainCredentials[key as keyof PlainCredentials] = decrypt(value);
            } else if (typeof value === 'string') {
              // Handle legacy plain text data (for backward compatibility)
              plainCredentials[key as keyof PlainCredentials] = value;
            }
          } catch (decryptError) {
            console.error(`❌ Failed to decrypt ${key}:`, decryptError);
            // Skip this field if decryption fails
            continue;
          }
                 } else if (key !== 'user_id' && key !== 'created_at' && key !== 'updated_at' && key !== 'id') {
           // Store non-sensitive data as-is
           (plainCredentials as any)[key] = value;
         }
      }

      // Log successful credential retrieval
      securityAuditLogger.logDataAccess(
        userId,
        'credentials',
        'retrieve',
        true,
        { fieldsRetrieved: Object.keys(plainCredentials) }
      );

      return plainCredentials;
    } catch (error) {
      console.error('❌ Error in getCredentials:', error);
      securityAuditLogger.logDataAccess(
        userId,
        'credentials',
        'retrieve',
        false,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
      return null;
    }
  }

  /**
   * Get credentials for a specific platform
   * @param userId - User ID
   * @param platform - Platform name
   * @returns Promise<Partial<PlainCredentials> | null>
   */
  async getPlatformCredentials(userId: string, platform: string): Promise<Partial<PlainCredentials> | null> {
    const allCredentials = await this.getCredentials(userId);
    if (!allCredentials) return null;

    const platformLower = platform.toLowerCase();
    
    switch (platformLower) {
      case 'telegram':
        return {
          telegram_bot_token: allCredentials.telegram_bot_token
        };
        
      case 'whatsapp':
        return {
          whatsapp_phone_id: allCredentials.whatsapp_phone_id,
          whatsapp_access_token: allCredentials.whatsapp_access_token,
          whatsapp_api_url: allCredentials.whatsapp_api_url,
          whatsapp_verify_token: allCredentials.whatsapp_verify_token
        };
        
      case 'facebook':
        return {
          facebook_access_token: allCredentials.facebook_access_token,
          facebook_page_id: allCredentials.facebook_page_id
        };
        
      case 'instagram':
        return {
          instagram_access_token: allCredentials.instagram_access_token,
          instagram_account_id: allCredentials.instagram_account_id
        };
        
      case 'twitter':
      case 'x':
        return {
          twitter_api_key: allCredentials.twitter_api_key,
          twitter_api_secret: allCredentials.twitter_api_secret,
          twitter_access_token: allCredentials.twitter_access_token,
          twitter_access_token_secret: allCredentials.twitter_access_token_secret
        };
        
      case 'linkedin':
        return {
          linkedin_access_token: allCredentials.linkedin_access_token,
          linkedin_page_id: allCredentials.linkedin_page_id
        };
        
      case 'tiktok':
        return {
          tiktok_access_token: allCredentials.tiktok_access_token
        };
        
      case 'youtube':
        return {
          youtube_api_key: allCredentials.youtube_api_key,
          youtube_channel_id: allCredentials.youtube_channel_id
        };
        
      case 'openai':
        return {
          openai_api_key: allCredentials.openai_api_key
        };
        
      case 'anthropic':
        return {
          anthropic_api_key: allCredentials.anthropic_api_key
        };
        
      case 'julep':
        return {
          julep_api_key: allCredentials.julep_api_key
        };
        
      case 'twilio':
        return {
          twilio_account_sid: allCredentials.twilio_account_sid,
          twilio_auth_token: allCredentials.twilio_auth_token
        };
        
      case 'sendgrid':
        return {
          sendgrid_api_key: allCredentials.sendgrid_api_key
        };
        
      default:
        return null;
    }
  }

  /**
   * Check if user has valid credentials for a platform
   * @param userId - User ID
   * @param platform - Platform name
   * @returns Promise<boolean>
   */
  async hasValidCredentials(userId: string, platform: string): Promise<boolean> {
    const credentials = await this.getPlatformCredentials(userId, platform);
    if (!credentials) return false;

    const platformLower = platform.toLowerCase();
    
    switch (platformLower) {
      case 'telegram':
        return !!credentials.telegram_bot_token;
        
      case 'whatsapp':
        return !!(credentials.whatsapp_phone_id && credentials.whatsapp_access_token);
        
      case 'facebook':
        return !!(credentials.facebook_access_token && credentials.facebook_page_id);
        
      case 'instagram':
        return !!(credentials.instagram_access_token && credentials.instagram_account_id);
        
      case 'twitter':
      case 'x':
        return !!(credentials.twitter_api_key && credentials.twitter_api_secret && 
                 credentials.twitter_access_token && credentials.twitter_access_token_secret);
        
      case 'linkedin':
        return !!(credentials.linkedin_access_token && credentials.linkedin_page_id);
        
      case 'tiktok':
        return !!credentials.tiktok_access_token;
        
      case 'youtube':
        return !!(credentials.youtube_api_key && credentials.youtube_channel_id);
        
      case 'openai':
        return !!credentials.openai_api_key;
        
      case 'anthropic':
        return !!credentials.anthropic_api_key;
        
      case 'julep':
        return !!credentials.julep_api_key;
        
      case 'twilio':
        return !!(credentials.twilio_account_sid && credentials.twilio_auth_token);
        
      case 'sendgrid':
        return !!credentials.sendgrid_api_key;
        
      default:
        return false;
    }
  }

  /**
   * Delete user credentials
   * @param userId - User ID
   * @returns Promise<boolean>
   */
  async deleteCredentials(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('settings')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error deleting credentials:', error);
        securityAuditLogger.logDataAccess(
          userId,
          'credentials',
          'delete',
          false,
          { error: error.message }
        );
        return false;
      }

      // Log successful credential deletion
      securityAuditLogger.logDataAccess(
        userId,
        'credentials',
        'delete',
        true,
        { action: 'all_credentials_deleted' }
      );

      return true;
    } catch (error) {
      console.error('❌ Error in deleteCredentials:', error);
      securityAuditLogger.logDataAccess(
        userId,
        'credentials',
        'delete',
        false,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
      return false;
    }
  }

  /**
   * Rotate/update specific credential
   * @param userId - User ID
   * @param platform - Platform name
   * @param newCredentials - New credentials for the platform
   * @returns Promise<boolean>
   */
  async rotateCredentials(userId: string, platform: string, newCredentials: Partial<PlainCredentials>): Promise<boolean> {
    try {
      // Get existing credentials
      const existingCredentials = await this.getCredentials(userId);
      if (!existingCredentials) {
        return await this.storeCredentials(userId, newCredentials);
      }

      // Merge with new credentials
      const updatedCredentials = { ...existingCredentials, ...newCredentials };
      
      // Store updated credentials
      const success = await this.storeCredentials(userId, updatedCredentials);
      
      if (success) {
        securityAuditLogger.logSecurityConfigChange(
          userId,
          'credential_rotation',
          { 
            platform,
            rotatedFields: Object.keys(newCredentials)
          }
        );
      }
      
      return success;
    } catch (error) {
      console.error('❌ Error in rotateCredentials:', error);
      return false;
    }
  }
}

// Singleton instance
export const secureCredentialsManager = new SecureCredentialsManager(); 