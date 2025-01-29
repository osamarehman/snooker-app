"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Format, Payment, Status, PaymentStatus } from "@prisma/client"

interface CreateMatchData {
  tableId: string
  player1: string
  player2: string
  loginTime: Date
  logoutTime: Date | null
  format: Format
  frames?: number | null
  timeMinutes?: number | null
  initialPrice: number
  hasDiscount: boolean
  discount?: number | null
  finalPrice?: number | null
  paymentMethod: Payment
  status: Status
  paymentStatus?: PaymentStatus
}

export async function createMatch(payload: CreateMatchData) {
  try {
    const data = await prisma.match.create({
      data: {
        player1: payload.player1,
        player2: payload.player2,
        loginTime: payload.loginTime,
        logoutTime: payload.logoutTime,
        format: payload.format,
        frames: payload.frames,
        timeMinutes: payload.timeMinutes,
        initialPrice: payload.initialPrice,
        hasDiscount: payload.hasDiscount,
        discount: payload.discount,
        finalPrice: payload.finalPrice,
        paymentMethod: payload.paymentMethod,
        status: payload.status,
        paymentStatus: payload.paymentStatus || "PENDING",
        table: {
          connect: {
            id: payload.tableId
          }
        }
      },
    });

    revalidatePath("/")
    revalidatePath("/dashboard")
    return { success: true, data };
  } catch (error) {
    console.error('Server error:', error);
    return { success: false, error: 'Failed to create match' };
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
