import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
// import type { Match } from '@/types/database'
// import type { NextRequest } from 'next/server'

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params
    const body = await request.json()

    const updatedMatch = await prisma.match.update({
      where: { id },
      data: body
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