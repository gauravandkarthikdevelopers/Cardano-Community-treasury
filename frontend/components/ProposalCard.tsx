'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { CheckCircle2, Clock, XCircle, PlayCircle } from 'lucide-react'
import type { Proposal } from '@/lib/types'

interface ProposalCardProps {
    proposal: Proposal & { approvals?: string[]; communityName?: string }
    isLeader?: boolean
    hasApproved?: boolean
    totalLeaders?: number
}

export default function ProposalCard({
    proposal,
    isLeader = false,
    hasApproved = false,
    totalLeaders = 0
}: ProposalCardProps) {
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
        <Link href={`/proposal/${proposal.id}`}>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all shadow-sm hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {proposal.title}
                            </h3>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-md border ${config.color} text-xs font-semibold`}>
                                <config.icon className="w-3 h-3" />
                                <span>{config.label}</span>
                            </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                            {proposal.description}
                        </p>
                        {proposal.category && (
                            <span className="inline-block px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-md mb-3">
                                {proposal.category}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {proposal.amount.toLocaleString()} ADA
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                            {formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true })}
                        </div>
                    </div>
                    {proposal.status === 'pending' && isLeader && (
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                            {hasApproved ? '✓ You approved' : `${approvalCount}/${totalLeaders} approvals`}
                        </div>
                    )}
                    {canExecute && (
                        <div className="text-xs text-green-600 dark:text-green-400 font-semibold">
                            Ready to execute
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}

