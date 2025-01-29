"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Users, Layout, CreditCard, Tag } from "lucide-react"
import { getOngoingMatches } from "@/app/actions/matches"
import { updateMatchStatus } from "@/app/actions/match"
import type { Match } from "@/types/database"
import { useRouter } from "next/navigation"
// import type { Match } from '@/types/database'

// const supabase = createClientComponentClient<Match>()

export default function OngoingMatches() {
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMatches()
  }, [])

  async function loadMatches() {
    try {
      const data = await getOngoingMatches()
      setMatches(data)
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout(matchId: string) {
    try {
      await updateMatchStatus(matchId, "COMPLETED", new Date())
      await loadMatches()
      // Refresh the home page to show the available table
      router.refresh()
    } catch (error) {
      console.error('Error updating match status:', error)
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
    );
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
          <Layout className="w-12 h-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-primary">No Ongoing Matches</h2>
          <p className="text-muted-foreground text-center">
            There are currently no active matches in progress.
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
              <Card className="overflow-hidden hover:shadow-lg transition-all">
                <CardHeader className="bg-muted/50">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-primary">Table #{match.tableId}</span>
                    <Button 
                      onClick={() => handleLogout(match.id)}
                      variant="destructive"
                      size="sm"
                      className="hover:scale-105 transition-transform"
                    >
                      Log Out
                    </Button>
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
                      <Clock className="w-4 h-4" />
                      <span>Started: {new Date(match.loginTime).toLocaleTimeString()}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CreditCard className="w-4 h-4" />
                      <span>Payment: {match.paymentMethod}</span>
                    </div>

                    {match.hasDiscount && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Tag className="w-4 h-4" />
                        <span>Discount: {match.discount}%</span>
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
