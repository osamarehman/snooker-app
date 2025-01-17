"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/utils/supabase"
import { getOngoingMatches } from "@/app/actions/matches"
import type { Match } from "@/types/database"

export default function OngoingMatches() {
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
      const { error } = await supabase
        .from('Match')
        .update({ logout_time: new Date().toISOString() })
        .eq('id', matchId)

      if (error) throw error
      loadMatches() // Refresh the list
    } catch (error) {
      console.error('Error logging out match:', error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-4">
      {matches.length === 0 ? (
        <p className="text-center text-gray-500">No ongoing matches</p>
      ) : (
        matches.map((match) => (
          <Card key={match.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Table #{match.tableId}</h3>
                  <p>Players: {match.player1} vs {match.player2}</p>
                  <p>Format: {match.format === 'PER_MINUTE' ? 'Per Minute' : 'Per Frame'}</p>
                  {match.format === 'PER_FRAME' && match.frames && (
                    <p>Frames: {match.frames}</p>
                  )}
                </div>
                <div className="text-right">
                  <p>Started: {new Date(match.loginTime).toLocaleTimeString()}</p>
                  <p>Payment: {match.paymentMethod}</p>
                  {match.hasDiscount && <p>Discount: {match.discount}%</p>}
                  <Button 
                    onClick={() => handleLogout(match.id)}
                    className="mt-2"
                    variant="destructive"
                  >
                    Log Out
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
} 