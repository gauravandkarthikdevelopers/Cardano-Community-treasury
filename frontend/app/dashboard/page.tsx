'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useWallet } from '@/hooks/useWallet'
import WalletConnect from '@/components/WalletConnect'
import CommunityCard from '@/components/CommunityCard'
import { Plus, Wallet, Loader2 } from 'lucide-react'
import type { Community } from '@/lib/types'

export default function Dashboard() {
  const { address, isConnected } = useWallet()
  const [communities, setCommunities] = useState<(Community & { memberCount?: number; leaderCount?: number })[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (address) {
      fetchCommunities()
    } else {
      setIsLoading(false)
    }
  }, [address])

  const fetchCommunities = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/communities?memberOf=${address}`)
      if (response.ok) {
        const data = await response.json()
        setCommunities(data.communities || [])
      }
    } catch (error) {
      console.error('Error fetching communities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              CCT Dashboard
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/community/create"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Community</span>
            </Link>
            <WalletConnect />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="max-w-2xl mx-auto text-center py-20">
            <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Please connect your Cardano wallet to view your communities
            </p>
            <WalletConnect />
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : communities.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-20">
            <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No Communities Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Create your first community treasury to get started
            </p>
            <Link
              href="/community/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Community
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Your Communities
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your community treasuries and proposals
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities.map((community) => (
                <CommunityCard key={community.id} community={community} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

