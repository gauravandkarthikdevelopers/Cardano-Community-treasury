import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

// For Vercel serverless, we'll use an in-memory database or file-based approach
// In production, you'd want to use Vercel Postgres or similar
// For local development, use file-based SQLite
// For Vercel, we'll use in-memory (data will be lost on serverless function restart)
const isVercel = process.env.VERCEL === '1'
const dbPath = isVercel 
  ? ':memory:' 
  : (process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'treasury.db'))

// Ensure data directory exists for file-based database
if (!isVercel && dbPath !== ':memory:') {
  const dataDir = path.dirname(dbPath)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (db) {
    return db
  }

  // For serverless, use in-memory database
  // Note: Data will be lost when serverless function restarts
  // For production, consider using Vercel Postgres or similar
  db = new Database(dbPath)
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON')
  
  // Initialize schema
  initializeSchema(db)
  
  return db
}

function initializeSchema(database: Database.Database) {
  // Communities table
  database.exec(`
    CREATE TABLE IF NOT EXISTS communities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      treasury_address TEXT NOT NULL,
      initial_balance REAL NOT NULL DEFAULT 0,
      current_balance REAL NOT NULL DEFAULT 0,
      approval_threshold INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      created_by TEXT NOT NULL
    )
  `)

  // Community leaders table
  database.exec(`
    CREATE TABLE IF NOT EXISTS community_leaders (
      id TEXT PRIMARY KEY,
      community_id TEXT NOT NULL,
      wallet_address TEXT NOT NULL,
      name TEXT,
      added_at INTEGER NOT NULL,
      UNIQUE(community_id, wallet_address),
      FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE
    )
  `)

  // Community members table
  database.exec(`
    CREATE TABLE IF NOT EXISTS community_members (
      id TEXT PRIMARY KEY,
      community_id TEXT NOT NULL,
      wallet_address TEXT NOT NULL,
      joined_at INTEGER NOT NULL,
      UNIQUE(community_id, wallet_address),
      FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE
    )
  `)

  // Proposals table
  database.exec(`
    CREATE TABLE IF NOT EXISTS proposals (
      id TEXT PRIMARY KEY,
      community_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      amount REAL NOT NULL,
      recipient_address TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_by TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      executed_at INTEGER,
      category TEXT,
      zk_proof_url TEXT,
      FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE
    )
  `)

  // Proposal approvals table
  database.exec(`
    CREATE TABLE IF NOT EXISTS proposal_approvals (
      id TEXT PRIMARY KEY,
      proposal_id TEXT NOT NULL,
      leader_address TEXT NOT NULL,
      approved_at INTEGER NOT NULL,
      UNIQUE(proposal_id, leader_address),
      FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
    )
  `)

  // Transactions table
  database.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      proposal_id TEXT NOT NULL,
      community_id TEXT NOT NULL,
      amount REAL NOT NULL,
      recipient_address TEXT NOT NULL,
      executed_by TEXT NOT NULL,
      executed_at INTEGER NOT NULL,
      tx_hash TEXT,
      FOREIGN KEY (proposal_id) REFERENCES proposals(id),
      FOREIGN KEY (community_id) REFERENCES communities(id)
    )
  `)

  // Activities table
  database.exec(`
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      community_id TEXT NOT NULL,
      type TEXT NOT NULL,
      proposal_id TEXT,
      actor TEXT NOT NULL,
      amount REAL,
      timestamp INTEGER NOT NULL,
      metadata TEXT,
      FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE
    )
  `)
}

// Helper function to close database (useful for cleanup)
export function closeDb() {
  if (db) {
    db.close()
    db = null
  }
}

