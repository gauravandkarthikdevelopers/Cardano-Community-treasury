'use client'

import { useState, useEffect } from 'react'
import { connectWallet, isValidCardanoAddress } from '@/lib/wallet'

let globalWalletAddress: string | null = null
const walletListeners = new Set<(addr: string | null) => void>()

function notifyWalletListeners(addr: string | null) {
  walletListeners.forEach((listener) => listener(addr))
}

function readAddressFromStorage() {
  if (typeof window === 'undefined') return null
  const saved = localStorage.getItem('walletAddress')
  if (saved && isValidCardanoAddress(saved)) {
    return saved
  }
  return null
}

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const hydrateAddress = () => {
      if (globalWalletAddress) {
        setAddress(globalWalletAddress)
        return
      }
      const stored = readAddressFromStorage()
      if (stored) {
        globalWalletAddress = stored
        setAddress(stored)
      }
    }

    hydrateAddress()

    const listener = (addr: string | null) => setAddress(addr)
    walletListeners.add(listener)

    // Sync with storage when mounting (covers manual localStorage changes)
    if (typeof window !== 'undefined') {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'walletAddress') {
          const newValue = e.newValue
          if (newValue && isValidCardanoAddress(newValue)) {
            globalWalletAddress = newValue
            notifyWalletListeners(newValue)
          } else if (!newValue) {
            globalWalletAddress = null
            notifyWalletListeners(null)
          }
        }
      }
      window.addEventListener('storage', handleStorageChange)
      return () => {
        walletListeners.delete(listener)
        window.removeEventListener('storage', handleStorageChange)
      }
    }

    return () => walletListeners.delete(listener)
  }, [])

  const connect = async () => {
    setIsConnecting(true)
    setError(null)
    try {
      const walletAddress = await connectWallet()
      if (walletAddress) {
        globalWalletAddress = walletAddress
        notifyWalletListeners(walletAddress)
        if (typeof window !== 'undefined') {
          localStorage.setItem('walletAddress', walletAddress)
        }
      } else {
        setError('Failed to connect wallet')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const connectManual = (manualAddress: string) => {
    if (!isValidCardanoAddress(manualAddress)) {
      throw new Error('Invalid Cardano address format')
    }
    globalWalletAddress = manualAddress
    notifyWalletListeners(manualAddress)
    if (typeof window !== 'undefined') {
      localStorage.setItem('walletAddress', manualAddress)
    }
  }

  const disconnect = () => {
    globalWalletAddress = null
    notifyWalletListeners(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('walletAddress')
    }
  }

  return {
    address,
    isConnecting,
    error,
    connect,
    connectManual,
    disconnect,
    isConnected: !!address
  }
}

