import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  try {
    const db = getDb()
    
    // Test database connection
    const testQuery = db.prepare('SELECT 1 as test').get() as any
    
    // Check if tables exist
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `).all() as any[]

    return NextResponse.json({
      success: true,
      database: 'connected',
      testQuery: testQuery,
      tables: tables.map(t => t.name),
      message: 'Database is working correctly'
    })
  } catch (error: any) {
    console.error('Database test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

