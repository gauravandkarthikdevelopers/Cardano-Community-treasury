'use client'

import { useState } from 'react'
import { useWallet } from '@/hooks/useWallet'
import { formatAddress, isValidCardanoAddress } from '@/lib/wallet'
import { Wallet, LogOut, Loader2, AlertCircle } from 'lucide-react'

export default function WalletConnect() {
  const { address, isConnecting, error, connect, connectManual, disconnect, isConnected } = useWallet()
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualAddress, setManualAddress] = useState('')
  const [manualError, setManualError] = useState('')

  const handleManualConnect = () => {
    setManualError('')
    if (!manualAddress.trim()) {
      setManualError('Please enter an address')
      return
    }
    try {
      connectManual(manualAddress.trim())
      setShowManualEntry(false)
      setManualAddress('')
    } catch (err: any) {
      setManualError(err.message || 'Invalid address')
    }
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
          <Wallet className="w-4 h-4 text-green-500" />
          <span className="text-sm font-mono text-green-500">{formatAddress(address)}</span>
        </div>
        <button
          onClick={disconnect}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-500">Disconnect</span>
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={connect}
        disabled={isConnecting}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isConnecting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <Wallet className="w-5 h-5" />
            <span>Connect Wallet</span>
          </>
        )}
      </button>
      {error && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          {!showManualEntry && (
            <button
              onClick={() => setShowManualEntry(true)}
              className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
            >
              Or enter address manually (for testing)
            </button>
          )}
        </div>
      )}
      {showManualEntry && (
        <div className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Enter Cardano Address (for testing):
          </label>
          <input
            type="text"
            value={manualAddress}
            onChange={(e) => {
              setManualAddress(e.target.value)
              setManualError('')
            }}
            placeholder="addr1..."
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {manualError && (
            <p className="text-xs text-red-500">{manualError}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleManualConnect}
              className="flex-1 px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Connect
            </button>
            <button
              onClick={() => {
                setShowManualEntry(false)
                setManualAddress('')
                setManualError('')
              }}
              className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

