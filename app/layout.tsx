import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "sonner";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { UserNav } from "@/components/UserNav";

const inter = Inter({ subsets: ["latin"] });

// Cache duration for session in layout
const SESSION_CACHE_DURATION = 60 * 1000 // 1 minute

let sessionCache: {
  session: any;
  timestamp: number;
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
  const supabase = createServerComponentClient({ cookies });
  
  // Check if we have a valid cached session
  const now = Date.now()
  let session
  
  if (sessionCache && (now - sessionCache.timestamp) < SESSION_CACHE_DURATION) {
    session = sessionCache.session
  } else {
    // Fetch new session
    const { data: { session: newSession } } = await supabase.auth.getSession()
    session = newSession
    
    // Update cache
    sessionCache = {
      session: newSession,
      timestamp: now
    }
  }

  const isAuthPage = [
    '/auth/login',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/verify-email'
  ].includes(cookies().get('next-url')?.value || '')

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
  );
}
