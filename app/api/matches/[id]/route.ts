import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
// import type { Match } from '@/types/database'
// import type { NextRequest } from 'next/server'

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params
    const body = await request.json()
    const headersList = await headers()
    const isOffline = headersList.get('x-offline') === 'true'

    // If request is from offline sync, add additional validation
    if (isOffline) {
      const existingMatch = await prisma.match.findUnique({
        where: { id },
        select: { updatedAt: true }
      })

      if (existingMatch && new Date(body.updatedAt) < existingMatch.updatedAt) {
        // Server version is newer, return conflict
        return NextResponse.json(
          { error: 'Conflict: Server has newer version' },
          { status: 409 }
        )
      }
    }

    const updatedMatch = await prisma.match.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedMatch)
  } catch (error) {
    console.error('Error updating match:', error)
    return NextResponse.json(
      { error: 'Failed to update match' },
      { status: 500 }
    )
  }
} 