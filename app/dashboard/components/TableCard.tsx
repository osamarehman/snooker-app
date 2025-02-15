"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Users, Layout, CreditCard } from "lucide-react"
import type { Match, Status, IndexedDBMatch } from "@/types/database"
import { useRouter } from "next/navigation"
import { db } from '@/utils/indexedDB'
import { useOffline } from '@/hooks/useOffline'
import { toast } from "sonner"

type TableCardProps = {
  tableNumber: number;
  status: "AVAILABLE" | "IN_USE";
  currentMatch?: Match;
}

export default function TableCard({ tableNumber, status, currentMatch }: TableCardProps) {
  const router = useRouter()
  const {  queueAction } = useOffline()
  const [loading, setLoading] = useState(false)

  const handleEndMatch = async () => {
    if (!currentMatch) return
    setLoading(true)

    try {
      const logoutTime = new Date()

      if (typeof window !== 'undefined') {
        try {
          const existingMatch = await db.getById<IndexedDBMatch>('matches', currentMatch.id)
          if (existingMatch) {
            await db.upsert('matches', {
              ...existingMatch,
              status: "COMPLETED" as Status,
              logoutTime: logoutTime.toISOString(),
              updatedAt: new Date().toISOString()
            })
          }
        } catch (error) {
          console.error('Failed to update IndexedDB:', error)
        }
      }

      await queueAction({
        type: 'UPDATE_MATCH',
        payload: {
          id: currentMatch.id,
          status: "COMPLETED" as Status,
          logoutTime: logoutTime.toISOString()
        },
        endpoint: `/api/matches/${currentMatch.id}`,
        method: 'PATCH'
      })

      toast.success("Match ended successfully")
      router.refresh()
    } catch (error) {
      console.error('Error ending match:', error)
      toast.error("Failed to end match")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Table {tableNumber}</span>
          {status === "IN_USE" && currentMatch && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleEndMatch}
              disabled={loading}
            >
              End Match
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {status === "IN_USE" && currentMatch ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{currentMatch.player1} vs {currentMatch.player2}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Started: {new Date(currentMatch.loginTime).toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              <span>Format: {currentMatch.format === 'PER_MINUTE' ? 'Per Minute' : 'Per Frame'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span>Payment: {currentMatch.paymentMethod}</span>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground">Available</div>
        )}
      </CardContent>
    </Card>
  )
} 