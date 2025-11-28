import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  try {
    const db = getDb()
    const searchParams = request.nextUrl.searchParams
    const communityId = searchParams.get('communityId')
    const status = searchParams.get('status')

    let query = 'SELECT * FROM proposals WHERE 1=1'
    const params: any[] = []

    if (communityId) {
      query += ' AND community_id = ?'
      params.push(communityId)
    }

    if (status) {
      query += ' AND status = ?'
      params.push(status)
    }

    query += ' ORDER BY created_at DESC'

    const proposals = db.prepare(query).all(...params)

    // Get approvals for each proposal
    const proposalsWithApprovals = proposals.map((proposal: any) => {
      const approvals = db
        .prepare('SELECT leader_address FROM proposal_approvals WHERE proposal_id = ?')
        .all(proposal.id)
      
      return {
        ...proposal,
        communityId: proposal.community_id,
        recipientAddress: proposal.recipient_address,
        createdBy: proposal.created_by,
        createdAt: proposal.created_at,
        executedAt: proposal.executed_at,
        zkProofUrl: proposal.zk_proof_url,
        approvals: approvals.map((a: any) => a.leader_address)
      }
    })

    return NextResponse.json({ proposals: proposalsWithApprovals })
  } catch (error: any) {
    console.error('Error fetching proposals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch proposals', message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      communityId,
      title,
      description,
      amount,
      recipientAddress,
      createdBy,
      category,
      zkProofUrl
    } = body

    if (!communityId || !title || !amount || !recipientAddress || !createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const db = getDb()
    const proposalId = uuidv4()
    const now = Date.now()

    // Check if community exists and has sufficient balance
    const community = db
      .prepare('SELECT * FROM communities WHERE id = ?')
      .get(communityId) as any

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      )
    }

    if (community.current_balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      )
    }

    // Create proposal
    db.prepare(`
      INSERT INTO proposals (
        id, community_id, title, description, amount, recipient_address,
        status, created_by, created_at, category, zk_proof_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      proposalId,
      communityId,
      title,
      description || '',
      amount,
      recipientAddress,
      'pending',
      createdBy,
      now,
      category || null,
      zkProofUrl || null
    )

    // Log activity
    db.prepare(`
      INSERT INTO activities (id, community_id, type, proposal_id, actor, amount, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(uuidv4(), communityId, 'proposal_created', proposalId, createdBy, amount, now)

    // Fetch created proposal
    const proposal = db
      .prepare('SELECT * FROM proposals WHERE id = ?')
      .get(proposalId) as any

    return NextResponse.json({
      proposal: {
        ...proposal,
        communityId: proposal.community_id,
        recipientAddress: proposal.recipient_address,
        createdBy: proposal.created_by,
        createdAt: proposal.created_at,
        executedAt: proposal.executed_at,
        zkProofUrl: proposal.zk_proof_url,
        approvals: []
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating proposal:', error)
    return NextResponse.json(
      { error: 'Failed to create proposal', message: error.message },
      { status: 500 }
    )
  }
}

