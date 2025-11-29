import { getDb } from '../lib/db'
import { v4 as uuidv4 } from 'uuid'

async function verifyMemberManagement() {
    console.log('Starting verification...')
    const db = getDb()
    const communityId = uuidv4()
    const leaderAddress = 'addr_test_leader'
    const memberAddress = 'addr_test_member'
    const newMemberAddress = 'addr_test_new_member'
    const now = Date.now()

    try {
        // 1. Create Community with Leaders and Members
        console.log('1. Creating community with leaders and members...')

        // Simulate POST /api/communities logic
        const transaction = db.transaction(() => {
            db.prepare(`
        INSERT INTO communities (
          id, name, description, treasury_address, initial_balance, 
          current_balance, approval_threshold, created_at, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
                communityId,
                'Test Community',
                'Description',
                'addr_treasury',
                100,
                100,
                1,
                now,
                leaderAddress
            )

            // Add leader
            db.prepare(`
        INSERT INTO community_leaders (id, community_id, wallet_address, name, added_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(uuidv4(), communityId, leaderAddress, 'Leader Name', now)

            // Add member
            db.prepare(`
        INSERT INTO community_members (id, community_id, wallet_address, joined_at)
        VALUES (?, ?, ?, ?)
      `).run(uuidv4(), communityId, memberAddress, now)
        })
        transaction()

        // Verify creation
        const leaders = db.prepare('SELECT * FROM community_leaders WHERE community_id = ?').all(communityId)
        const members = db.prepare('SELECT * FROM community_members WHERE community_id = ?').all(communityId)

        console.log('Leaders count:', leaders.length)
        console.log('Members count:', members.length)

        if (leaders.length !== 1 || members.length !== 1) {
            throw new Error('Failed to create community with correct leaders/members')
        }
        console.log('✅ Community creation verified')

        // 2. Add new member to existing community
        console.log('2. Adding new member to existing community...')

        // Simulate POST /api/communities/[id]/members logic
        db.prepare(`
      INSERT INTO community_members (id, community_id, wallet_address, joined_at)
      VALUES (?, ?, ?, ?)
    `).run(uuidv4(), communityId, newMemberAddress, now)

        // Verify addition
        const updatedMembers = db.prepare('SELECT * FROM community_members WHERE community_id = ?').all(communityId)
        console.log('Updated members count:', updatedMembers.length)

        if (updatedMembers.length !== 2) {
            throw new Error('Failed to add new member')
        }
        console.log('✅ Add member verified')

        console.log('🎉 All verifications passed!')
    } catch (error) {
        console.error('❌ Verification failed:', error)
    } finally {
        // Cleanup
        db.prepare('DELETE FROM communities WHERE id = ?').run(communityId)
        console.log('Cleanup completed')
    }
}

verifyMemberManagement()
