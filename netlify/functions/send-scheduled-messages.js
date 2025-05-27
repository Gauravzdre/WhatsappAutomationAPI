const { createClient } = require('@supabase/supabase-js')

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    // Initialize Supabase with service role key for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Get current time
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase()

    console.log(`Checking for messages to send at ${currentTime} on ${currentDay}`)

    // Find schedules that should run now
    const { data: schedules, error: schedulesError } = await supabase
      .from('schedules')
      .select(`
        *,
        clients!inner(*),
        user_id
      `)
      .eq('status', 'active')
      .contains('days', [currentDay])
      .eq('time', currentTime)

    if (schedulesError) {
      console.error('Error fetching schedules:', schedulesError)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to fetch schedules' }),
      }
    }

    if (!schedules || schedules.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          message: 'No messages scheduled for this time',
          processed: 0 
        }),
      }
    }

    console.log(`Found ${schedules.length} schedules to process`)

    let sentCount = 0
    let errorCount = 0
    const errors = []

    // Process each schedule
    for (const schedule of schedules) {
      try {
        // Get user's WhatsApp settings
        const { data: userSettings, error: settingsError } = await supabase
          .from('settings')
          .select('whatsapp_phone_id, whatsapp_access_token, whatsapp_api_url')
          .eq('user_id', schedule.user_id)
          .single()

        if (settingsError || !userSettings?.whatsapp_phone_id || !userSettings?.whatsapp_access_token) {
          errorCount++
          errors.push(`No WhatsApp settings configured for user ${schedule.user_id}`)
          console.error(`No WhatsApp settings for user ${schedule.user_id}`)
          continue
        }

        // Send WhatsApp message using user's credentials
        const apiUrl = userSettings.whatsapp_api_url || 'https://graph.facebook.com/v15.0'
        const response = await fetch(`${apiUrl}/${userSettings.whatsapp_phone_id}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userSettings.whatsapp_access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: schedule.clients.phone.replace(/\D/g, ''), // Clean phone number
            type: 'text',
            text: {
              body: schedule.message
            }
          })
        })

        if (response.ok) {
          sentCount++
          console.log(`Message sent to ${schedule.clients.phone}`)
          
          // Update last_sent timestamp
          await supabase
            .from('schedules')
            .update({ 
              last_sent: now.toISOString(),
              sent_count: (schedule.sent_count || 0) + 1
            })
            .eq('id', schedule.id)
            
        } else {
          const errorData = await response.text()
          errorCount++
          errors.push(`Failed to send to ${schedule.clients.phone}: ${errorData}`)
          console.error(`Failed to send message to ${schedule.clients.phone}:`, errorData)
        }

      } catch (error) {
        errorCount++
        errors.push(`Error sending to ${schedule.clients.phone}: ${error.message}`)
        console.error(`Error sending message to ${schedule.clients.phone}:`, error)
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        processed: schedules.length,
        sent: sentCount,
        errors: errorCount,
        details: errors.length > 0 ? errors : undefined,
        timestamp: now.toISOString()
      }),
    }

  } catch (error) {
    console.error('Scheduler error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
} 