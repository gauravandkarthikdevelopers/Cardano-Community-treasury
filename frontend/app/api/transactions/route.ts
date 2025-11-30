import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const db = getDb()
    const searchParams = request.nextUrl.searchParams
    const communityId = searchParams.get('communityId')

    if (!communityId) {
      return NextResponse.json(
        { error: 'communityId is required' },
        { status: 400 }
      )
    }

    const transactions = db
      .prepare(`
        SELECT t.*, p.title as proposal_title
        FROM transactions t
        LEFT JOIN proposals p ON t.proposal_id = p.id
        WHERE t.community_id = ?
        ORDER BY t.executed_at DESC
      `)
      .all(communityId)

    return NextResponse.json({ transactions })
  } catch (error: any) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions', message: error.message },
      { status: 500 }
    )
  }
}

