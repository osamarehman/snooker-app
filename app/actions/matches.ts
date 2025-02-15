"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { Match, Table, Format, Status, PaymentStatus, PaymentMethod } from "@/types/database"

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
}

type MatchWithTable = Match & {
  table: Table;
}

export async function getOngoingMatches(): Promise<ApiResponse<MatchWithTable[]>> {
  try {
    const matches = await prisma.match.findMany({
      where: {
        status: 'ONGOING'
      },
      include: {
        table: true
      },
      orderBy: {
        loginTime: 'desc'
      }
    })

    return {
      success: true,
      data: matches
    }
  } catch (error) {
    console.error('Error fetching ongoing matches:', error)
    return {
      success: false,
      error: 'Failed to fetch ongoing matches'
    }
  }
}

type OutstandingMatch = MatchWithTable & {
  tableNumber: number;
  timeMinutes: number;
}

export async function getOutstandingPayments(): Promise<OutstandingMatch[]> {
  try {
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { status: "PENDING_PAYMENT" },
          { status: "COMPLETED", paymentStatus: "PENDING" }
        ]
      },
      include: {
        table: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return matches.map((match: MatchWithTable) => {
      const timeMinutes = match.logoutTime 
        ? Math.round((match.logoutTime.getTime() - match.loginTime.getTime()) / (1000 * 60))
        : Math.round((new Date().getTime() - match.loginTime.getTime()) / (1000 * 60));

      return {
        ...match,
        tableNumber: match.table.tableNumber,
        timeMinutes,
      }
    })
  } catch (error) {
    console.error("Failed to fetch outstanding payments:", error)
    throw error
  }
}

export async function getCompletedMatches(): Promise<ApiResponse<MatchWithTable[]>> {
  try {
    const matches = await prisma.match.findMany({
      where: {
        status: 'COMPLETED'
      },
      include: {
        table: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // findMany always returns an array, even if empty
    return {
      success: true,
      data: matches || []
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch completed matches'
    console.error('Error fetching completed matches:', errorMessage)
    return {
      success: false,
      error: errorMessage
    }
  }
}

export async function updatePaymentStatus(matchId: string): Promise<ApiResponse<Match>> {
  try {
    const match = await prisma.match.update({
      where: { id: matchId },
      data: {
        status: "COMPLETED" as Status,
        paymentStatus: "PAID" as PaymentStatus,
        updatedAt: new Date()
      },
      include: {
        table: true
      }
    })
    revalidatePath("/dashboard")
    return { success: true, data: match }
  } catch (error) {
    console.error("Failed to update payment status:", error)
    return {
      success: false,
      error: "Failed to update payment status"
    }
  }
}

type CreateMatchInput = {
  tableId: string;
  player1: string;
  player2: string;
  loginTime: string;
  format: Format;
  status: Status;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  hasDiscount: boolean;
  initialPrice: number;
  finalPrice: number | null;
  frames: number | null;
  timeMinutes: number | null;
  table?: Table;
}

export async function createMatch(matchData: CreateMatchInput): Promise<ApiResponse<MatchWithTable>> {
  try {
    // eslint-disable-line react-hooks/exhaustive-deps
    const { table: __unusedTable, ...createData } = matchData

    console.log(__unusedTable)

    const match = await prisma.match.create({
      data: createData,
      include: {
        table: true
      }
    })

    revalidatePath("/dashboard")
    
    return {
      success: true,
      data: match
    }
  } catch (error) {
    console.error("Error creating match:", error)
    return {
      success: false,
      error: "Failed to create match"
    }
  }
}
