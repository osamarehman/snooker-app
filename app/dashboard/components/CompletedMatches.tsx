"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Layout, CreditCard, Tag, Calendar, CheckCircle2 } from "lucide-react"
import { getCompletedMatches } from "@/app/actions/matches"
import type { Match, IndexedDBMatch } from "@/types/database"
import { toast } from "sonner"
import { db } from "@/utils/indexedDB"
import { useOffline } from "@/hooks/useOffline"

const PRICE_PER_MINUTE = 20
const PRICE_PER_FRAME = 200

type FormattedMatch = Match & {
  tableNumber: number;
  initialPrice: number;
};

export default function CompletedMatches() {
  const [matches, setMatches] = useState<FormattedMatch[]>([])
  const [loading, setLoading] = useState(true)
  const { isOnline } = useOffline()

  const loadMatches = useCallback(async () => {
    try {
      setLoading(true)
      
      if (typeof window !== 'undefined') {
        if (isOnline) {
          const result = await getCompletedMatches()
          if (result?.success && result.data) {
            const formattedMatches = result.data.map((match: Match) => ({
              ...match,
              tableNumber: match.table.tableNumber,
              initialPrice: match.initialPrice || 0
            })) as FormattedMatch[]
            setMatches(formattedMatches)
            
            // Cache matches in IndexedDB
            try {
              await Promise.all(
                formattedMatches.map(match => db.upsert<IndexedDBMatch>('matches', {
                  ...match,
                  createdAt: match.createdAt.toISOString(),
                  updatedAt: match.updatedAt.toISOString(),
                  loginTime: match.loginTime.toISOString(),
                  logoutTime: match.logoutTime?.toISOString() ?? null,
                  table: {
                    ...match.table,
                    createdAt: match.table.createdAt.toISOString(),
                    updatedAt: match.table.updatedAt.toISOString()
                  }
                }))
              )
            } catch (error) {
              console.error('Failed to cache matches:', error)
            }
          } else {
            setMatches([])
          }
        } else {
          try {
            // Load from IndexedDB when offline
            const cachedMatches = await db.getAll<IndexedDBMatch>('matches')
            const completedMatches = cachedMatches.filter(m => m.status === 'COMPLETED')
            const formattedMatches = completedMatches.map(m => ({
              ...m,
              loginTime: new Date(m.loginTime),
              logoutTime: m.logoutTime ? new Date(m.logoutTime) : null,
              createdAt: new Date(m.createdAt),
              updatedAt: new Date(m.updatedAt),
              tableNumber: m.table.tableNumber,
              initialPrice: m.initialPrice || 0,
              table: {
                ...m.table,
                createdAt: new Date(m.table.createdAt),
                updatedAt: new Date(m.table.updatedAt)
              }
            })) as FormattedMatch[]
            setMatches(formattedMatches)
          } catch (error) {
            console.error('Failed to load from cache:', error)
            setMatches([])
          }
        }
      }
    } catch (error) {
      console.error('Error loading matches:', error)
      toast.error("Failed to load matches")
      setMatches([])
    } finally {
      setLoading(false)
    }
  }, [isOnline])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadMatches()
    }
  }, [loadMatches])

  function calculateDuration(login: Date, logout: Date): number {
    return Math.round((logout.getTime() - login.getTime()) / (1000 * 60))
  }

  function calculatePrice(match: FormattedMatch): number {
    if (match.format === 'PER_FRAME') {
      return (match.frames || 0) * PRICE_PER_FRAME
    } else {
      const duration = match.logoutTime 
        ? calculateDuration(match.loginTime, match.logoutTime)
        : 0
      return duration * PRICE_PER_MINUTE
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
    <div className="space-y-4">
      <AnimatePresence mode="sync">
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4"
          >
            <p className="font-medium">You&apos;re currently offline</p>
            <p className="text-sm">Showing cached completed matches</p>
          </motion.div>
        )}

        {matches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center justify-center p-8 space-y-4 bg-muted/20 rounded-lg"
          >
            <CheckCircle2 className="w-12 h-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-primary">No Completed Matches</h2>
            <p className="text-muted-foreground text-center">
              There are no completed matches to display.
            </p>
          </motion.div>
        ) : (
          matches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Table #{match.tableNumber}</span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      match.paymentStatus === 'PAID' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {match.paymentStatus === 'PAID' ? 'Paid' : 'Payment Pending'}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="font-medium text-foreground">{match.player1}</span>
                    <span>vs</span>
                    <span className="font-medium text-foreground">{match.player2}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Layout className="w-4 h-4" />
                    <span>Format: {match.format === 'PER_MINUTE' ? 'Per Minute' : 'Per Frame'}</span>
                  </div>

                  {match.format === 'PER_FRAME' && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Tag className="w-4 h-4" />
                      <span>Frames: {match.frames}</span>
                    </div>
                  )}

                  {match.logoutTime && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Duration: {calculateDuration(match.loginTime, match.logoutTime)} minutes</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CreditCard className="w-4 h-4" />
                    <span>Price: Rs {match.finalPrice || calculatePrice(match)}</span>
                  </div>

                  {match.hasDiscount && match.discount && (
                    <div className="flex items-center gap-2 text-green-600">
                      <Tag className="w-4 h-4" />
                      <span>Discount Applied: {match.discount}%</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  )
}
