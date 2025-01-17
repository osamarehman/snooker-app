import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// These paths don't require authentication
const publicPaths = ['/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/verify-email']

// Cache session checks for 1 minute
const sessionCache = new Map<string, { session: any; timestamp: number }>()
const CACHE_DURATION = 60 * 1000 // 1 minute in milliseconds

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Generate a cache key based on the request cookies
  const cacheKey = req.cookies.toString()
  const cachedData = sessionCache.get(cacheKey)
  const now = Date.now()

  let session

  // Use cached session if it exists and is not expired
  if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
    session = cachedData.session
  } else {
    // If no valid cache, fetch new session
    const { data: { session: newSession } } = await supabase.auth.getSession()
    session = newSession
    
    // Cache the new session
    sessionCache.set(cacheKey, {
      session: newSession,
      timestamp: now
    })

    // Clean up old cache entries
    for (const [key, value] of sessionCache.entries()) {
      if (now - value.timestamp > CACHE_DURATION) {
        sessionCache.delete(key)
      }
    }
  }

  const isAuthPath = publicPaths.includes(req.nextUrl.pathname)

  // If user is signed in and tries to access auth pages, redirect to home
  if (session && isAuthPath) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // If user is not signed in and tries to access protected pages, redirect to login
  if (!session && !isAuthPath) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return res
}

// Configure which routes to run middleware on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 