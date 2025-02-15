"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Settings2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { Match } from "@/types/database"
import { toast } from "sonner"

interface EditMatchDialogProps {
  match: Match
  onUpdate: (matchId: string, updates: Partial<Match>) => Promise<void>
}

type MatchFormat = "PER_MINUTE" | "PER_FRAME"
type PaymentMethod = "CASH" | "CARD" | "ONLINE" | "CREDIT"

export function EditMatchDialog({ match, onUpdate }: EditMatchDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [format, setFormat] = useState<MatchFormat>(match.format as MatchFormat)
  const [frames, setFrames] = useState(match.frames?.toString() || "")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(match.paymentMethod as PaymentMethod)
  const [isUpdating, setIsUpdating] = useState(false)

  async function handleUpdate() {
    if (format === "PER_FRAME" && !frames) {
      toast.error("Please enter number of frames")
      return
    }

    setIsUpdating(true)
    try {
      await onUpdate(match.id, {
        format,
        frames: format === "PER_FRAME" ? parseInt(frames) : null,
        paymentMethod,
        updatedAt: new Date()
      })
      setIsOpen(false)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Match Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Format</Label>
            <Select value={format} onValueChange={(value: MatchFormat) => setFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PER_MINUTE">Per Minute</SelectItem>
                <SelectItem value="PER_FRAME">Per Frame</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {format === "PER_FRAME" && (
            <div className="space-y-2">
              <Label>Number of Frames</Label>
              <Input
                type="number"
                value={frames}
                onChange={(e) => setFrames(e.target.value)}
                min="1"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="CARD">Card</SelectItem>
                <SelectItem value="ONLINE">Online</SelectItem>
                <SelectItem value="CREDIT">Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 