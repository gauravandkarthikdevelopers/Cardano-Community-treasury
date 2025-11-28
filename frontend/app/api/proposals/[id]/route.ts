import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const db = getDb()
    const proposal = db
      .prepare('SELECT * FROM proposals WHERE id = ?')
      .get(id) as any

    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      )
    }

    // Get approvals
    const approvals = db
      .prepare('SELECT leader_address, approved_at FROM proposal_approvals WHERE proposal_id = ?')
      .all(id)

    // Get community info
    const community = db
      .prepare('SELECT name FROM communities WHERE id = ?')
      .get(proposal.community_id) as any

    return NextResponse.json({
      proposal: {
        ...proposal,
        communityId: proposal.community_id,
        approvals: approvals.map((a: any) => a.leader_address),
        communityName: community?.name
      }
    })
  } catch (error: any) {
    console.error('Error fetching proposal:', error)
    return NextResponse.json(
      { error: 'Failed to fetch proposal', message: error.message },
      { status: 500 }
    )
  }
}

