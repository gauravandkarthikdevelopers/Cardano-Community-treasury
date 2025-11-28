'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useWallet } from '@/hooks/useWallet'
import WalletConnect from '@/components/WalletConnect'
import ApprovalButton from '@/components/ApprovalButton'
import Link from 'next/link'
import { ArrowLeft, Loader2, CheckCircle2, Clock, XCircle, PlayCircle, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import type { Proposal, Community, Leader } from '@/lib/types'

export default function ProposalDetail() {
  const params = useParams()
  const router = useRouter()
  const { address } = useWallet()
  const [proposal, setProposal] = useState<Proposal & { approvals?: string[]; communityName?: string } | null>(null)
  const [community, setCommunity] = useState<(Community & { leaders?: Leader[] }) | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchProposal()
    }
  }, [params.id])

  const fetchProposal = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/proposals/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setProposal(data.proposal)
        
        // Fetch community to get leader info
        if (data.proposal.communityId || data.proposal.community_id) {
          const communityId = data.proposal.communityId || data.proposal.community_id
          const commResponse = await fetch(`/api/communities/${communityId}`)
          if (commResponse.ok) {
            const commData = await commResponse.json()
            setCommunity(commData.community)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching proposal:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproval = () => {
    fetchProposal()
  }

  const handleExecute = async () => {
    if (!address) {
      toast.error('Please connect your wallet')
      return
    }

    try {
      const response = await fetch(`/api/proposals/${params.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ executedBy: address })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to execute proposal')
      }

      toast.success('Proposal executed successfully!')
      fetchProposal()
      const communityId = (proposal as any).communityId || (proposal as any).community_id
      if (communityId) {
        router.push(`/community/${communityId}`)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to execute proposal')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Proposal not found
          </h2>
          <Link
            href="/dashboard"
            className="text-purple-600 dark:text-purple-400 hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const isLeader = address && community?.leaders?.some((l: any) => l.address === address)
  const hasApproved = address && proposal.approvals?.includes(address)
  const totalLeaders = community?.leaders?.length || 0
  const approvalCount = proposal.approvals?.length || 0
  const canExecute = proposal.status === 'approved' && approvalCount >= totalLeaders

  const statusConfig = {
    pending: { icon: Clock, color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20', label: 'Pending' },
    approved: { icon: CheckCircle2, color: 'text-green-500 bg-green-500/10 border-green-500/20', label: 'Approved' },
    rejected: { icon: XCircle, color: 'text-red-500 bg-red-500/10 border-red-500/20', label: 'Rejected' },
    executed: { icon: PlayCircle, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', label: 'Executed' }
  }

  const config = statusConfig[proposal.status]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            href={`/community/${(proposal as any).communityId || (proposal as any).community_id}`}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Community</span>
          </Link>
          <WalletConnect />
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Proposal Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {proposal.title}
                  </h1>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-md border ${config.color} text-sm font-semibold`}>
                    <config.icon className="w-4 h-4" />
                    <span>{config.label}</span>
                  </div>
                </div>
                {proposal.category && (
                  <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm rounded-md mb-4">
                    {proposal.category}
                  </span>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Amount</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {proposal.amount.toLocaleString()} ADA
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Recipient</p>
                <p className="font-mono text-sm text-gray-900 dark:text-white break-all">
                  {proposal.recipientAddress}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Description</p>
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                {proposal.description}
              </p>
            </div>

            {proposal.zkProofUrl && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">ZK Proof</p>
                <a
                  href={proposal.zkProofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{proposal.zkProofUrl}</span>
                </a>
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 pt-6 border-t border-gray-200 dark:border-gray-700">
              <span>Created {formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true })}</span>
              {proposal.executedAt && (
                <span>Executed {formatDistanceToNow(new Date(proposal.executedAt), { addSuffix: true })}</span>
              )}
            </div>
          </div>

          {/* Approvals Section */}
          {proposal.status === 'pending' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Approvals ({approvalCount}/{totalLeaders})
              </h2>
              {isLeader && (
                <div className="mb-4">
                  <ApprovalButton
                    proposalId={proposal.id}
                    hasApproved={hasApproved || false}
                    approvalCount={approvalCount}
                    totalLeaders={totalLeaders}
                    onApproval={handleApproval}
                  />
                </div>
              )}
              <div className="space-y-2">
                {proposal.approvals && proposal.approvals.length > 0 ? (
                  proposal.approvals.map((approval, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className="font-mono text-sm text-gray-900 dark:text-white">{approval}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No approvals yet</p>
                )}
              </div>
            </div>
          )}

          {/* Execute Button */}
          {canExecute && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to Execute
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                All leaders have approved this proposal. You can now execute the transaction.
              </p>
              <button
                onClick={handleExecute}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Execute Transaction
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

