'use client'

import { useWallet } from '@/hooks/useWallet'
import WalletConnect from '@/components/WalletConnect'
import CreateCommunityForm from '@/components/CreateCommunityForm'
import Link from 'next/link'
import { ArrowLeft, Wallet } from 'lucide-react'

export default function CreateCommunity() {
  const { isConnected } = useWallet()

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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Create Community Treasury
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Set up a new decentralized treasury for your community. Configure leaders, approval thresholds, and initial balance.
            </p>
          </div>

          {!isConnected ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
              <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Please connect your Cardano wallet to create a community
              </p>
              <WalletConnect />
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
              <CreateCommunityForm />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

