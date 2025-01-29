"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
// import type { Match, PaymentStatus } from "@/types/database"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { Match, PaymentStatus } from "@/types/database"

export async function getOngoingMatches(): Promise<Match[]> {
  try {
    const matches = await prisma.match.findMany({
      where: {
        status: "ONGOING"
      },
      include: {
        table: true
      },
      orderBy: {
        loginTime: 'desc'
      }
    })

    return matches.map((match) => {
      // Calculate timeMinutes based on login and logout times
      const timeMinutes = match.logoutTime 
        ? Math.round((match.logoutTime.getTime() - match.loginTime.getTime()) / (1000 * 60))
        : Math.round((new Date().getTime() - match.loginTime.getTime()) / (1000 * 60));

      return {
        ...match,
        tableNumber: match.table.tableNumber,
        timeMinutes,
        loginTime: match.loginTime.toISOString(),
        logoutTime: match.logoutTime?.toISOString() || null,
        createdAt: match.createdAt.toISOString(),
        updatedAt: match.updatedAt.toISOString(),
        paymentStatus: match.paymentStatus,
      } as Match
    })
  } catch (error) {
    console.error("Failed to fetch ongoing matches:", error)
    throw error
  }
}

export async function getOutstandingPayments(): Promise<Match[]> {
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

    return matches.map(match => {
      const timeMinutes = match.logoutTime 
        ? Math.round((match.logoutTime.getTime() - match.loginTime.getTime()) / (1000 * 60))
        : Math.round((new Date().getTime() - match.loginTime.getTime()) / (1000 * 60));

      return {
        ...match,
        tableNumber: match.table.tableNumber,
        timeMinutes,
      } as Match
    })
  } catch (error) {
    console.error("Failed to fetch outstanding payments:", error)
    throw error
  }
}

export async function getCompletedMatches(): Promise<Match[]> {
  try {
    const matches = await prisma.match.findMany({
      where: {
        status: "COMPLETED"
      },
      include: {
        table: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return matches.map(match => {
      const timeMinutes = match.logoutTime 
        ? Math.round((match.logoutTime.getTime() - match.loginTime.getTime()) / (1000 * 60))
        : Math.round((new Date().getTime() - match.loginTime.getTime()) / (1000 * 60));

      return {
        ...match,
        tableNumber: match.table.tableNumber,
        timeMinutes,
      } as Match
    })
  } catch (error) {
    console.error("Failed to fetch completed matches:", error)
    throw error
  }
}

export async function updatePaymentStatus(matchId: string) {
  try {
    const match = await prisma.match.update({
      where: { id: matchId },
      data: {
        status: "COMPLETED",
        paymentStatus: "PAID",
        updatedAt: new Date()
      }
    })
    revalidatePath("/dashboard")
    return { success: true, data: match }
  } catch (error) {
    console.error("Failed to update payment status:", error)
    throw error
  }
}

export async function createMatch(payload: {
    table_no: string;
    player1: string;
    player2: string;
    // Add other necessary fields here
}) {
    const supabase = createServerComponentClient({ cookies });
    const { data, error } = await supabase
        .from("Match")
        .insert([payload])
        .select();

    if (error) {
        console.error("Error creating match:", error);
        throw error;
    }
    return data;
}
