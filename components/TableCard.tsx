"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AuthError } from '@supabase/supabase-js'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { createMatch, updateMatchStatus } from "@/app/actions/match"
import { toast } from "sonner"
import { getTableById } from "@/app/actions/table"

interface TableCardProps {
  tableNumber: number
}

type Format = "PER_MINUTE" | "PER_FRAME"
type Payment = "CASH" | "ONLINE" | "CREDIT"
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
  dueFees: DueFees
  paymentMethod: Payment | null
  status: "ONGOING" | "COMPLETED" | "PENDING_PAYMENT"
  matchId: string | null
}

const PRICE_PER_MINUTE = 10
const PRICE_PER_FRAME = 400

export function TableCard({ tableNumber }: TableCardProps) {
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
    status: "COMPLETED",
    matchId: null,
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

  // Handle login
  const handleLogin = () => {
    if (!state.player1 || !state.player2) {
      alert("Please enter both player names")
      return
    }

    setState(prev => ({
      ...prev,
      loginTime: new Date(),
      status: "ONGOING",
    }))

    // Start timer if format is PER_MINUTE
    if (state.format === "PER_MINUTE") {
      const interval = setInterval(() => {
        setState(prev => {
          if (!prev.loginTime) return prev
          const totalMinutes = Math.floor(
            (new Date().getTime() - prev.loginTime.getTime()) / 60000
          )
          const initialPrice = totalMinutes * PRICE_PER_MINUTE
          const finalPrice = prev.hasDiscount && prev.discount 
            ? initialPrice * (1 - prev.discount / 100)
            : initialPrice

          return {
            ...prev,
            totalTime: totalMinutes,
            initialPrice,
            finalPrice,
          }
        })
      }, 60000) // Update every minute
      setTimer(interval)
    }
  }

  // Handle logout
  const handleLogout = async () => {
    if (timer) {
      clearInterval(timer)
      setTimer(null)
    }

    if (state.matchId) {
      const newStatus = state.paymentMethod === "CREDIT" ? "PENDING_PAYMENT" : "COMPLETED"
      const result = await updateMatchStatus(state.matchId, newStatus as Status, new Date())
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          logoutTime: new Date(),
          status: newStatus,
        }))
        toast.success("Match logged out successfully")
      } else {
        toast.error("Failed to update match status")
      }
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Table #{tableNumber}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Player Names */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Player 1</Label>
            <Input
              placeholder="Enter name"
              value={state.player1}
              onChange={e => setState(prev => ({ ...prev, player1: e.target.value }))}
              disabled={state.status === "ONGOING"}
            />
          </div>
          <div className="space-y-2">
            <Label>Player 2</Label>
            <Input
              placeholder="Enter name"
              value={state.player2}
              onChange={e => setState(prev => ({ ...prev, player2: e.target.value }))}
              disabled={state.status === "ONGOING"}
            />
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <Label>Format</Label>
          <Select
            value={state.format}
            onValueChange={value => handleFormatChange(value as Format)}
            disabled={state.status === "ONGOING"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PER_MINUTE">Per Minute (₹10/min)</SelectItem>
              <SelectItem value="PER_FRAME">Per Frame (₹400/frame)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Frames Input (only for PER_FRAME) */}
        {state.format === "PER_FRAME" && (
          <div className="space-y-2">
            <Label>Number of Frames</Label>
            <Select
              value={state.frames?.toString() || ""}
              onValueChange={handleFramesChange}
              disabled={state.status === "ONGOING"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frames" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map(n => (
                  <SelectItem key={n} value={n.toString()}>
                    {n} {n === 1 ? "Frame" : "Frames"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Time and Price Information */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Login Time:</span>
            <span>{state.loginTime?.toLocaleTimeString() || "Not started"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Total Time:</span>
            <span>{state.totalTime ? `${state.totalTime} minutes` : "0 minutes"}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span>Initial Price:</span>
            <span>₹{state.initialPrice}</span>
          </div>
        </div>

        {/* Discount Section */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={state.hasDiscount}
              onCheckedChange={(checked) => 
                setState(prev => ({ ...prev, hasDiscount: checked as boolean }))
              }
              disabled={state.status === "COMPLETED"}
            />
            <Label>Apply Discount</Label>
          </div>
          {state.hasDiscount && (
            <div className="space-y-2">
              <Input
                type="number"
                placeholder="Discount %"
                value={state.discount || ""}
                onChange={e => handleDiscountChange(e.target.value)}
                disabled={state.status === "COMPLETED"}
              />
              <div className="flex justify-between text-sm font-medium">
                <span>Final Price:</span>
                <span>₹{state.finalPrice || state.initialPrice}</span>
              </div>
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div className="space-y-2">
          <Label>Payment Method</Label>
          <Select
            value={state.paymentMethod || ""}
            onValueChange={value => 
              setState(prev => ({ ...prev, paymentMethod: value as Payment }))
            }
            disabled={state.status === "COMPLETED"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="ONLINE">Online</SelectItem>
              <SelectItem value="CREDIT">Credit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Due Fees */}
        {state.paymentMethod === "CREDIT" && (
          <div className="space-y-2">
            <Label>Due Fees (Loser)</Label>
            <Select
              value={state.dueFees || ""}
              onValueChange={value => 
                setState(prev => ({ ...prev, dueFees: value as DueFees }))
              }
              disabled={state.status === "COMPLETED"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select player" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PLAYER1">{state.player1 || "Player 1"}</SelectItem>
                <SelectItem value="PLAYER2">{state.player2 || "Player 2"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {state.status === "COMPLETED" && (
            <Button 
              className="flex-1" 
              onClick={handleLogin}
              disabled={!state.player1 || !state.player2}
            >
              Log In
            </Button>
          )}
          {state.status === "ONGOING" && (
            <Button 
              className="flex-1" 
              onClick={handleLogout}
              variant="destructive"
            >
              Log Out
            </Button>
          )}
          {(state.status === "ONGOING" || state.status === "PENDING_PAYMENT") && (
            <Button 
              className="flex-1"
              onClick={async () => {
                if (!tableId) {
                  toast.error("Table not found")
                  return
                }

                try {
                  const matchData = {
                    tableId,
                    player1: state.player1,
                    player2: state.player2,
                    loginTime: state.loginTime!,
                    logoutTime: state.logoutTime,
                    format: state.format as Format,
                    frames: state.frames,
                    totalTime: state.totalTime,
                    initialPrice: state.initialPrice,
                    hasDiscount: state.hasDiscount,
                    discount: state.discount,
                    finalPrice: state.finalPrice ?? state.initialPrice,
                    dueFees: state.dueFees,
                    paymentMethod: state.paymentMethod! as Payment,
                    status: "ONGOING" as Status,
                  }

                  const result = await createMatch(matchData)
                  
                  if (result.success && result.data) {
                    toast.success("Match data saved successfully")
                    setState(prev => ({
                      ...prev,
                      matchId: result.data.id,
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
                      status: "COMPLETED",
                    }))
                  } else {
                    throw new Error(result.error)
                  }
                  // eslint-expect-error-next-line
                } catch (error: unknown) {
                    if (error instanceof AuthError)
                    {
                        console.error("Error details:", error)
                        toast.error(error.message)
                        
                    } else {
                        toast.error("Failed to save match data")
                    }
                }
              }}
            >
              New Entry
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 