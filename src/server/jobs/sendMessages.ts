import { createSupabaseServiceClient } from '@/lib/supabase'
import { WhatsAppService } from '@/lib/whatsapp'
import * as cronParser from 'cron-parser'

interface Schedule {
  id: string
  client_id: string
  message: string
  cron: string
  last_sent: string | null
  clients: {
    id: string
    name: string
    phone: string
    email: string
  }
}

export async function sendScheduledMessages() {
  console.log('Starting scheduled message job...')
  
  try {
    const supabase = createSupabaseServiceClient()
    const whatsapp = new WhatsAppService()

    // Fetch all schedules with client information
    const { data: schedules, error } = await supabase
      .from('schedules')
      .select(`
        *,
        clients (
          id,
          name,
          phone,
          email
        )
      `)

    if (error) {
      console.error('Error fetching schedules:', error)
      return
    }

    if (!schedules || schedules.length === 0) {
      console.log('No schedules found')
      return
    }

    const now = new Date()
    const messagesToSend: Array<{
      schedule: Schedule
      nextRun: Date
    }> = []

    // Check which schedules are due
    for (const schedule of schedules as Schedule[]) {
      try {
        const interval = cronParser.parseExpression(schedule.cron)
        const nextRun = interval.next().toDate()
        
        // If last_sent is null or the next run time has passed since last_sent
        const lastSent = schedule.last_sent ? new Date(schedule.last_sent) : null
        const shouldSend = !lastSent || nextRun > lastSent

        if (shouldSend && nextRun <= now) {
          messagesToSend.push({ schedule, nextRun })
        }
      } catch (error) {
        console.error(`Invalid cron expression for schedule ${schedule.id}:`, schedule.cron, error)
      }
    }

    console.log(`Found ${messagesToSend.length} messages to send`)

    // Send messages
    for (const { schedule } of messagesToSend) {
      try {
        console.log(`Sending message to ${schedule.clients.name} (${schedule.clients.phone})`)
        
        const success = await whatsapp.sendMessage(
          schedule.clients.phone,
          schedule.message
        )

        if (success) {
          // Update last_sent timestamp
          const { error: updateError } = await supabase
            .from('schedules')
            .update({ last_sent: new Date().toISOString() })
            .eq('id', schedule.id)

          if (updateError) {
            console.error(`Error updating schedule ${schedule.id}:`, updateError)
          } else {
            console.log(`Successfully sent and updated schedule ${schedule.id}`)
          }
        } else {
          console.error(`Failed to send message for schedule ${schedule.id}`)
        }
      } catch (error) {
        console.error(`Error processing schedule ${schedule.id}:`, error)
      }
    }

    console.log('Scheduled message job completed')
  } catch (error) {
    console.error('Error in sendScheduledMessages:', error)
  }
}

// Export for manual testing
export default sendScheduledMessages 