interface TeamInvitationData {
  teamName: string
  teamDescription?: string
  inviterName: string
  inviterEmail: string
  inviteeEmail: string
  role: string
  invitationToken: string
  invitationUrl: string
  message?: string
}

interface EmailService {
  sendTeamInvitation(data: TeamInvitationData): Promise<boolean>
}

// Placeholder email service - replace with actual email provider
class PlaceholderEmailService implements EmailService {
  async sendTeamInvitation(data: TeamInvitationData): Promise<boolean> {
    console.log('📧 Team Invitation Email (Placeholder)')
    console.log('To:', data.inviteeEmail)
    console.log('Subject: You\'re invited to join', data.teamName)
    console.log('Invitation URL:', data.invitationUrl)
    console.log('Role:', data.role)
    console.log('Inviter:', data.inviterName)
    
    if (data.message) {
      console.log('Message:', data.message)
    }

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Always return true for placeholder
    return true
  }
}

// Email template for team invitations
export function generateInvitationEmailTemplate(data: TeamInvitationData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Team Invitation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 You're Invited!</h1>
          <p>Join ${data.teamName} on WhatsApp AI Automation Platform</p>
        </div>
        <div class="content">
          <h2>Hi there!</h2>
          <p><strong>${data.inviterName}</strong> (${data.inviterEmail}) has invited you to join the team <strong>"${data.teamName}"</strong> as a <strong>${data.role}</strong>.</p>
          
          ${data.teamDescription ? `<p><em>"${data.teamDescription}"</em></p>` : ''}
          
          ${data.message ? `
            <div style="background: #e3f2fd; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <strong>Personal message from ${data.inviterName}:</strong>
              <p style="margin: 10px 0 0 0;">"${data.message}"</p>
            </div>
          ` : ''}
          
          <p>Click the button below to accept the invitation and join the team:</p>
          
          <a href="${data.invitationUrl}" class="button">Accept Invitation</a>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 4px;">${data.invitationUrl}</p>
          
          <p><strong>What you'll get access to:</strong></p>
          <ul>
            <li>AI-powered WhatsApp automation tools</li>
            <li>Team collaboration features</li>
            <li>Shared templates and workflows</li>
            <li>Analytics and insights</li>
          </ul>
        </div>
        <div class="footer">
          <p>This invitation will expire in 7 days.</p>
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          <p>© 2025 WhatsApp AI Automation Platform</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Factory function to get email service
export function getEmailService(): EmailService {
  // TODO: Replace with actual email service (SendGrid, Resend, etc.)
  // Example implementations:
  
  // For SendGrid:
  // return new SendGridEmailService(process.env.SENDGRID_API_KEY!)
  
  // For Resend:
  // return new ResendEmailService(process.env.RESEND_API_KEY!)
  
  // For now, return placeholder
  return new PlaceholderEmailService()
}

// Helper function to generate invitation URL
export function generateInvitationUrl(token: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${base}/teams/invite/${token}`
}

// Main function to send team invitation
export async function sendTeamInvitation(data: TeamInvitationData): Promise<boolean> {
  try {
    const emailService = getEmailService()
    return await emailService.sendTeamInvitation(data)
  } catch (error) {
    console.error('Failed to send team invitation:', error)
    return false
  }
} 