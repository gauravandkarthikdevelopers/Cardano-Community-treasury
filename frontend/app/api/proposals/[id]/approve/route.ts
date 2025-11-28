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
    const { leaderAddress } = body

    if (!leaderAddress) {
      return NextResponse.json(
        { error: 'Leader address is required' },
        { status: 400 }
      )
    }

    const db = getDb()

    // Get proposal
    const proposal = db
      .prepare('SELECT * FROM proposals WHERE id = ?')
      .get(id) as any

    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      )
    }

    if (proposal.status !== 'pending') {
      return NextResponse.json(
        { error: 'Proposal is not pending approval' },
        { status: 400 }
      )
    }

    // Check if user is a leader of this community
    const isLeader = db
      .prepare('SELECT 1 FROM community_leaders WHERE community_id = ? AND wallet_address = ?')
      .get(proposal.community_id, leaderAddress)

    if (!isLeader) {
      return NextResponse.json(
        { error: 'Only leaders can approve proposals' },
        { status: 403 }
      )
    }

    // Check if already approved
    const existingApproval = db
      .prepare('SELECT 1 FROM proposal_approvals WHERE proposal_id = ? AND leader_address = ?')
      .get(id, leaderAddress)

    if (existingApproval) {
      return NextResponse.json(
        { error: 'Proposal already approved by this leader' },
        { status: 400 }
      )
    }

    const now = Date.now()

    // Add approval
    db.prepare(`
      INSERT INTO proposal_approvals (id, proposal_id, leader_address, approved_at)
      VALUES (?, ?, ?, ?)
    `).run(uuidv4(), id, leaderAddress, now)

    // Check if all leaders have approved (ALL leaders must approve, not just threshold)
    const totalLeaders = db
      .prepare('SELECT COUNT(*) as count FROM community_leaders WHERE community_id = ?')
      .get(proposal.community_id) as any

    const approvalCount = db
      .prepare('SELECT COUNT(*) as count FROM proposal_approvals WHERE proposal_id = ?')
      .get(id) as any

    // Log approval activity
      db.prepare(`
        INSERT INTO activities (id, community_id, type, proposal_id, actor, amount, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(uuidv4(), proposal.community_id, 'proposal_approved', id, leaderAddress, proposal.amount, now)

    // Update status if ALL leaders approved (not just threshold)
    if (approvalCount.count >= totalLeaders.count) {
      db.prepare('UPDATE proposals SET status = ? WHERE id = ?')
        .run('approved', id)
    }

    return NextResponse.json({ success: true, approvalCount: approvalCount.count, totalLeaders: totalLeaders.count })
  } catch (error: any) {
    console.error('Error approving proposal:', error)
    return NextResponse.json(
      { error: 'Failed to approve proposal', message: error.message },
      { status: 500 }
    )
  }
}

