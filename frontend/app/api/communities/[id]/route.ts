import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const db = getDb()
    const community = db
      .prepare('SELECT * FROM communities WHERE id = ?')
      .get(id) as any

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      )
    }

    // Get leaders
    const leaders = db
      .prepare('SELECT wallet_address, name FROM community_leaders WHERE community_id = ?')
      .all(id)

    // Get members
    const members = db
      .prepare('SELECT wallet_address, joined_at FROM community_members WHERE community_id = ?')
      .all(id)

    // Get member count
    const memberCount = db
      .prepare('SELECT COUNT(*) as count FROM community_members WHERE community_id = ?')
      .get(id) as any

    return NextResponse.json({
      community: {
        ...community,
        treasuryAddress: community.treasury_address,
        initialBalance: community.initial_balance,
        currentBalance: community.current_balance,
        approvalThreshold: community.approval_threshold,
        createdAt: community.created_at,
        createdBy: community.created_by,
        leaders: leaders.map((l: any) => ({
          address: l.wallet_address,
          name: l.name
        })),
        members: members.map((m: any) => m.wallet_address),
        memberCount: memberCount.count
      }
    })
  } catch (error: any) {
    console.error('Error fetching community:', error)
    return NextResponse.json(
      { error: 'Failed to fetch community', message: error.message },
      { status: 500 }
    )
  }
}

