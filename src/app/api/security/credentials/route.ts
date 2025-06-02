import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { secureCredentialsManager } from '@/lib/security/secure-credentials';
import { securityAuditLogger } from '@/lib/security/audit-logger';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      securityAuditLogger.logAuthAttempt(null, false, {
        endpoint: '/api/security/credentials',
        method: 'GET',
        error: 'Unauthorized access attempt'
      });
      
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const platform = searchParams.get('platform');

    switch (action) {
      case 'check':
        // Check if user has valid credentials for a platform
        if (!platform) {
          return NextResponse.json({
            success: false,
            error: 'Platform parameter is required for check action'
          }, { status: 400 });
        }

        const hasCredentials = await secureCredentialsManager.hasValidCredentials(user.id, platform);
        
        securityAuditLogger.logDataAccess(
          user.id,
          'credentials',
          'check',
          true,
          { platform, hasCredentials }
        );

        return NextResponse.json({
          success: true,
          data: {
            platform,
            hasValidCredentials: hasCredentials
          }
        });

      case 'platforms':
        // Get list of platforms with credential status
        const platforms = [
          'telegram', 'whatsapp', 'facebook', 'instagram', 
          'twitter', 'linkedin', 'tiktok', 'youtube',
          'openai', 'anthropic', 'julep', 'twilio', 'sendgrid'
        ];

        const platformStatus = await Promise.all(
          platforms.map(async (platformName) => ({
            platform: platformName,
            hasCredentials: await secureCredentialsManager.hasValidCredentials(user.id, platformName)
          }))
        );

        return NextResponse.json({
          success: true,
          data: {
            platforms: platformStatus,
            total: platforms.length,
            configured: platformStatus.filter(p => p.hasCredentials).length
          }
        });

      case 'get':
        // Get credentials for a specific platform
        if (!platform) {
          return NextResponse.json({
            success: false,
            error: 'Platform parameter is required for get action'
          }, { status: 400 });
        }

        const credentials = await secureCredentialsManager.getPlatformCredentials(user.id, platform);
        
        if (!credentials) {
          return NextResponse.json({
            success: false,
            error: 'No credentials found for this platform'
          }, { status: 404 });
        }

        // Mask sensitive data in response (show only partial values)
        const maskedCredentials: Record<string, string> = {};
        for (const [key, value] of Object.entries(credentials)) {
          if (typeof value === 'string' && value.length > 8) {
            // Show first 4 and last 4 characters, mask the middle
            maskedCredentials[key] = `${value.substring(0, 4)}${'*'.repeat(value.length - 8)}${value.substring(value.length - 4)}`;
          } else if (typeof value === 'string') {
            maskedCredentials[key] = '*'.repeat(value.length);
          } else {
            maskedCredentials[key] = value;
          }
        }

        securityAuditLogger.logDataAccess(
          user.id,
          'credentials',
          'get',
          true,
          { platform, fields: Object.keys(credentials) }
        );

        return NextResponse.json({
          success: true,
          data: {
            platform,
            credentials: maskedCredentials,
            fieldsCount: Object.keys(credentials).length
          }
        });

      default:
        // Default: return overview
        const allCredentials = await secureCredentialsManager.getCredentials(user.id);
        const configuredPlatforms = allCredentials ? Object.keys(allCredentials).length : 0;

        return NextResponse.json({
          success: true,
          data: {
            overview: {
              hasCredentials: !!allCredentials,
              configuredFields: configuredPlatforms,
              lastAccessed: new Date().toISOString()
            }
          }
        });
    }
  } catch (error) {
    console.error('❌ Credentials API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      securityAuditLogger.logAuthAttempt(null, false, {
        endpoint: '/api/security/credentials',
        method: 'POST',
        error: 'Unauthorized access attempt'
      });
      
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action, ...data } = await request.json();

    switch (action) {
      case 'store':
        // Store new credentials
        const { credentials } = data;
        
        if (!credentials || typeof credentials !== 'object') {
          return NextResponse.json({
            success: false,
            error: 'Credentials object is required'
          }, { status: 400 });
        }

        const storeSuccess = await secureCredentialsManager.storeCredentials(user.id, credentials);
        
        if (!storeSuccess) {
          return NextResponse.json({
            success: false,
            error: 'Failed to store credentials'
          }, { status: 500 });
        }

        securityAuditLogger.logSecurityConfigChange(
          user.id,
          'credentials_updated',
          { 
            fieldsUpdated: Object.keys(credentials),
            action: 'store'
          }
        );

        return NextResponse.json({
          success: true,
          data: {
            message: 'Credentials stored successfully',
            fieldsStored: Object.keys(credentials).length
          }
        });

      case 'rotate':
        // Rotate credentials for a specific platform
        const { platform, newCredentials } = data;
        
        if (!platform || !newCredentials) {
          return NextResponse.json({
            success: false,
            error: 'Platform and newCredentials are required'
          }, { status: 400 });
        }

        const rotateSuccess = await secureCredentialsManager.rotateCredentials(user.id, platform, newCredentials);
        
        if (!rotateSuccess) {
          return NextResponse.json({
            success: false,
            error: 'Failed to rotate credentials'
          }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          data: {
            message: `Credentials rotated successfully for ${platform}`,
            platform,
            fieldsRotated: Object.keys(newCredentials).length
          }
        });

      case 'delete':
        // Delete all credentials
        const deleteSuccess = await secureCredentialsManager.deleteCredentials(user.id);
        
        if (!deleteSuccess) {
          return NextResponse.json({
            success: false,
            error: 'Failed to delete credentials'
          }, { status: 500 });
        }

        securityAuditLogger.logSecurityConfigChange(
          user.id,
          'credentials_deleted',
          { action: 'delete_all' }
        );

        return NextResponse.json({
          success: true,
          data: {
            message: 'All credentials deleted successfully'
          }
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Credentials POST error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 