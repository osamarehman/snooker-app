import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "sonner";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { ServiceWorkerProvider } from "@/components/ServiceWorkerProvider"

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
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/'
  
  const supabase = createServerComponentClient({
    cookies: () => cookieStore
  })
  
  const { data: { user } } = await supabase.auth.getUser()

  const isAuthPage = [
    '/auth/login',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
  ].includes(pathname)

  if (!user && !isAuthPage) {
    return (
      <html lang="en">
        <body className={inter.className}>
          <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <h1 className="text-4xl font-bold mb-8">Please log in to continue</h1>
            <a
              href="/auth/login"
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go to Login
            </a>
          </main>
        </body>
      </html>
    )
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
