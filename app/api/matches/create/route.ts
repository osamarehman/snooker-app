import { NextResponse } from 'next/server'
import { createMatch } from '@/app/actions/match'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const result = await createMatch(data)
    
    if (result.success) {
      return NextResponse.json(result.data)
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error('Failed to create match:', error)
    return NextResponse.json({ error: 'Failed to create match' }, { status: 500 })
  }
} 