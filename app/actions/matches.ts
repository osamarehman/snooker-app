"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Match } from "@/types/database"

export async function getOngoingMatches() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data, error } = await supabase
    .from('Match')
    .select('*')
    .eq('status', 'ONGOING')
    .order('loginTime', { ascending: false })

  if (error) throw error
  return data as Match[]
}

export async function getOutstandingPayments() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data, error } = await supabase
    .from('Match')
    .select('*')
    .eq('status', 'COMPLETED')
    .eq('paymentMethod', 'CREDIT' || 'CASH')
    .order('createdAt', { ascending: false })

  if (error) throw error
  return data as Match[]
}

export async function getCompletedMatches() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data, error } = await supabase
    .from('Match')
    .select('*')
    .eq('status', 'COMPLETED')
    .not('paymentMethod', 'eq', 'CREDIT' || 'CASH')
    .order('createdAt', { ascending: false })
    .limit(50)

  if (error) throw error
  return data as Match[]
}

export async function updatePaymentStatus(matchId: string) {
  const supabase = createServerComponentClient({ cookies })
  
  const { error } = await supabase
    .from('Match')
    .update({ 
      status: 'COMPLETED',
      paymentMethod: 'CASH', // Converting from CREDIT to CASH when paid
      updatedAt: new Date().toISOString()
    })
    .eq('id', matchId)

  if (error) {
    console.error('Error updating payment status:', error)
    throw error
  }

  return { success: true }
} 