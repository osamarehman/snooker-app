"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { getCompletedMatches } from "@/app/actions/matches"
import type { Match } from "@/types/database"

export default function CompletedMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMatches()
  }, [])

  async function loadMatches() {
    try {
      const data = await getCompletedMatches()
      setMatches(data)
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setLoading(false)
    }
  }

  function calculateDuration(login: string, logout: string) {
    const start = new Date(login)
    const end = new Date(logout)
    const diff = Math.floor((end.getTime() - start.getTime()) / 1000 / 60) // in minutes
    return `${diff} minutes`
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-4">
      {matches.length === 0 ? (
        <p className="text-center text-gray-500">No completed matches</p>
      ) : (
        matches.map((match) => (
          <Card key={match.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Table #{match.tableId}</h3>
                  <p>Players: {match.player1} vs {match.player2}</p>
                  <p>Format: {match.format === 'PER_MINUTE' ? 'Per Minute' : 'Per Frame'}</p>
                  {match.format === 'PER_FRAME' ? (
                    <p>Frames: {match.frames}</p>
                  ) : (
                    <p>Duration: {match.logoutTime && 
                      calculateDuration(match.loginTime, match.logoutTime)}</p>
                  )}
                </div>
                <div className="text-right">
                  <p>Date: {new Date(match.createdAt).toLocaleDateString()}</p>
                  <p>Payment: {match.paymentMethod}</p>
                  {match.hasDiscount && <p>Discount: {match.discount}%</p>}
                  <p className="font-medium text-green-600">
                    Final Price: Rs {match.finalPrice || match.initialPrice}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
} 