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
    const { executedBy } = body

    if (!executedBy) {
      return NextResponse.json(
        { error: 'Executor address is required' },
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

    if (proposal.status !== 'approved') {
      return NextResponse.json(
        { error: 'Proposal must be approved before execution' },
        { status: 400 }
      )
    }

    // Check if all leaders have approved
    const totalLeaders = db
      .prepare('SELECT COUNT(*) as count FROM community_leaders WHERE community_id = ?')
      .get(proposal.community_id) as any

    const approvalCount = db
      .prepare('SELECT COUNT(*) as count FROM proposal_approvals WHERE proposal_id = ?')
      .get(id) as any

    if (approvalCount.count < totalLeaders.count) {
      return NextResponse.json(
        { error: 'Not all leaders have approved this proposal' },
        { status: 400 }
      )
    }

    // Check community balance
    const community = db
      .prepare('SELECT * FROM communities WHERE id = ?')
      .get(proposal.community_id) as any

    if (community.current_balance < proposal.amount) {
      return NextResponse.json(
        { error: 'Insufficient community balance' },
        { status: 400 }
      )
    }

    const now = Date.now()
    const transactionId = uuidv4()

    // Execute transaction
    const transaction = db.transaction(() => {
      // Update proposal status
      db.prepare('UPDATE proposals SET status = ?, executed_at = ? WHERE id = ?')
        .run('executed', now, id)

      // Update community balance
      db.prepare('UPDATE communities SET current_balance = current_balance - ? WHERE id = ?')
        .run(proposal.amount, proposal.community_id)

      // Create transaction record
      db.prepare(`
        INSERT INTO transactions (
          id, proposal_id, community_id, amount, recipient_address,
          executed_by, executed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        transactionId,
        id,
        proposal.community_id,
        proposal.amount,
        proposal.recipient_address,
        executedBy,
        now
      )

      // Log activity
      db.prepare(`
        INSERT INTO activities (id, community_id, type, proposal_id, actor, amount, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(uuidv4(), proposal.community_id, 'proposal_executed', id, executedBy, proposal.amount, now)
    })

    transaction()

    return NextResponse.json({ success: true, transactionId })
  } catch (error: any) {
    console.error('Error executing proposal:', error)
    return NextResponse.json(
      { error: 'Failed to execute proposal', message: error.message },
      { status: 500 }
    )
  }
}

