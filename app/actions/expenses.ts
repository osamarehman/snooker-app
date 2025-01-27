"use server"

import { prisma } from "@/lib/prisma"
import type { ExpenseTag } from "@prisma/client"

export interface ExpenseFormData {
  description: string
  tag: ExpenseTag
  quantity: number
  rate: number
}

export async function createExpense(data: ExpenseFormData) {
  try {
    const expense = await prisma.expense.create({
      data: {
        ...data,
        amount: data.quantity * data.rate
      }
    })
    return { success: true, data: expense }
  } catch (error) {
    console.error("Failed to create expense:", error)
    throw error
  }
}

export async function getExpenses() {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: {
        date: 'desc'
      }
    })
    return expenses
  } catch (error) {
    console.error("Failed to fetch expenses:", error)
    throw error
  }
} 