// Cardano wallet utilities
import { Address } from '@emurgo/cardano-serialization-lib-browser'

export function isValidCardanoAddress(address: string): boolean {
  // Basic validation - Cardano addresses start with 'addr1' for mainnet or 'addr_test1' for testnet
  if (/^addr1[a-z0-9]+$/i.test(address) || /^addr_test1[a-z0-9]+$/i.test(address)) {
    return true
  }
  // Some wallets return hex-encoded addresses
  const cleaned = address.startsWith('0x') ? address.slice(2) : address
  return /^[0-9a-f]+$/i.test(cleaned) && cleaned.length >= 50
}

export function formatAddress(address: string): string {
  if (address.length <= 20) return address
  return `${address.slice(0, 10)}...${address.slice(-10)}`
}

function hexToBytes(hex: string): Uint8Array {
  const cleaned = hex.startsWith('0x') ? hex.slice(2) : hex
  const bytes = new Uint8Array(cleaned.length / 2)
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes[i / 2] = parseInt(cleaned.substring(i, i + 2), 16)
  }
  return bytes
}

function normalizeAddress(addr: string | null): string | null {
  if (!addr) return null
  if (addr.startsWith('addr1') || addr.startsWith('addr_test1')) {
    return addr
  }
  try {
    const bytes = hexToBytes(addr)
    const bech32 = Address.from_bytes(bytes).to_bech32()
    return bech32
  } catch (error) {
    console.warn('Failed to normalize address:', addr, error)
    return null
  }
}

export async function connectWallet(): Promise<string | null> {
  try {
    // Check if wallet is available
    if (typeof window === 'undefined') {
      throw new Error('Window object not available')
    }
    
    // Try to connect with Cardano wallet API
    const cardano = (window as any).cardano
    
    if (!cardano) {
      throw new Error('No Cardano wallet found. Please install a Cardano wallet extension (Eternal, Nami, or Flint).')
    }

    // Try Eternal wallet first, then others
    let walletName = 'eternl'
    let wallet: any = null
    
    console.log('Available wallets:', Object.keys(cardano))
    
    if (cardano.eternl) {
      walletName = 'eternl'
      wallet = cardano.eternl
      console.log('Using Eternal wallet')
    } else if (cardano.nami) {
      walletName = 'nami'
      wallet = cardano.nami
      console.log('Using Nami wallet')
    } else if (cardano.flint) {
      walletName = 'flint'
      wallet = cardano.flint
      console.log('Using Flint wallet')
    } else if (cardano.gero) {
      walletName = 'gero'
      wallet = cardano.gero
      console.log('Using Gero wallet')
    } else if (cardano.typhon) {
      walletName = 'typhon'
      wallet = cardano.typhon
      console.log('Using Typhon wallet')
    } else {
      throw new Error('No supported wallet found. Please install Eternal, Nami, Flint, Gero, or Typhon.')
    }

    if (!wallet) {
      throw new Error(`Wallet ${walletName} not available`)
    }

    console.log('Enabling wallet:', walletName)
    // Enable the wallet
    const walletAPI = await wallet.enable()
    
    if (!walletAPI) {
      throw new Error('Wallet connection rejected or failed')
    }
    
    console.log('Wallet API enabled:', walletAPI)

    // Helper function to extract address from various formats
    const extractAddress = (addr: any): string | null => {
      if (typeof addr === 'string') {
        return normalizeAddress(addr)
      }
      if (addr && typeof addr === 'object') {
        // Some wallets return objects with address property
        if (addr.address) return normalizeAddress(addr.address)
        if (addr.addr) return normalizeAddress(addr.addr)
        // Some return arrays with hex, need to convert
        if (Array.isArray(addr)) {
          // This might be a CBOR encoded address, would need decoding
          // For now, try to find a string in the array
          const strAddr = addr.find((a: any) => typeof a === 'string')
          if (strAddr) return normalizeAddress(strAddr)
        }
      }
      return null
    }

    // Try different methods to get addresses based on CIP-30 standard
    let addresses: any[] = []
    let address: string | null = null
    
    try {
      // Try getUsedAddresses first (CIP-30 standard)
      addresses = await walletAPI.getUsedAddresses()
      if (addresses && addresses.length > 0) {
        address = extractAddress(addresses[0])
        if (address) return address
      }
    } catch (e) {
      console.log('getUsedAddresses failed, trying alternatives:', e)
    }

    try {
      // Fallback to getUnusedAddresses
      addresses = await walletAPI.getUnusedAddresses()
      if (addresses && addresses.length > 0) {
        address = extractAddress(addresses[0])
        if (address) return address
      }
    } catch (e) {
      console.log('getUnusedAddresses failed, trying alternatives:', e)
    }

    try {
      // Fallback to getChangeAddress (returns single address)
      const changeAddress = await walletAPI.getChangeAddress()
      if (changeAddress) {
        address = extractAddress(changeAddress)
        if (address) return address
      }
    } catch (e) {
      console.log('getChangeAddress failed:', e)
    }

    // Some wallets might have a different API - try direct methods
    try {
      if (walletAPI.getAddresses && typeof walletAPI.getAddresses === 'function') {
        addresses = await walletAPI.getAddresses()
        if (addresses && addresses.length > 0) {
          address = extractAddress(addresses[0])
          if (address) return address
        }
      }
    } catch (e) {
      console.log('getAddresses failed:', e)
    }

    // Last resort: check if walletAPI itself has address info
    if (walletAPI.address) {
      address = extractAddress(walletAPI.address)
      if (address) return address
    }

    throw new Error('Could not retrieve address from wallet. Please try again or check your wallet extension.')
  } catch (error: any) {
    console.error('Wallet connection error:', error)
    // Re-throw with user-friendly message
    if (error.message) {
      throw error
    }
    throw new Error('Failed to connect wallet. Please make sure your wallet extension is installed and unlocked.')
  }
}

export async function disconnectWallet(): Promise<void> {
  // Wallet disconnection is typically handled by the wallet extension
  // This is a placeholder for any cleanup needed
}

