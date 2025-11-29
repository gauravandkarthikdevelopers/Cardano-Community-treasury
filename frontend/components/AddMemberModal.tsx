'use client'

import { useState } from 'react'
import { Loader2, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface AddMemberModalProps {
    communityId: string
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function AddMemberModal({ communityId, isOpen, onClose, onSuccess }: AddMemberModalProps) {
    const [address, setAddress] = useState('')
    const [name, setName] = useState('')
    const [role, setRole] = useState<'member' | 'leader'>('member')
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!address.trim()) {
            toast.error('Wallet address is required')
            return
        }

        setIsSubmitting(true)

        try {
            const response = await fetch(`/api/communities/${communityId}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletAddress: address,
                    name: name || undefined,
                    isLeader: role === 'leader'
                })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to add member')
            }

            toast.success(`${role === 'leader' ? 'Leader' : 'Member'} added successfully`)
            setAddress('')
            setName('')
            setRole('member')
            onSuccess()
            onClose()
        } catch (error: any) {
            console.error('Error adding member:', error)
            toast.error(error.message || 'Failed to add member')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Add New Member
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Wallet Address *
                        </label>
                        <input
                            type="text"
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                            placeholder="addr1..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Name (Optional)
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Role
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="role"
                                    value="member"
                                    checked={role === 'member'}
                                    onChange={() => setRole('member')}
                                    className="text-purple-600 focus:ring-purple-500"
                                />
                                <span className="text-gray-900 dark:text-white">Member</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="role"
                                    value="leader"
                                    checked={role === 'leader'}
                                    onChange={() => setRole('leader')}
                                    className="text-purple-600 focus:ring-purple-500"
                                />
                                <span className="text-gray-900 dark:text-white">Leader</span>
                            </label>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {role === 'leader'
                                ? 'Leaders can approve proposals and manage the community.'
                                : 'Members can create proposals but cannot approve them.'}
                        </p>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                'Add Member'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
