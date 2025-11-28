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

    const activities = db
      .prepare(`
        SELECT a.*, c.name as community_name, p.title as proposal_title
        FROM activities a
        LEFT JOIN communities c ON a.community_id = c.id
        LEFT JOIN proposals p ON a.proposal_id = p.id
        WHERE a.community_id = ?
        ORDER BY a.timestamp DESC
        LIMIT 100
      `)
      .all(communityId)

    return NextResponse.json({ activities })
  } catch (error: any) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities', message: error.message },
      { status: 500 }
    )
  }
}

