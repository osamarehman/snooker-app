import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "sonner";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies, headers } from "next/headers";
import { ServiceWorkerProvider } from "@/components/ServiceWorkerProvider"
import { redirect } from 'next/navigation'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Snooker Club Management",
  description: "Manage your snooker club efficiently",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({
    cookies: () => cookieStore
  })
  
  const { data: { user } } = await supabase.auth.getUser()

  // Get the current path
  const headersList = await headers()
  const pathname = headersList.get("x-invoke-path") || ""
  
  const isAuthPage = [
    '/auth/login',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
  ].includes(pathname)

  // Redirect to login if user is not authenticated and not on an auth page
  if (!user && !isAuthPage) {
    redirect('/auth/login')
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <ServiceWorkerProvider>
          <div className="flex">
            {!isAuthPage && <Sidebar user={user} />}
            <main className="flex-1">{children}</main>
          </div>
          <Toaster position="top-right" />
        </ServiceWorkerProvider>
      </body>
    </html>
  );
}
