import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "sonner";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
// import { UserNav } from "@/components/UserNav";
import { headers } from 'next/headers'
import { Session } from '@supabase/supabase-js';

const inter = Inter({ subsets: ["latin"] });

// Cache duration for session in layout - 5 minutes
const SESSION_CACHE_DURATION = 5 * 60 * 1000 

let sessionCache: {
  session: Session | null;
  timestamp: number;
  path: string;
} | null = null;

export const metadata: Metadata = {
  title: "Snooker Club Management",
  description: "Manage your snooker club efficiently",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = headers()
  const currentPath = headersList.get('x-pathname') || ''
  
  const supabase = createServerComponentClient({ cookies })
  
  // Check if we have a valid cached session for this path
  const now = Date.now()
  let session

  if (
    sessionCache && 
    sessionCache.path === currentPath && 
    (now - sessionCache.timestamp) < SESSION_CACHE_DURATION
  ) {
    session = sessionCache.session
  } else {
    try {
      const { data: { session: newSession } } = await supabase.auth.getSession()
      session = newSession
      
      // Update cache with path info
      sessionCache = {
        session: newSession,
        timestamp: now,
        path: currentPath
      }
    } catch (error) {
      console.error('Session fetch error:', error)
      session = null
    }
  }

  const isAuthPage = [
    '/auth/login',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/verify-email'
  ].includes(currentPath)

  return (
    <html lang="en">
      <body className={inter.className}>
        {isAuthPage ? (
          children
        ) : (
          <div className="flex min-h-screen">
            {session && <Sidebar />}
            <main className="flex-1">
              {children}
            </main>
          </div>
        )}
        <Toaster />
      </body>
    </html>
  )
}
