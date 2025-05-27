import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

interface ContactRow {
  name: string
  phone: string
  email?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'File must be a CSV' }, { status: 400 })
    }

    // Read and parse CSV
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV must have at least a header and one data row' }, { status: 400 })
    }

    // Parse header
    const header = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase())
    
    // Validate required columns
    const requiredColumns = ['name', 'phone']
    const missingColumns = requiredColumns.filter(col => !header.includes(col))
    
    if (missingColumns.length > 0) {
      return NextResponse.json({ 
        error: `Missing required columns: ${missingColumns.join(', ')}` 
      }, { status: 400 })
    }

    // Get column indices
    const nameIndex = header.indexOf('name')
    const phoneIndex = header.indexOf('phone')
    const emailIndex = header.indexOf('email')

    // Parse data rows
    const contacts: ContactRow[] = []
    const errors: string[] = []

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
      return NextResponse.json({ 
        error: 'No valid contacts found',
        details: errors
      }, { status: 400 })
    }

    // Get existing phone numbers to check for duplicates
    const { data: existingContacts } = await supabase
      .from('clients')
      .select('phone')
      .eq('user_id', session.user.id)

    const existingPhones = new Set(existingContacts?.map(c => c.phone) || [])

    // Filter out duplicates
    const newContacts = contacts.filter(contact => !existingPhones.has(contact.phone))
    const skippedCount = contacts.length - newContacts.length

    if (newContacts.length === 0) {
      return NextResponse.json({ 
        error: 'All contacts already exist',
        imported: 0,
        skipped: skippedCount
      }, { status: 400 })
    }

    // Prepare contacts for insertion
    const contactsToInsert = newContacts.map(contact => ({
      ...contact,
      user_id: session.user.id,
      created_at: new Date().toISOString()
    }))

    // Insert contacts
    const { error: insertError } = await supabase
      .from('clients')
      .insert(contactsToInsert)

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json({ 
        error: 'Failed to import contacts',
        details: insertError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      imported: newContacts.length,
      skipped: skippedCount,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 