import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const { walletAddress, isLeader, name } = body

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    const db = getDb()
    const now = Date.now()

    // Check if community exists
    const community = db
      .prepare('SELECT * FROM communities WHERE id = ?')
      .get(id) as any

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      )
    }

    if (isLeader) {
      // Add as leader
      try {
        db.prepare(`
          INSERT INTO community_leaders (id, community_id, wallet_address, name, added_at)
          VALUES (?, ?, ?, ?, ?)
        `).run(uuidv4(), id, walletAddress, name || null, now)
      } catch (error: any) {
        if (error.message.includes('UNIQUE constraint')) {
          return NextResponse.json(
            { error: 'User is already a leader' },
            { status: 400 }
          )
        }
        throw error
      }
    } else {
      // Add as member
      try {
        db.prepare(`
          INSERT INTO community_members (id, community_id, wallet_address, joined_at)
          VALUES (?, ?, ?, ?)
        `).run(uuidv4(), id, walletAddress, now)
      } catch (error: any) {
        if (error.message.includes('UNIQUE constraint')) {
          return NextResponse.json(
            { error: 'User is already a member' },
            { status: 400 }
          )
        }
        throw error
      }
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error: any) {
    console.error('Error adding member:', error)
    return NextResponse.json(
      { error: 'Failed to add member', message: error.message },
      { status: 500 }
    )
  }
}

