"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {  Users, Layout, CreditCard, Tag, Calendar, CheckCircle2, AlertCircle } from "lucide-react"
import { getCompletedMatches } from "@/app/actions/matches"
import type { Match } from "@/types/database"

const PRICE_PER_MINUTE = 10
const PRICE_PER_FRAME = 400

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
          <CheckCircle2 className="w-12 h-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-primary">No Completed Matches</h2>
          <p className="text-muted-foreground text-center">
            There are no completed matches in the history yet.
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
              <Card className={`overflow-hidden hover:shadow-lg transition-all ${
                match.paymentStatus === 'PENDING' ? 'border-yellow-200' : 'border-green-200'
              }`}>
                <CardHeader className={`${
                  match.paymentStatus === 'PENDING' ? 'bg-yellow-50/50' : 'bg-green-50/50'
                }`}>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-primary">Table #{match.tableId}</span>
                    <div className="flex items-center gap-2">
                      {match.paymentStatus === 'PENDING' ? (
                        <div className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-full">
                          <AlertCircle className="w-4 h-4" />
                          Payment Pending
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
                          <CheckCircle2 className="w-4 h-4" />
                          Paid
                        </div>
                      )}
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
                      {match.format === 'PER_FRAME' ? (
                        <span className="text-foreground">({match.frames} frames)</span>
                      ) : (
                        match.logoutTime && (
                          <span className="text-foreground">
                            ({calculateDuration(String(match.loginTime), String(match.logoutTime))} minutes)
                          </span>
                        )
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Date: {new Date(match.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CreditCard className="w-4 h-4" />
                      <span>Payment Method: {match.paymentMethod}</span>
                    </div>

                    {match.hasDiscount && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Tag className="w-4 h-4" />
                        <span>Discount: {match.discount}%</span>
                      </div>
                    )}

                    <div className={`flex items-center gap-2 mt-2 p-2 rounded-lg ${
                      match.paymentStatus === 'PENDING' ? 'bg-yellow-50' : 'bg-green-50'
                    }`}>
                      <span className={`text-lg font-semibold ${
                        match.paymentStatus === 'PENDING' ? 'text-yellow-700' : 'text-green-700'
                      }`}>
                        Rs {calculatePrice(match).toFixed(2)}
                      </span>
                    </div>
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
