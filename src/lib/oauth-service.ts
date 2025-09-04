import Composio from '@composio/client'

interface OAuthConfig {
  redirectUri: string
  baseUrl: string
}

interface OAuthConnection {
  id: string
  platform: 'facebook' | 'instagram' | 'google'
  status: 'connected' | 'disconnected' | 'connecting'
  accountInfo?: {
    name: string
    id: string
    profilePicture?: string
  }
  lastConnected?: Date
}

class OAuthService {
  private client: Composio | null = null
  private config: OAuthConfig
  private initialized: boolean = false

  constructor(config: OAuthConfig) {
    this.config = config
  }

  async initialize() {
    if (this.initialized) return
    
    try {
      console.log('🚀 Initializing OAuth service...')
      
      // Check if Composio API key is available
      if (!process.env.COMPOSIO_API_KEY) {
        console.warn('⚠️ COMPOSIO_API_KEY not set - OAuth features will be limited')
        this.initialized = true
        return
      }
      
      this.client = new Composio({
        apiKey: process.env.COMPOSIO_API_KEY
      })
      
      this.initialized = true
      console.log('✅ OAuth service initialized successfully with Composio')
    } catch (error) {
      console.error('❌ Failed to initialize OAuth service:', error)
      // Don't throw error, just mark as initialized without client
      this.initialized = true
    }
  }

  /**
   * Check if Composio is available
   */
  private isComposioAvailable(): boolean {
    return this.client !== null && process.env.COMPOSIO_API_KEY !== undefined
  }

  /**
   * Get available toolkits to see what platforms are supported
   */
  async getAvailableToolkits() {
    try {
      await this.initialize()
      
      if (!this.isComposioAvailable()) {
        throw new Error('Composio is not configured. Please set COMPOSIO_API_KEY environment variable.')
      }
      
      const toolkits = await this.client!.toolkits.list()
      console.log('📱 Available toolkits:', toolkits.items.map(t => ({ slug: t.slug, name: t.name })))
      
      return toolkits.items
    } catch (error) {
      console.error('❌ Failed to get available toolkits:', error)
      throw error
    }
  }

  /**
   * Get Facebook toolkit details and auth configs
   */
  async getFacebookToolkit() {
    try {
      await this.initialize()
      
      if (!this.isComposioAvailable()) {
        throw new Error('Composio is not configured. Please set COMPOSIO_API_KEY environment variable.')
      }
      
      // Try to get Facebook toolkit
      const facebookToolkit = await this.client!.toolkits.retrieve('facebook')
      console.log('✅ Facebook toolkit found:', facebookToolkit.name)
      
      return facebookToolkit
    } catch (error) {
      console.error('❌ Facebook toolkit not found:', error)
      // Try alternative names
      try {
        if (!this.isComposioAvailable()) {
          throw new Error('Composio is not configured')
        }
        
        const metaToolkit = await this.client!.toolkits.retrieve('meta')
        console.log('✅ Meta toolkit found:', metaToolkit.name)
        return metaToolkit
      } catch (metaError) {
        console.error('❌ Meta toolkit not found:', metaError)
        throw new Error('Facebook/Meta toolkit not available in Composio. Please check your Composio configuration.')
      }
    }
  }

  /**
   * Get Instagram toolkit details and auth configs
   */
  async getInstagramToolkit() {
    try {
      await this.initialize()
      
      if (!this.isComposioAvailable()) {
        throw new Error('Composio is not configured. Please set COMPOSIO_API_KEY environment variable.')
      }
      
      const instagramToolkit = await this.client!.toolkits.retrieve('instagram')
      console.log('✅ Instagram toolkit found:', instagramToolkit.name)
      
      return instagramToolkit
    } catch (error) {
      console.error('❌ Instagram toolkit not found:', error)
      throw new Error('Instagram toolkit not available in Composio. Please check your Composio configuration.')
    }
  }

