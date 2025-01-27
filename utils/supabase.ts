import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { rateLimit } from './rateLimit'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

const rateLimitedFetch = rateLimit(fetch, {
  windowMs: 60000, // 1 minute
  max: 30 // max 30 requests per minute
})

export function createRateLimitedSupabaseClient() {
  return createClientComponentClient({
    options: {
      global: {
        fetch: rateLimitedFetch
      }
    }
  })
} 