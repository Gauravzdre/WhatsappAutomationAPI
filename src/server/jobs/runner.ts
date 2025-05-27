import * as cron from 'node-cron'
import { sendScheduledMessages } from './sendMessages'

console.log('Starting WhatsApp Automation Job Runner...')

// Run every minute to check for scheduled messages
cron.schedule('* * * * *', async () => {
  console.log('Running scheduled message check...')
  try {
    await sendScheduledMessages()
  } catch (error) {
    console.error('Error in scheduled job:', error)
  }
}, {
  scheduled: true,
  timezone: 'UTC'
})

console.log('Job runner started. Checking for scheduled messages every minute.')

// Keep the process running
process.on('SIGINT', () => {
  console.log('Shutting down job runner...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('Shutting down job runner...')
  process.exit(0)
}) 