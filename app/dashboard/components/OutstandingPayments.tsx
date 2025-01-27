"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getOutstandingPayments, updatePaymentStatus } from "@/app/actions/matches"
import type { Match } from "@/types/database"

const PRICE_PER_MINUTE = 10
const PRICE_PER_FRAME = 400

export default function OutstandingPayments() {
  const [payments, setPayments] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    loadPayments()
  }, [])

  async function loadPayments() {
    try {
      const data = await getOutstandingPayments()
      setPayments(data)
    } catch (error) {
      console.error('Error loading payments:', error)
    } finally {
      setLoading(false)
    }
  }

  function calculateDuration(login: string, logout: string) {
    const start = new Date(login)
    const end = new Date(logout)
    const diff = Math.floor((end.getTime() - start.getTime()) / 1000 / 60) // in minutes
    return diff
  }

  function calculatePrice(match: Match): number {
    if (match.format === 'PER_FRAME' && match.frames) {
      const basePrice = match.frames * PRICE_PER_FRAME
      return match.hasDiscount && match.discount 
        ? basePrice * (1 - match.discount / 100)
        : basePrice
    }

    if (match.format === 'PER_MINUTE' && match.logoutTime) {
      const minutes = calculateDuration(String(match.loginTime), String(match.logoutTime))
      const basePrice = minutes * PRICE_PER_MINUTE
      return match.hasDiscount && match.discount 
        ? basePrice * (1 - match.discount / 100)
        : basePrice
    }

    return 0
  }

  async function handleMarkAsPaid(matchId: string) {
    try {
      setUpdating(matchId)
      await updatePaymentStatus(matchId)
      await loadPayments() // Refresh the list
    } catch (error) {
      console.error('Error updating payment status:', error)
    } finally {
      setUpdating(null)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-4">
      {payments.length === 0 ? (
        <p className="text-center text-gray-500">No outstanding payments</p>
      ) : (
        payments.map((match) => (
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
                      `${calculateDuration(String(match.loginTime), String(match.logoutTime))} minutes`}</p>
                  )}
                  <p className="font-medium text-red-600">
                    Amount Due: Rs {calculatePrice(match).toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p>Date: {new Date(match.createdAt).toLocaleDateString()}</p>
                  <p>Payment Method: {match.paymentMethod}</p>
                  {match.hasDiscount && <p>Discount Applied: {match.discount}%</p>}
                  <Button 
                    onClick={() => handleMarkAsPaid(match.id)}
                    className="mt-2"
                    variant="default"
                    disabled={updating === match.id}
                  >
                    {updating === match.id ? 'Updating...' : 'Mark as Paid'}
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