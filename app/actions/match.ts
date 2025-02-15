"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Format, Payment, Status, PaymentStatus } from "@prisma/client"

interface CreateMatchInput {
  tableId: string
  player1: string
  player2: string
  loginTime: string
  format: string
  status: string
  paymentStatus: string
  paymentMethod: string
  hasDiscount: boolean
  initialPrice?: number
  finalPrice?: number | null
  frames?: number | null
  timeMinutes?: number | null
}

export async function createMatch(data: CreateMatchInput) {
  try {
    const match = await prisma.match.create({
      data: {
        loginTime: new Date(data.loginTime),
        initialPrice: data.initialPrice || 0,
        finalPrice: data.finalPrice || null,
        frames: data.frames || null,
        timeMinutes: data.timeMinutes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        player1: data.player1,
        player2: data.player2,
        format: data.format as Format,
        status: data.status as Status,
        paymentStatus: data.paymentStatus as PaymentStatus,
        paymentMethod: data.paymentMethod as Payment,
        hasDiscount: data.hasDiscount,
        table: {
          connect: {
            id: data.tableId
          }
        }
      },
      include: {
        table: true
      }
    })

    revalidatePath('/')
    revalidatePath('/dashboard')
    
    return { success: true, data: match }
  } catch (error) {
    console.error('Failed to create match:', error)
    return { success: false, error: 'Failed to create match' }
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
    });
    return { success: true, data: matches };
  } catch (error) {
    console.error("Failed to fetch matches:", error);
    return { success: false, error: "Failed to fetch matches" };
  }
}

export async function updateMatchStatus(
  matchId: string, 
  status: Status, 
  logoutTime?: Date,
  paymentStatus?: PaymentStatus
) {
  try {
    const match = await prisma.match.update({
      where: { id: matchId },
      data: {
        status,
        logoutTime,
        paymentStatus: paymentStatus || undefined,
      },
    });
    revalidatePath("/")
    revalidatePath("/dashboard")
    return { success: true, data: match };
  } catch (error) {
    console.error("Failed to update match:", error);
    return { success: false, error: "Failed to update match" };
  }
}
