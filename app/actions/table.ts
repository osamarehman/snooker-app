"use server"

import { prisma } from "@/lib/prisma"

export async function initializeTables(count: number = 7) {
  try {
    // Check if tables already exist
    const existingTables = await prisma.table.findMany()
    console.log('Existing tables:', existingTables)
    
    if (existingTables.length > 0) {
      console.log('Using existing tables')
      return { success: true, data: existingTables }
    }

    console.log('No tables found, creating new ones...')

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

    console.log('Created tables:', tables)
    return { success: true, data: tables }
  } catch (error) {
    console.error("Failed to initialize tables:", error)
    return { success: false, error: "Failed to initialize tables" }
  }
}

export async function getAvailableTables() {
  try {
    // First get all tables
    const allTables = await prisma.table.findMany({
      include: {
        matches: true
      }
    })
    console.log('All tables:', allTables)

    // Get available tables
    const tables = await prisma.table.findMany({
      where: {
        NOT: {
          matches: {
            some: {
              status: {
                in: ["ONGOING", "PENDING_PAYMENT"]
              }
            }
          }
        }
      },
      orderBy: {
        tableNumber: 'asc'
      },
      include: {
        matches: true
      }
    })
    console.log('Available tables:', tables)
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
