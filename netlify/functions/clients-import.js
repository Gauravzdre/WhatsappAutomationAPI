const { createClient } = require('@supabase/supabase-js')

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  // Only allow POST method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    // Initialize Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Get authorization header for user session
    const authHeader = event.headers.authorization
    if (!authHeader) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Authorization required' }),
      }
    }

    // Set auth for Supabase client
    const token = authHeader.replace('Bearer ', '')
    supabase.auth.setSession({
      access_token: token,
      refresh_token: '' // Not needed for this operation
    })

    // Parse multipart form data (simplified CSV parsing)
    const body = event.body
    const boundary = event.headers['content-type']?.split('boundary=')[1]
    
    if (!body || !boundary) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No file provided or invalid content type' }),
      }
    }

    // Extract CSV content from multipart data (simplified approach)
    // In production, you'd use a proper multipart parser like 'multiparty'
    const parts = body.split(`--${boundary}`)
    let csvContent = ''
    
    for (const part of parts) {
      if (part.includes('filename=') && part.includes('.csv')) {
        const lines = part.split('\r\n')
        const contentStart = lines.findIndex(line => line.trim() === '') + 1
        csvContent = lines.slice(contentStart).join('\n').trim()
        break
      }
    }

    if (!csvContent) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No CSV content found' }),
      }
    }

    // Parse CSV content
    const lines = csvContent.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'CSV must have at least a header and one data row' }),
      }
    }

    // Parse header
    const header = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase())
    
    // Validate required columns
    const requiredColumns = ['name', 'phone']
    const missingColumns = requiredColumns.filter(col => !header.includes(col))
    
    if (missingColumns.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: `Missing required columns: ${missingColumns.join(', ')}` 
        }),
      }
    }

    // Get column indices
    const nameIndex = header.indexOf('name')
    const phoneIndex = header.indexOf('phone')
    const emailIndex = header.indexOf('email')

    // Parse data rows
    const contacts = []
    const errors = []

    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''))
      
      if (cells.length < Math.max(nameIndex, phoneIndex) + 1) {
        errors.push(`Row ${i + 1}: Insufficient columns`)
        continue
      }

      const name = cells[nameIndex]?.trim()
      const phone = cells[phoneIndex]?.trim()
      const email = emailIndex >= 0 ? cells[emailIndex]?.trim() : undefined

      // Validate required fields
      if (!name) {
        errors.push(`Row ${i + 1}: Name is required`)
        continue
      }

      if (!phone) {
        errors.push(`Row ${i + 1}: Phone is required`)
        continue
      }

      // Validate phone format (basic)
      if (!phone.startsWith('+') || phone.length < 10) {
        errors.push(`Row ${i + 1}: Invalid phone format (use +1234567890)`)
        continue
      }

      // Validate email if provided
      if (email && email.length > 0 && !email.includes('@')) {
        errors.push(`Row ${i + 1}: Invalid email format`)
        continue
      }

      contacts.push({
        name,
        phone,
        email: email && email.length > 0 ? email : undefined
      })
    }

    if (contacts.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'No valid contacts found',
          details: errors
        }),
      }
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'User not authenticated' }),
      }
    }

    // Get existing phone numbers to check for duplicates
    const { data: existingContacts } = await supabase
      .from('clients')
      .select('phone')
      .eq('user_id', user.id)

    const existingPhones = new Set(existingContacts?.map(c => c.phone) || [])

    // Filter out duplicates
    const newContacts = contacts.filter(contact => !existingPhones.has(contact.phone))
    const skippedCount = contacts.length - newContacts.length

    if (newContacts.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'All contacts already exist',
          imported: 0,
          skipped: skippedCount
        }),
      }
    }

    // Prepare contacts for insertion
    const contactsToInsert = newContacts.map(contact => ({
      ...contact,
      user_id: user.id,
      created_at: new Date().toISOString()
    }))

    // Insert contacts
    const { error: insertError } = await supabase
      .from('clients')
      .insert(contactsToInsert)

    if (insertError) {
      console.error('Insert error:', insertError)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to import contacts',
          details: insertError.message
        }),
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        imported: newContacts.length,
        skipped: skippedCount,
        errors: errors.length > 0 ? errors : undefined
      }),
    }

  } catch (error) {
    console.error('Import error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
} 