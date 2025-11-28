'use client'

import { formatDistanceToNow } from 'date-fns'
import { ArrowRight, ExternalLink } from 'lucide-react'

interface Transaction {
  id: string
  proposalId: string
  communityId: string
  amount: number
  recipientAddress: string
  executedBy: string
  executedAt: number
  txHash?: string
  proposalTitle?: string
}

interface TransactionListProps {
  transactions: Transaction[]
}

export default function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p>No transactions yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight className="w-4 h-4 text-purple-500" />
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {tx.proposalTitle || 'Transaction'}
                </h4>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>
                  <span className="font-medium">Amount:</span>{' '}
                  <span className="text-purple-600 dark:text-purple-400 font-semibold">
                    {tx.amount.toLocaleString()} ADA
                  </span>
                </p>
                <p>
                  <span className="font-medium">To:</span>{' '}
                  <span className="font-mono text-xs">{tx.recipientAddress.slice(0, 20)}...</span>
                </p>
                <p>
                  <span className="font-medium">By:</span>{' '}
                  <span className="font-mono text-xs">{tx.executedBy.slice(0, 20)}...</span>
                </p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(tx.executedAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            {tx.txHash && (
              <a
                href={`https://cardanoscan.io/transaction/${tx.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-xs">View</span>
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

