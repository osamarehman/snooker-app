"use client"

import { useEffect } from "react"
import { useOffline } from "@/hooks/useOffline"
import { toast } from "sonner"

interface ServiceWorkerProviderProps {
  children: React.ReactNode;
}

export function ServiceWorkerProvider({ children }: ServiceWorkerProviderProps) {
  const { setIsOnline, syncStatus } = useOffline()

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration)
          
          // Request sync permission
          if ('periodicSync' in registration) {
            registration.periodicSync.register('syncData', {
              minInterval: 24 * 60 * 60 * 1000, // 24 hours
            }).catch(console.error)
          }
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })

      // Handle online/offline status
      const handleOnline = () => {
        setIsOnline(true)
        toast.success("You're back online!")
      }

      const handleOffline = () => {
        setIsOnline(false)
        toast.warning("You're offline. Changes will sync when connection is restored.")
      }

      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)

      // Set initial online status
      setIsOnline(navigator.onLine)

      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [setIsOnline])

  return (
    <>
      {children}
      {syncStatus === 'syncing' && (
        <div className="fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-lg shadow-lg">
          Syncing changes...
        </div>
      )}
    </>
  )
} 