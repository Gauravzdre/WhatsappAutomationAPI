import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const createSupabaseClient = () => createClientComponentClient()

export const createSupabaseServerClient = () => createServerComponentClient({ cookies })

export const createSupabaseServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          phone: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          email?: string
          created_at?: string
        }
      }
      schedules: {
        Row: {
          id: string
          client_id: string
          message: string
          cron: string
          last_sent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          message: string
          cron: string
          last_sent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          message?: string
          cron?: string
          last_sent?: string | null
          created_at?: string
        }
      }
    }
  }
} 