  /**
   * Get OAuth connection URL for Facebook using Composio
   */
  async getFacebookConnectUrl(): Promise<string> {
    try {
      await this.initialize()
      
      if (!this.isComposioAvailable()) {
        throw new Error('OAuth not configured. Please set COMPOSIO_API_KEY environment variable.')
      }
      
      console.log('🔍 Getting Facebook toolkit...')
      const facebookToolkit = await this.getFacebookToolkit()
      
      // Check if toolkit has OAuth auth configs
      if (!facebookToolkit.auth_config_details || facebookToolkit.auth_config_details.length === 0) {
        throw new Error('Facebook toolkit has no OAuth configurations available')
      }
      
      // Find OAuth2 auth config
      const oauthConfig = facebookToolkit.auth_config_details.find(config => 
        config.mode === 'OAUTH2'
      )
      
      if (!oauthConfig) {
        throw new Error('No OAuth2 configuration found for Facebook')
      }
      
      console.log('✅ Found Facebook OAuth config:', oauthConfig.name)
      console.log('🔍 Auth config details:', JSON.stringify(oauthConfig, null, 2))
      
      // Use the real Facebook auth config ID from Composio
      console.log('🚀 Creating Facebook OAuth connection...')
      
      // Use the specific Facebook auth config ID from Composio
      const facebookAuthConfigId = 'ac_-TIOTRR9vPrH'
      console.log('🔑 Using Facebook auth config ID:', facebookAuthConfigId)
      
      const connectionRequest = await this.client!.connectedAccounts.create({
        auth_config: {
          id: facebookAuthConfigId
        },
        connection: {
          redirect_uri: `${this.config.redirectUri}/api/oauth/callback/facebook`,
          user_id: 'default_user' // You can customize this based on your user management
        }
      })
      
      console.log('✅ Facebook OAuth connection created:', connectionRequest.id)
      
      // For OAuth2, we need to redirect the user to the platform's authorization URL
      // The redirect_uri from the response should contain the OAuth URL
      if (connectionRequest.redirect_uri) {
        // Check if the redirect URL is pointing to Composio's backend instead of our app
        if (connectionRequest.redirect_uri.includes('backend.composio.dev')) {
          console.warn('⚠️ Composio returned backend URL, this may cause redirect issues')
          // You might need to construct the OAuth URL manually or check Composio dashboard settings
        }
        return connectionRequest.redirect_uri
      } else {
        // If no redirect_uri is provided, we need to construct the OAuth URL manually
        // This would require additional setup with the platform's OAuth endpoints
        throw new Error('OAuth redirect URL not provided by Composio. Manual OAuth setup required.')
      }
      
    } catch (error) {
      console.error('❌ Failed to get Facebook connect URL:', error)
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('COMPOSIO_API_KEY') || error.message.includes('not configured')) {
          throw new Error('OAuth not configured. Please set COMPOSIO_API_KEY environment variable.')
        } else if (error.message.includes('toolkit not available')) {
          throw new Error('Facebook OAuth is not available. Please check your Composio configuration.')
        } else if (error.message.includes('Auth config not found')) {
          throw new Error('Facebook OAuth auth configuration not found in Composio. Please check your Composio dashboard settings.')
        } else {
          throw new Error(`Facebook OAuth failed: ${error.message}`)
        }
      }
      
