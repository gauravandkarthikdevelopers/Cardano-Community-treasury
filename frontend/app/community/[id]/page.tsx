'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useWallet } from '@/hooks/useWallet'
import WalletConnect from '@/components/WalletConnect'
import ProposalCard from '@/components/ProposalCard'
import TransactionList from '@/components/TransactionList'
import CreateProposalForm from '@/components/CreateProposalForm'
import ApprovalButton from '@/components/ApprovalButton'
import AddMemberModal from '@/components/AddMemberModal'
import Link from 'next/link'
import { ArrowLeft, Wallet, Users, Plus, Loader2, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Community, Proposal, Transaction } from '@/lib/types'

export default function CommunityDetail() {
    const params = useParams()
    const router = useRouter()
    const { address } = useWallet()
    const [community, setCommunity] = useState<Community & { leaders?: any[]; members?: string[]; memberCount?: number } | null>(null)
    const [proposals, setProposals] = useState<(Proposal & { approvals?: string[] })[]>([])
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showCreateProposal, setShowCreateProposal] = useState(false)
    const [showAddMember, setShowAddMember] = useState(false)
    const [activeTab, setActiveTab] = useState<'proposals' | 'transactions' | 'members'>('proposals')

    useEffect(() => {
        if (params.id) {
            fetchCommunity()
            fetchProposals()
            fetchTransactions()
        }
    }, [params.id])

    const fetchCommunity = async () => {
        try {
            const response = await fetch(`/api/communities/${params.id}`)
            if (response.ok) {
                const data = await response.json()
                setCommunity(data.community)
            }
        } catch (error) {
            console.error('Error fetching community:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchProposals = async () => {
        try {
            const response = await fetch(`/api/proposals?communityId=${params.id}`)
            if (response.ok) {
                const data = await response.json()
                setProposals(data.proposals || [])
            }
        } catch (error) {
            console.error('Error fetching proposals:', error)
        }
    }

    const fetchTransactions = async () => {
        try {
            const response = await fetch(`/api/transactions?communityId=${params.id}`)
            if (response.ok) {
                const data = await response.json()
                setTransactions(data.transactions || [])
            }
        } catch (error) {
            console.error('Error fetching transactions:', error)
        }
    }

    const handleProposalCreated = () => {
        setShowCreateProposal(false)
        fetchProposals()
    }

    const handleApproval = () => {
        fetchProposals()
    }

    const handleExecute = async (proposalId: string) => {
        if (!address) {
            toast.error('Please connect your wallet')
            return
        }

        try {
            const response = await fetch(`/api/proposals/${proposalId}/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ executedBy: address })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to execute proposal')
            }

            toast.success('Proposal executed successfully!')
            fetchProposals()
            fetchTransactions()
            fetchCommunity()
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

    if (!community) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Community not found
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

    const isLeader = address && community.leaders?.some(l => l.address === address)
    const totalLeaders = community.leaders?.length || 0

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Navigation */}
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Dashboard</span>
                    </Link>
                    <WalletConnect />
                </div>
            </nav>

            {/* Community Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {community.name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {community.description}
                    </p>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {community.currentBalance.toLocaleString()} ADA
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Users className="w-5 h-5" />
                            <span>{community.memberCount || 0} members</span>
                        </div>
                        {isLeader && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="text-sm font-semibold text-green-500">Leader</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                {/* Tabs */}
                <div className="flex items-center gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('proposals')}
                        className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'proposals'
                            ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Proposals
                    </button>
                    <button
                        onClick={() => setActiveTab('transactions')}
                        className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'transactions'
                            ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Transactions
                    </button>
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'members'
                            ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Members
                    </button>
                </div>

                {/* Create Proposal Button */}
                {activeTab === 'proposals' && !showCreateProposal && (
                    <div className="mb-6">
                        <button
                            onClick={() => setShowCreateProposal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Create Proposal
                        </button>
                    </div>
                )}

                {/* Create Proposal Form */}
                {showCreateProposal && (
                    <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Create Funding Proposal
                            </h2>
                            <button
                                onClick={() => setShowCreateProposal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                        <CreateProposalForm communityId={params.id as string} />
                    </div>
                )}

                {/* Proposals Tab */}
                {activeTab === 'proposals' && (
                    <div className="space-y-4">
                        {proposals.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                <p>No proposals yet</p>
                            </div>
                        ) : (
                            proposals.map((proposal) => {
                                const hasApproved = address && proposal.approvals?.includes(address)
                                const canExecute = proposal.status === 'approved' && (proposal.approvals?.length || 0) >= totalLeaders

                                return (
                                    <div key={proposal.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                        <ProposalCard
                                            proposal={proposal}
                                            isLeader={isLeader || false}
                                            hasApproved={hasApproved || false}
                                            totalLeaders={totalLeaders}
                                        />
                                        {isLeader && proposal.status === 'pending' && (
                                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                <ApprovalButton
                                                    proposalId={proposal.id}
                                                    hasApproved={hasApproved || false}
                                                    approvalCount={proposal.approvals?.length || 0}
                                                    totalLeaders={totalLeaders}
                                                    onApproval={handleApproval}
                                                />
                                            </div>
                                        )}
                                        {canExecute && (
                                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                <button
                                                    onClick={() => handleExecute(proposal.id)}
                                                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                                                >
                                                    Execute Transaction
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )
                            })
                        )}
                    </div>
                )}

                {/* Transactions Tab */}
                {activeTab === 'transactions' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <TransactionList transactions={transactions} />
                    </div>
                )}

                {/* Members Tab */}
                {activeTab === 'members' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Leaders</h3>
                            {isLeader && (
                                <button
                                    onClick={() => setShowAddMember(true)}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Member
                                </button>
                            )}
                        </div>
                        <div className="space-y-2 mb-6">
                            {community.leaders?.map((leader, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">{leader.name || 'Leader'}</p>
                                        <p className="text-sm font-mono text-gray-600 dark:text-gray-400">{leader.address}</p>
                                    </div>
                                    <span className="px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold rounded">
                                        Leader
                                    </span>
                                </div>
                            ))}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Members</h3>
                        <div className="space-y-2">
                            {community.members && community.members.length > 0 ? (
                                community.members.map((member, index) => (
                                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <p className="font-mono text-sm text-gray-900 dark:text-white">{member}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400">No members yet</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <AddMemberModal
                communityId={params.id as string}
                isOpen={showAddMember}
                onClose={() => setShowAddMember(false)}
                onSuccess={() => {
                    fetchCommunity()
                    toast.success('Member added successfully')
                }}
            />
        </div>
    )
}

