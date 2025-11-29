import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  try {
    const db = getDb()
    const searchParams = request.nextUrl.searchParams
    const createdBy = searchParams.get('createdBy')
    const memberOf = searchParams.get('memberOf')

    let query = `
      SELECT 
        c.*,
        COUNT(DISTINCT cm.wallet_address) as member_count,
        COUNT(DISTINCT cl.wallet_address) as leader_count
      FROM communities c
      LEFT JOIN community_members cm ON c.id = cm.community_id
      LEFT JOIN community_leaders cl ON c.id = cl.community_id
    `
    const params: any[] = []
    const conditions: string[] = []

    if (createdBy) {
      conditions.push('c.created_by = ?')
      params.push(createdBy)
    }

    if (memberOf) {
      conditions.push('(cm.wallet_address = ? OR cl.wallet_address = ?)')
      params.push(memberOf, memberOf)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    query += ' GROUP BY c.id ORDER BY c.created_at DESC'

    const communities = db.prepare(query).all(...params)

    // Get leaders for each community
    const communitiesWithLeaders = communities.map((comm: any) => {
      const leaders = db
        .prepare('SELECT wallet_address, name FROM community_leaders WHERE community_id = ?')
        .all(comm.id)
      return {
        ...comm,
        treasuryAddress: comm.treasury_address,
        initialBalance: comm.initial_balance,
        currentBalance: comm.current_balance,
        approvalThreshold: comm.approval_threshold,
        createdAt: comm.created_at,
        createdBy: comm.created_by,
        leaders: leaders.map((l: any) => ({
          address: l.wallet_address,
          name: l.name
        }))
      }
    })

    return NextResponse.json({ communities: communitiesWithLeaders })
  } catch (error: any) {
    console.error('Error fetching communities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch communities', message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/communities - Request received')
    const body = await request.json()
    console.log('Request body:', body)

    const {
      name,
      description,
      treasuryAddress,
      initialBalance,
      approvalThreshold,
      createdBy,
      leaders,
      members
    } = body

    if (!name || !treasuryAddress || !createdBy || approvalThreshold === undefined) {
      console.error('Missing required fields:', { name, treasuryAddress, createdBy, approvalThreshold })
      return NextResponse.json(
        { error: 'Missing required fields', received: { name: !!name, treasuryAddress: !!treasuryAddress, createdBy: !!createdBy, approvalThreshold } },
        { status: 400 }
      )
    }

    if (!Array.isArray(leaders) || leaders.length === 0) {
      return NextResponse.json(
        { error: 'At least one leader is required' },
        { status: 400 }
      )
    }

    if (leaders.length < approvalThreshold) {
      return NextResponse.json(
        { error: 'Approval threshold cannot exceed number of leaders' },
        { status: 400 }
      )
    }

    console.log('Getting database connection...')
    const db = getDb()
    console.log('Database connection established')

    const communityId = uuidv4()
    const now = Date.now()

    console.log('Creating community with ID:', communityId)

    // Start transaction
    const transaction = db.transaction(() => {
      // Create community
      db.prepare(`
        INSERT INTO communities (
          id, name, description, treasury_address, initial_balance, 
          current_balance, approval_threshold, created_at, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        communityId,
        name,
        description || '',
        treasuryAddress,
        initialBalance || 0,
        initialBalance || 0,
        approvalThreshold,
        now,
        createdBy
      )

      // Add leaders
      leaders.forEach((leader: { address: string; name?: string }) => {
        db.prepare(`
          INSERT INTO community_leaders (id, community_id, wallet_address, name, added_at)
          VALUES (?, ?, ?, ?, ?)
        `).run(uuidv4(), communityId, leader.address, leader.name || null, now)
      })

      // Add creator as member if not already a leader
      const creatorIsLeader = leaders.some((l: { address: string }) => l.address === createdBy)
      if (!creatorIsLeader) {
        db.prepare(`
          INSERT INTO community_members (id, community_id, wallet_address, joined_at)
          VALUES (?, ?, ?, ?)
        `).run(uuidv4(), communityId, createdBy, now)
      }

      // Add members
      if (Array.isArray(members)) {
        members.forEach((member: { address: string }) => {
          // Skip if member is already a leader or creator (already added)
          const isLeader = leaders.some((l: { address: string }) => l.address === member.address)
          const isCreator = member.address === createdBy

          if (!isLeader && !isCreator) {
            try {
              db.prepare(`
                INSERT INTO community_members (id, community_id, wallet_address, joined_at)
                VALUES (?, ?, ?, ?)
              `).run(uuidv4(), communityId, member.address, now)
            } catch (e) {
              // Ignore duplicate members
            }
          }
        })
      }

      // Log activity
      db.prepare(`
        INSERT INTO activities (id, community_id, type, actor, timestamp)
        VALUES (?, ?, ?, ?, ?)
      `).run(uuidv4(), communityId, 'community_created', createdBy, now)
    })

    console.log('Executing transaction...')
    transaction()
    console.log('Transaction completed')

    // Fetch created community
    const community = db
      .prepare('SELECT * FROM communities WHERE id = ?')
      .get(communityId) as any

    console.log('Created community:', community)

    const communityLeaders = db
      .prepare('SELECT wallet_address, name FROM community_leaders WHERE community_id = ?')
      .all(communityId)

    console.log('Community leaders:', communityLeaders)

    const responseData = {
      community: {
        ...community,
        treasuryAddress: community.treasury_address,
        initialBalance: community.initial_balance,
        currentBalance: community.current_balance,
        approvalThreshold: community.approval_threshold,
        createdAt: community.created_at,
        createdBy: community.created_by,
        leaders: communityLeaders.map((l: any) => ({
          address: l.wallet_address,
          name: l.name
        }))
      }
    }

    console.log('Returning response:', responseData)
    return NextResponse.json(responseData, { status: 201 })
  } catch (error: any) {
    console.error('Error creating community:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      {
        error: 'Failed to create community',
        message: error.message || 'Unknown error occurred',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

