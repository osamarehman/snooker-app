"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { createMatch } from "@/app/actions/match"
import { toast } from "sonner"
import { getTableById } from "@/app/actions/table"
import { offlineSync } from '@/utils/offlineSync'
import { db } from '@/utils/indexedDB'
import type { IndexedDBMatch } from "@/types/database"

interface TableCardProps {
  tableNumber: number
  onMatchCreated?: () => void
}

type Format = "PER_MINUTE" | "PER_FRAME"
type Payment = "CASH" | "ONLINE" | "CREDIT"
type Status = "ONGOING" | "COMPLETED" | "PENDING_PAYMENT"
type DueFees = "PLAYER1" | "PLAYER2" | null

interface TableState {
  player1: string
  player2: string
  loginTime: Date | null
  logoutTime: Date | null
  format: Format
  frames: number | null
  totalTime: number | null
  initialPrice: number
  hasDiscount: boolean
  discount: number | null
  finalPrice: number | null
  tableNumber: number
  dueFees: DueFees
  paymentMethod: Payment | null
  status: Status
  matchId: string | null
  matchCreated: boolean
  createdAt?: string
  updatedAt?: string
}

const PRICE_PER_MINUTE = 10
const PRICE_PER_FRAME = 100

export function TableCard({ tableNumber, onMatchCreated }: TableCardProps) {
  const [state, setState] = useState<TableState>({
    player1: "",
    player2: "",
    loginTime: null,
    logoutTime: null,
    format: "PER_MINUTE",
    frames: null,
    totalTime: null,
    initialPrice: 0,
    hasDiscount: false,
    discount: null,
    finalPrice: null,
    dueFees: null,
    paymentMethod: null,
    status: "COMPLETED", // Initial state is COMPLETED (table available)
    matchId: null,
    tableNumber: tableNumber,
    matchCreated: false,
  })

  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)
  const [tableId, setTableId] = useState<string | null>(null)

  // Fetch table ID on mount
  useEffect(() => {
    async function fetchTableId() {
      const result = await getTableById(tableNumber)
      if (result.success && result.data) {
        setTableId(result.data.id)
      }
    }
    fetchTableId()
  }, [tableNumber])

  // Handle logout
  const handleLogout = async () => {
    try {
      if (!state.matchId) return

      // Stop the timer if running
      if (timer) {
        clearInterval(timer)
        setTimer(null)
      }

      const logoutTime = new Date()
      const newStatus = state.paymentMethod === "CREDIT" ? "PENDING_PAYMENT" : "COMPLETED"
      
      // Update local state immediately
      setState(prev => ({
        ...prev,
        logoutTime,
        status: newStatus
      }))

      // Queue the logout action for sync
      await offlineSync.queueAction({
        type: 'UPDATE_MATCH',
        payload: {
          id: state.matchId,
          logoutTime: logoutTime.toISOString(),
          status: newStatus,
          paymentStatus: state.paymentMethod === "CREDIT" ? "PENDING" : "PAID"
        },
        endpoint: `/api/matches/${state.matchId}`,
        method: 'PATCH'
      })

      toast.success("Match completed successfully")
      onMatchCreated?.() // Refresh table status
    } catch (error) {
      console.error('Failed to logout match:', error)
      toast.error("Failed to complete match")
      
      // Revert local state on error
      setState(prev => ({
        ...prev,
        logoutTime: null,
        status: "ONGOING"
      }))
    }
  }

  // Handle format change
  const handleFormatChange = (format: Format) => {
    setState(prev => ({
      ...prev,
      format,
      frames: null,
      totalTime: null,
      initialPrice: 0,
      finalPrice: null,
    }))
  }

  // Handle frames change
  const handleFramesChange = (frames: string) => {
    const frameCount = parseInt(frames)
    const initialPrice = frameCount * PRICE_PER_FRAME
    const finalPrice = state.hasDiscount && state.discount 
      ? initialPrice * (1 - state.discount / 100)
      : initialPrice

    setState(prev => ({
      ...prev,
      frames: frameCount,
      initialPrice,
      finalPrice,
    }))
  }

  // Handle discount change
  const handleDiscountChange = (value: string) => {
    const discount = parseFloat(value)
    const finalPrice = state.initialPrice * (1 - discount / 100)

    setState(prev => ({
      ...prev,
      discount,
      finalPrice,
    }))
  }

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timer) {
        clearInterval(timer)
      }
    }
  }, [timer])

  const handleCreateMatch = async () => {
    try {
      if (!tableId) {
        toast.error("Table ID not found")
        return
      }

      const matchData = {
        tableId,
        player1: state.player1,
        player2: state.player2,
        loginTime: new Date().toISOString(),
        format: state.format,
        status: "ONGOING",
        paymentStatus: "PENDING",
        paymentMethod: state.paymentMethod || "CASH",
        hasDiscount: false,
        initialPrice: state.initialPrice,
        finalPrice: state.finalPrice,
        frames: state.frames,
        timeMinutes: state.totalTime
      }

      // Generate a temporary ID for offline use
      const tempId = crypto.randomUUID()

      // Update local state immediately
      setState(prev => ({
        ...prev,
        matchCreated: true,
        status: "ONGOING",
        matchId: tempId
      }))

      if (navigator.onLine) {
        // If online, create match directly
        const result = await createMatch(matchData)
        if (!result.success) {
          throw new Error(result.error)
        }
        
        // Update the matchId in state with the real one from server
        if (result.success && result.data?.id) {
          setState(prev => ({
            ...prev,
            matchId: result.data.id
          }))
        }
      } else {
        // If offline, queue the action
        await offlineSync.queueAction({
          type: 'CREATE_MATCH',
          payload: {
            ...matchData,
            id: tempId
          },
          endpoint: '/api/matches/create',
          method: 'POST'
        })
      }

      // Add to IndexedDB
      const indexedDBMatch: IndexedDBMatch = {
        id: tempId,
        tableId: tableId,
        player1: state.player1,
        player2: state.player2,
        loginTime: new Date().toISOString(),
        logoutTime: null,
        format: state.format,
        status: "ONGOING",
        paymentStatus: "PENDING",
        paymentMethod: state.paymentMethod || "CASH",
        hasDiscount: false,
        initialPrice: state.initialPrice,
        finalPrice: state.finalPrice,
        frames: state.frames,
        timeMinutes: state.totalTime,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        table: {
          id: tableId,
          tableNumber: tableNumber,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        discount: null
      }
      await db.upsert('matches', indexedDBMatch)

      toast.success("Match created successfully")
      onMatchCreated?.()
    } catch (error) {
      console.error('Failed to create match:', error)
      toast.error("Failed to create match")
      
      // Revert local state on error
      setState(prev => ({
        ...prev,
        matchCreated: false,
        status: "COMPLETED",
        matchId: null
      }))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full border-2 border-primary/10 rounded-lg shadow-lg bg-card hover:border-primary/20 transition-colors">
        <CardHeader className="bg-muted/50 rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-primary">
            Table #{tableNumber}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.status === "COMPLETED" ? (
            <>
              {/* Player Names */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div className="space-y-2">
                  <Label className="text-muted-foreground">Player 1</Label>
                  <Input
                    placeholder="Enter name"
                    value={state.player1}
                    onChange={e => setState(prev => ({ ...prev, player1: e.target.value }))}
                  />
                </motion.div>
                <motion.div className="space-y-2">
                  <Label className="text-muted-foreground">Player 2</Label>
                  <Input
                    placeholder="Enter name"
                    value={state.player2}
                    onChange={e => setState(prev => ({ ...prev, player2: e.target.value }))}
                  />
                </motion.div>
              </div>

              {/* Format Selection */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Format</Label>
                <div className="flex gap-2">
                  <Button
                    variant={state.format === "PER_MINUTE" ? "default" : "outline"}
                    onClick={() => handleFormatChange("PER_MINUTE")}
                  >
                    Per Minute (Rs. {PRICE_PER_MINUTE}/min)
                  </Button>
                  <Button
                    variant={state.format === "PER_FRAME" ? "default" : "outline"}
                    onClick={() => handleFormatChange("PER_FRAME")}
                  >
                    Per Frame (Rs. {PRICE_PER_FRAME}/frame)
                  </Button>
                </div>
              </div>

              {/* Frames Input (only for PER_FRAME) */}
              {state.format === "PER_FRAME" && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Number of Frames</Label>
                  <Input
                    type="number"
                    min="1"
                    value={state.frames || ""}
                    onChange={e => handleFramesChange(e.target.value)}
                  />
                </div>
              )}

              {/* Discount */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-muted-foreground">Apply Discount</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    disabled={!state.hasDiscount}
                    value={state.discount || ""}
                    onChange={e => handleDiscountChange(e.target.value)}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
              </div>

              {/* Create Match Button */}
              <Button 
                className="w-full bg-primary hover:bg-primary/90" 
                onClick={handleCreateMatch}
                disabled={!state.player1 || !state.player2}
              >
                Start Match
              </Button>
            </>
          ) : (
            <>
              <div className="text-center py-4 text-muted-foreground">
                Match in progress...
              </div>
              <Button 
                variant="destructive"
                className="w-full" 
                onClick={handleLogout}
              >
                End Match
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
