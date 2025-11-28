export interface Leader {
  address: string
  name?: string
}

export interface Community {
  id: string
  name: string
  description: string
  treasuryAddress: string
  initialBalance: number
  currentBalance: number
  approvalThreshold: number
  createdAt: number
  createdBy: string
}

export type ProposalStatus = 'pending' | 'approved' | 'rejected' | 'executed'

export interface Proposal {
  id: string
  communityId: string
  title: string
  description: string
  amount: number
  recipientAddress: string
  status: ProposalStatus
  createdBy: string
  createdAt: number
  executedAt?: number
  category?: string
  zkProofUrl?: string
}

export interface ProposalApproval {
  id: string
  proposalId: string
  leaderAddress: string
  approvedAt: number
}

export interface Transaction {
  id: string
  proposalId: string
  communityId: string
  amount: number
  recipientAddress: string
  executedBy: string
  executedAt: number
  txHash?: string
}

export interface Activity {
  id: string
  communityId: string
  type: 'proposal_created' | 'proposal_approved' | 'proposal_executed' | 'community_created' | 'treasury_funded' | 'zk_proof_attached'
  proposalId?: string
  actor: string
  amount?: number
  timestamp: number
  metadata?: string
}

export interface CommunityMember {
  id: string
  communityId: string
  walletAddress: string
  joinedAt: number
}

export interface CommunityLeader {
  id: string
  communityId: string
  walletAddress: string
  name?: string
  addedAt: number
}

