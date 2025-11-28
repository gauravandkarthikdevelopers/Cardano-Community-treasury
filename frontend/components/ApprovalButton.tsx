'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useWallet } from '@/hooks/useWallet'

interface ApprovalButtonProps {
  proposalId: string
  hasApproved: boolean
  approvalCount: number
  totalLeaders: number
  onApproval?: () => void
}

export default function ApprovalButton({
  proposalId,
  hasApproved,
  approvalCount,
  totalLeaders,
  onApproval
}: ApprovalButtonProps) {
  const { address } = useWallet()
  const [isApproving, setIsApproving] = useState(false)

  const handleApprove = async () => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }

    setIsApproving(true)

    try {
      const response = await fetch(`/api/proposals/${proposalId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaderAddress: address })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to approve proposal')
      }

      toast.success('Proposal approved!')
      if (onApproval) {
        onApproval()
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve proposal')
    } finally {
      setIsApproving(false)
    }
  }

  if (hasApproved) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
        <CheckCircle2 className="w-5 h-5 text-green-500" />
        <span className="text-sm font-semibold text-green-500">You Approved</span>
      </div>
    )
  }

  return (
    <button
      onClick={handleApprove}
      disabled={isApproving}
      className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isApproving ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Approving...</span>
        </>
      ) : (
        <>
          <CheckCircle2 className="w-5 h-5" />
          <span>Approve Proposal</span>
        </>
      )}
    </button>
  )
}

