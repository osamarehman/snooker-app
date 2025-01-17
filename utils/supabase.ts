import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { rateLimit } from './rateLimit'

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