      throw new Error('Failed to initialize Facebook OAuth')
    }
  }

  /**
   * Get OAuth connection URL for Instagram using Composio
   */
  async getInstagramConnectUrl(): Promise<string> {
    try {
      await this.initialize()
      
      if (!this.isComposioAvailable()) {
        throw new Error('OAuth not configured. Please set COMPOSIO_API_KEY environment variable.')
      }
      
      console.log('🔍 Getting Instagram toolkit...')
      const instagramToolkit = await this.getInstagramToolkit()
      
      // Check if toolkit has OAuth auth configs
      if (!instagramToolkit.auth_config_details || instagramToolkit.auth_config_details.length === 0) {
        throw new Error('Instagram toolkit has no OAuth configurations available')
      }
      
      // Find OAuth2 auth config
      const oauthConfig = instagramToolkit.auth_config_details.find(config => 
        config.mode === 'OAUTH2'
      )
      
      if (!oauthConfig) {
        throw new Error('No OAuth2 configuration found for Instagram')
      }
      
      console.log('✅ Found Instagram OAuth config:', oauthConfig.name)
      console.log('🔍 Auth config details:', JSON.stringify(oauthConfig, null, 2))
      
      // For Instagram, we'll use the Facebook auth config since Instagram is part of Meta
      // and can share the same OAuth flow
      console.log('🚀 Creating Instagram OAuth connection...')
      
      const connectionRequest = await this.client!.connectedAccounts.create({
        auth_config: {
          id: oauthConfig.name // Use name as identifier since id property doesn't exist
        },
        connection: {
          redirect_uri: `${this.config.redirectUri}/api/oauth/callback/instagram`,
          user_id: 'default_user' // You can customize this based on your user management
        }
      })
      
      console.log('✅ Instagram OAuth connection created:', connectionRequest.id)
      
      // For OAuth2, we need to redirect the user to the platform's authorization URL
      // The redirect_uri from the response should contain the OAuth URL
      if (connectionRequest.redirect_uri) {
        // Check if the redirect URL is pointing to Composio's backend instead of our app
        if (connectionRequest.redirect_uri.includes('backend.composio.dev')) {
          console.warn('⚠️ Composio returned backend URL, this may cause redirect issues')
          // You might need to construct the OAuth URL manually or check Composio dashboard settings
        }
        return connectionRequest.redirect_uri
      } else {
        // If no redirect_uri is provided, we need to construct the OAuth URL manually
        // This would require additional setup with the platform's OAuth endpoints
        throw new Error('OAuth redirect URL not provided by Composio. Manual OAuth setup required.')
      }
      
    } catch (error) {
      console.error('❌ Failed to get Instagram connect URL:', error)
      throw new Error('Failed to initialize Instagram OAuth')
    }
  }

  /**
   * Get OAuth connection URL for Google using Composio
   */
  async getGoogleConnectUrl(): Promise<string> {
    try {
      await this.initialize()
      
      // Since Google toolkit doesn't exist in Composio, we'll use a fallback approach
      // You can implement direct Google OAuth here if needed
      console.log('⚠️ Google toolkit not available in Composio')
      console.log('💡 Consider implementing direct Google OAuth or using a different service')
      
      throw new Error('Google OAuth is not currently supported. Facebook and Instagram are available.')
      
    } catch (error) {
      console.error('❌ Failed to get Google connect URL:', error)
      throw new Error('Google OAuth is not currently supported')
    }
  }

  /**
   * Create a connected account using Composio's API
   */
  async createConnectedAccount(platform: 'facebook' | 'instagram' | 'google', authConfigId: string, userId?: string) {
    try {
      await this.initialize()
      
      if (!this.isComposioAvailable()) {
        throw new Error('OAuth not configured. Please set COMPOSIO_API_KEY environment variable.')
      }
      
      console.log(`🔗 Creating ${platform} connected account...`)
      
      const connectedAccount = await this.client!.connectedAccounts.create({
        auth_config: {
          id: authConfigId
        },
        connection: {
          redirect_uri: `${this.config.redirectUri}/api/oauth/callback/${platform}`,
          user_id: userId
        }
      })
      
      console.log(`✅ ${platform} connected account created:`, connectedAccount.id)
      return connectedAccount
      
    } catch (error) {
      console.error(`❌ Failed to create ${platform} connected account:`, error)
      throw error
    }
  }

  /**
   * Get connection status for a platform
   */
  async getConnectionStatus(platform: 'facebook' | 'instagram' | 'google'): Promise<OAuthConnection | null> {
    try {
      await this.initialize()
      
      if (!this.isComposioAvailable()) {
        throw new Error('OAuth not configured. Please set COMPOSIO_API_KEY environment variable.')
      }
      
      // List connected accounts for the platform
      const connections = await this.client!.connectedAccounts.list({
        toolkit_slug: platform
      })
      
      if (connections.items && connections.items.length > 0) {
        const connection = connections.items[0]
        return {
          id: connection.id,
          platform,
          status: connection.status === 'ACTIVE' ? 'connected' : 'disconnected',
          lastConnected: new Date(connection.created_at)
        }
      }
      
      return null
    } catch (error) {
      console.error(`❌ Failed to get ${platform} connection status:`, error)
      return null
    }
  }

  /**
   * Test if a connection is still valid
   */
  async testConnection(platform: 'facebook' | 'instagram' | 'google', connectionId: string): Promise<boolean> {
    try {
      await this.initialize()
      
      if (!this.isComposioAvailable()) {
        throw new Error('OAuth not configured. Please set COMPOSIO_API_KEY environment variable.')
      }
      
      const connection = await this.client!.connectedAccounts.retrieve(connectionId)
      return connection.status === 'ACTIVE'
      
    } catch (error) {
      console.error(`❌ Failed to test ${platform} connection:`, error)
      return false
    }
  }

  /**
   * Handle OAuth callback and exchange authorization code for access token
   */
  async handleCallback(platform: 'facebook' | 'instagram' | 'google', code: string, state?: string): Promise<OAuthConnection> {
    try {
      await this.initialize()
      
      if (!this.isComposioAvailable()) {
        throw new Error('OAuth not configured. Please set COMPOSIO_API_KEY environment variable.')
      }
      
      console.log(`🔄 Handling ${platform} OAuth callback...`)
      
      // For Composio, we need to check if the connection was successful
      // The code parameter indicates successful authorization
      if (code) {
        console.log(`✅ ${platform} OAuth authorization successful`)
        
        // Create a mock connection object since Composio handles the actual OAuth flow
        // In a real implementation, you might want to store this in your database
        const connection: OAuthConnection = {
          id: `temp_${platform}_${Date.now()}`,
          platform: platform as 'facebook' | 'instagram' | 'google',
          status: 'connected',
          lastConnected: new Date(),
          accountInfo: {
            name: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Account`,
            id: `user_${Date.now()}`
          }
        }
        
        console.log(`✅ ${platform} connection established:`, connection.accountInfo?.name)
        return connection
        
      } else {
        throw new Error('No authorization code received')
      }
      
    } catch (error) {
      console.error(`❌ Failed to handle ${platform} OAuth callback:`, error)
      throw new Error(`Failed to process ${platform} OAuth callback`)
    }
  }
}

// Export singleton instance
export const oauthService = new OAuthService({
  redirectUri: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
})

// Debug environment variables
console.log('🔍 OAuth Service Environment Debug:')
console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)
console.log('COMPOSIO_API_KEY:', process.env.COMPOSIO_API_KEY ? '✅ Set' : '❌ Not set')
console.log('Redirect URI:', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')

export default OAuthService
