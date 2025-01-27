"use server"

import { prisma } from "@/lib/prisma"

export async function initializeTables(count: number = 7) {
  try {
    // Check if tables already exist
    const existingTables = await prisma.table.findMany()
    if (existingTables.length > 0) {
      return { success: true, data: existingTables }
    }

    // Create tables if they don't exist
    const tables = await Promise.all(
      Array.from({ length: count }).map((_, index) =>
        prisma.table.create({
          data: {
            tableNumber: index + 1,
          },
        })
      )
    )

    return { success: true, data: tables }
  } catch (error) {
    console.error("Failed to initialize tables:", error)
    return { success: false, error: "Failed to initialize tables" }
  }
}

export async function getAvailableTables() {
  try {
    // Get all tables that don't have any ongoing matches
    const tables = await prisma.table.findMany({
      where: {
        NOT: {
          matches: {
            some: {
              status: "ONGOING"
            }
          }
        }
      },
      orderBy: {
        tableNumber: 'asc'
      }
    })
    return { success: true, data: tables }
  } catch (error) {
    console.error("Failed to get available tables:", error)
    return { success: false, error: "Failed to get tables" }
  }
}

export async function getTableById(tableNumber: number) {
  try {
    const table = await prisma.table.findFirst({
      where: {
        tableNumber,
      },
    })
    return { success: true, data: table }
  } catch (error) {
    console.error("Failed to get table:", error)
    return { success: false, error: "Failed to get table" }
  }
} 