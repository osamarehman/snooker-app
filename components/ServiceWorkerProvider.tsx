"use client"

import { useEffect } from "react"
import { useOffline } from "@/hooks/useOffline"

interface ServiceWorkerProviderProps {
  children: React.ReactNode;
}

export function ServiceWorkerProvider({ children }: ServiceWorkerProviderProps) {
  const { setIsOnline } = useOffline()

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js', { scope: '/' })
        .then((registration) => {
          console.log('Service Worker registered:', registration);
          registration.sync.register('syncMatches');
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })
    }

    // Handle online/offline status
    const handleOnline = () => {
      setIsOnline(true)
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setIsOnline])

  return <>{children}</>
} 