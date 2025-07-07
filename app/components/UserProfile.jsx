'use client'

import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { uploadFile, getPublicUrl, STORAGE_BUCKETS, generateFileName } from '../../lib/storage'
import AuthModal from './AuthModal'

export default function UserProfile() {
  const { user, loading, signOut } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(null)

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file || !user) return

    setUploading(true)
    try {
      // Generate unique filename
      const fileName = generateFileName(file.name, user.id)
      
      // Upload to avatars bucket
      const { data, error } = await uploadFile(
        STORAGE_BUCKETS.AVATARS,
        file,
        fileName,
        { upsert: true }
      )

      if (error) throw error

      // Get public URL
      const publicUrl = getPublicUrl(STORAGE_BUCKETS.AVATARS, fileName)
      setAvatarUrl(publicUrl)
      
      console.log('Upload successful:', data)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
        <span className="text-gray-400">Loading...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setAuthModalOpen(true)}
          className="neuro-btn neuro-btn-primary"
        >
          Sign In
        </button>
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
      </>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Avatar */}
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-medium text-gray-300">
              {user.email?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        
        {/* Upload overlay */}
        <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {/* User info */}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-white">
          {user.email}
        </span>
        <span className="text-xs text-gray-400">
          {uploading ? 'Uploading...' : 'Authenticated'}
        </span>
      </div>

      {/* Sign out button */}
      <button
        onClick={signOut}
        className="neuro-btn text-sm px-3 py-1"
        title="Sign Out"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  )
} 