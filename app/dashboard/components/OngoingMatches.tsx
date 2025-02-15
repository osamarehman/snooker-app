"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Layout, CreditCard, Tag, Calendar, Clock, Loader2 } from "lucide-react"
import { getOngoingMatches } from "@/app/actions/matches"
import type { Match } from "@/types/database"
import { toast } from "sonner"
import { offlineSync } from "@/utils/offlineSync"
import { db } from "@/utils/indexedDB"
import { EditMatchDialog } from "./EditMatchDialog"
import type { IndexedDBMatch } from "@/types/database"
// import type { ApiResponse } from "@/types"

type FormattedMatch = Match & {
  tableNumber: number;
}

export default function OngoingMatches() {
  const [matches, setMatches] = useState<FormattedMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    loadMatches()
  }, [])

  async function loadMatches() {
    try {
      const result = await getOngoingMatches()
      if (result?.success && result.data) {
        const formattedMatches = result.data.map((match: Match) => ({
          ...match,
          tableNumber: match.table.tableNumber,
          initialPrice: match.initialPrice || 0
        })) as FormattedMatch[]
        setMatches(formattedMatches)
      }
    } catch (error) {
      console.error('Error loading matches:', error)
      toast.error("Failed to load matches")
    } finally {
      setLoading(false)
    }
  }

  function calculateDuration(login: Date) {
    const now = new Date()
    const diff = Math.floor((now.getTime() - login.getTime()) / 1000 / 60) // in minutes
    return diff
  }

  function formatLocalTime(date: Date) {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  async function handleEndMatch(matchId: string) {
    try {
      setUpdating(matchId)
      
      const logoutTime = new Date()

      // Update local state immediately
      setMatches(prev => prev.filter(m => m.id !== matchId))

      // Queue the update action for sync
      await offlineSync.queueAction({
        type: 'UPDATE_MATCH',
        payload: {
          id: matchId,
          status: "COMPLETED",
          logoutTime: logoutTime.toISOString()
        },
        endpoint: `/api/matches/${matchId}`,
        method: 'PATCH'
      })

      // Update IndexedDB
      const existingMatch = await db.getById('matches', matchId)
      if (existingMatch) {
        await db.upsert('matches', {
          ...existingMatch,
          status: "COMPLETED",
          logoutTime: logoutTime.toISOString(),
          updatedAt: new Date().toISOString()
        })
      }

      toast.success("Match ended successfully")
    } catch (error) {
      console.error('Error ending match:', error)
      toast.error("Failed to end match")
      
      // Revert local state on error
      loadMatches()
    } finally {
      setUpdating(null)
    }
  }

  async function handleUpdateMatch(matchId: string, updates: Partial<Match>) {
    try {
      // Update local state immediately
      setMatches(prev => prev.map(match => 
        match.id === matchId ? { ...match, ...updates } : match
      ))

      // Queue the update action for sync
      await offlineSync.queueAction({
        type: 'UPDATE_MATCH',
        payload: {
          id: matchId,
          ...updates
        },
        endpoint: `/api/matches/${matchId}`,
        method: 'PATCH'
      })

      // Update IndexedDB
      const existingMatch = await db.getById('matches', matchId) as IndexedDBMatch | undefined
      if (existingMatch) {
        const updatedMatch: IndexedDBMatch = {
          ...existingMatch,
          ...updates,
          updatedAt: new Date().toISOString(),
          createdAt: existingMatch.createdAt.toString(),
          loginTime: existingMatch.loginTime.toString(),
          logoutTime: existingMatch.logoutTime?.toString() || null,
          table: {
            ...existingMatch.table,
            createdAt: existingMatch.table.createdAt.toString(),
            updatedAt: existingMatch.table.updatedAt.toString()
          }
        }
        await db.upsert('matches', updatedMatch)
      }

      toast.success("Match updated successfully")
    } catch (error) {
      console.error('Error updating match:', error)
      toast.error("Failed to update match")
      
      // Revert local state on error
      loadMatches()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="w-12 h-12 border-4 border-primary rounded-full border-t-transparent animate-spin"
        />
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {matches.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="flex flex-col items-center justify-center p-8 space-y-4 bg-muted/20 rounded-lg"
        >
          <Clock className="w-12 h-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-primary">No Ongoing Matches</h2>
          <p className="text-muted-foreground text-center">
            There are no matches in progress at the moment.
          </p>
        </motion.div>
      ) : (
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {matches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-all border-green-200">
                <CardHeader className="bg-green-50/50">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-primary">Table #{match.tableNumber}</span>
                      <span className="text-sm text-muted-foreground">
                        Started at {formatLocalTime(new Date(match.loginTime))}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
                        <Clock className="w-4 h-4" />
                        In Progress
                      </div>
                      <EditMatchDialog 
                        match={match}
                        onUpdate={handleUpdateMatch}
                      />
                      <Button 
                        onClick={() => handleEndMatch(match.id)}
                        variant="destructive"
                        size="sm"
                        disabled={updating === match.id}
                      >
                        {updating === match.id ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Ending...</span>
                          </div>
                        ) : (
                          'End Match'
                        )}
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span className="font-medium text-foreground">{match.player1}</span>
                      <span>vs</span>
                      <span className="font-medium text-foreground">{match.player2}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Layout className="w-4 h-4" />
                      <span>Format: {match.format === 'PER_MINUTE' ? 'Per Minute' : 'Per Frame'}</span>
                      {match.format === 'PER_FRAME' && match.frames && (
                        <span className="text-foreground">({match.frames} frames)</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Duration: {calculateDuration(match.loginTime)} minutes</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CreditCard className="w-4 h-4" />
                      <span>Payment Method: {match.paymentMethod}</span>
                    </div>

                    {match.hasDiscount && match.discount && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Tag className="w-4 h-4" />
                        <span>Discount Applied: {match.discount}%</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
} 