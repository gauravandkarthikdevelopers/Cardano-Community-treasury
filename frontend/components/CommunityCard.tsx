'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Users, Wallet, Calendar } from 'lucide-react'
import type { Community } from '@/lib/types'

interface CommunityCardProps {
    community: Community & { memberCount?: number; leaderCount?: number }
}

export default function CommunityCard({ community }: CommunityCardProps) {
    return (
        <Link href={`/community/${community.id}`}>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all shadow-sm hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {community.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                            {community.description}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Wallet className="w-4 h-4" />
                        <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                            {community.currentBalance.toLocaleString()} ADA
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">
                            {community.memberCount || 0} members
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500 text-xs">
                        <Calendar className="w-3 h-3" />
                        <span>
                            {formatDistanceToNow(new Date(community.createdAt), { addSuffix: true })}
                        </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                        {community.approvalThreshold} leader{community.approvalThreshold !== 1 ? 's' : ''} required
                    </div>
                </div>
            </div>
        </Link>
    )
}

