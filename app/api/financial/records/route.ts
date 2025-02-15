import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import dayjs from 'dayjs'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const tableNumber = searchParams.get('tableNumber')
    const playerName = searchParams.get('playerName')

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 })
    }

    const start = dayjs(startDate).startOf('day')
    const end = dayjs(endDate).endOf('day')

    // Get matches data
    const matches = await prisma.match.findMany({
      where: {
        loginTime: {
          gte: start.toDate(),
          lte: end.toDate()
        },
        status: 'COMPLETED',
        ...(tableNumber && {
          table: {
            tableNumber: parseInt(tableNumber)
          }
        }),
        ...(playerName && {
          OR: [
            { player1: playerName },
            { player2: playerName }
          ]
        })
      },
      include: {
        table: true
      }
    })

    // Get expenses data
    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: start.toDate(),
          lte: end.toDate()
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    return NextResponse.json({
      matches,
      expenses
    })

  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch records' 
    }, { status: 500 })
  }
} 