"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Format, Payment, DueFees, Status } from "@prisma/client"

interface CreateMatchData {
  tableId: string
  player1: string
  player2: string
  loginTime: Date
  logoutTime: Date | null
  format: Format
  frames?: number | null
  totalTime?: number | null
  initialPrice: number
  hasDiscount: boolean
  discount?: number | null
  finalPrice?: number | null
  dueFees?: DueFees | null
  paymentMethod: Payment
  status: Status
}

export async function createMatch(data: CreateMatchData) {
  try {
    const match = await prisma.match.create({
      data
    })
    revalidatePath("/")
    return { success: true, data: match }
  } catch (error) {
    console.error("Failed to create match:", error)
    return { success: false, error: "Failed to create match" }
  }
}

export async function getTableMatches(tableId: string) {
  try {
    const matches = await prisma.match.findMany({
      where: {
        tableId,
        status: "ONGOING",
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    return { success: true, data: matches }
  } catch (error) {
    console.error("Failed to fetch matches:", error)
    return { success: false, error: "Failed to fetch matches" }
  }
}

export async function updateMatchStatus(matchId: string, status: Status, logoutTime?: Date) {
  try {
    const match = await prisma.match.update({
      where: { id: matchId },
      data: {
        status,
        logoutTime,
      },
    })
    revalidatePath("/")
    return { success: true, data: match }
  } catch (error) {
    console.error("Failed to update match:", error)
    return { success: false, error: "Failed to update match" }
  }
} 