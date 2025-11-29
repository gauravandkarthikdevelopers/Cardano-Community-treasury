'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@/hooks/useWallet'
import { Plus, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CreateCommunityForm() {
  const router = useRouter()
  const { address } = useWallet()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    treasuryAddress: '',
    initialBalance: '',
    approvalThreshold: '2',
    leaders: [{ address: '', name: '' }],
    members: [{ address: '', name: '' }]
  })

  const addLeader = () => {
    setFormData({
      ...formData,
      leaders: [...formData.leaders, { address: '', name: '' }]
    })
  }

  const addMember = () => {
    setFormData({
      ...formData,
      members: [...formData.members, { address: '', name: '' }]
    })
  }

  const removeLeader = (index: number) => {
    setFormData({
      ...formData,
      leaders: formData.leaders.filter((_, i) => i !== index)
    })
  }

  const removeMember = (index: number) => {
    setFormData({
      ...formData,
      members: formData.members.filter((_, i) => i !== index)
    })
  }

  const updateLeader = (index: number, field: 'address' | 'name', value: string) => {
    const newLeaders = [...formData.leaders]
    newLeaders[index][field] = value
    setFormData({ ...formData, leaders: newLeaders })
  }

  const updateMember = (index: number, field: 'address' | 'name', value: string) => {
    const newMembers = [...formData.members]
    newMembers[index][field] = value
    setFormData({ ...formData, members: newMembers })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (formData.leaders.length < parseInt(formData.approvalThreshold)) {
      toast.error('Number of leaders must be at least equal to approval threshold')
      return
    }

    // Validate that all leaders have addresses
    const validLeaders = formData.leaders.filter(l => l.address.trim() !== '')
    if (validLeaders.length === 0) {
      toast.error('Please add at least one leader with a valid wallet address')
      return
    }

    setIsSubmitting(true)

    try {
      const requestBody = {
        name: formData.name,
        description: formData.description,
        treasuryAddress: formData.treasuryAddress || address,
        initialBalance: parseFloat(formData.initialBalance) || 0,
        approvalThreshold: parseInt(formData.approvalThreshold),
        createdBy: address,
        leaders: validLeaders,
        members: formData.members.filter(m => m.address.trim() !== '')
      }

      console.log('Creating community with data:', requestBody)

      const response = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Error response:', errorData)
        throw new Error(errorData.error || errorData.message || `Failed to create community (${response.status})`)
      }

      const responseData = await response.json()
      console.log('Community created:', responseData)
      
      if (!responseData.community || !responseData.community.id) {
        throw new Error('Invalid response from server')
      }

      toast.success('Community created successfully!')
      router.push(`/community/${responseData.community.id}`)
    } catch (error: any) {
      console.error('Error creating community:', error)
      toast.error(error.message || 'Failed to create community. Please check the console for details.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Community Name *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="e.g., Campus Robotics Club"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Describe your community treasury..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Treasury Address
        </label>
        <input
          type="text"
          value={formData.treasuryAddress}
          onChange={(e) => setFormData({ ...formData, treasuryAddress: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
          placeholder={address || "Enter Cardano address or leave blank to use your wallet"}
        />
        <p className="mt-1 text-xs text-gray-500">Leave blank to use your connected wallet address</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Initial Balance (ADA)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={formData.initialBalance}
            onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Approval Threshold *
          </label>
          <input
            type="number"
            required
            min="1"
            value={formData.approvalThreshold}
            onChange={(e) => setFormData({ ...formData, approvalThreshold: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">All leaders must approve</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Leaders *
          </label>
          <button
            type="button"
            onClick={addLeader}
            className="flex items-center gap-1 px-3 py-1 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
          >
            <Plus className="w-4 h-4" />
            Add Leader
          </button>
        </div>
        {formData.leaders.map((leader, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              required
              value={leader.address}
              onChange={(e) => updateLeader(index, 'address', e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              placeholder="Wallet address"
            />
            <input
              type="text"
              value={leader.name}
              onChange={(e) => updateLeader(index, 'name', e.target.value)}
              className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Name (optional)"
            />
            {formData.leaders.length > 1 && (
              <button
                type="button"
                onClick={() => removeLeader(index)}
                className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Members
          </label>
          <button
            type="button"
            onClick={addMember}
            className="flex items-center gap-1 px-3 py-1 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
          >
            <Plus className="w-4 h-4" />
            Add Member
          </button>
        </div>
        {formData.members.map((member, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={member.address}
              onChange={(e) => updateMember(index, 'address', e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              placeholder="Wallet address"
            />
            <button
              type="button"
              onClick={() => removeMember(index)}
              className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Creating...
          </span>
        ) : (
          'Create Community'
        )}
      </button>
    </form>
  )
}

