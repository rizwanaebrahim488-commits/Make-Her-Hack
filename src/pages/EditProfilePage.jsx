import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { uploadProfileImage } from '../lib/supabase'
import { ArrowLeft, Sparkles, AlertCircle, CheckCircle2, Image } from 'lucide-react'
import AccountLayout from '../components/AccountLayout'

export default function EditProfilePage({ setCurrentView }) {
  const { user, profile } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [location, setLocation] = useState(profile?.location || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setLocation(profile.location || '')
      setBio(profile.bio || '')
      if (profile.avatar_url) setAvatarPreview(profile.avatar_url)
    }
  }, [profile])

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB.')
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setError(null)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    if (!fullName.trim()) {
      setError('Please enter your full name.')
      setLoading(false)
      return
    }

    let avatarUrl = profile?.avatar_url || avatarPreview || null

    if (avatarFile && user && supabase) {
      setUploading(true)
      const { url, error: upErr } = await uploadProfileImage(user.id, avatarFile)
      setUploading(false)
      if (upErr) {
        setError(upErr)
        setLoading(false)
        return
      }
      avatarUrl = url
    }

    try {
      if (supabase && user) {
        const { error: dbErr } = await supabase
          .from('profiles')
          .update({
            full_name: fullName.trim(),
            location: location.trim() || null,
            bio: bio.trim() || null,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
        if (dbErr) throw dbErr
      }
    } catch (err) {
      setError(err.message || 'Failed to save profile. Please try again.')
      setLoading(false)
      return
    }

    setLoading(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const avatarUrl = avatarPreview || profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName || 'user')}`

  return (
    <AccountLayout currentView="edit-profile" setCurrentView={setCurrentView} unreadCount={0}>
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-gray-100 text-gray-700 font-semibold text-sm border border-gray-200 shadow-xs transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My ReLoop</span>
        </button>

        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Update your public profile information. Only you can edit your own profile.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Profile updated successfully.</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-3">Profile Photo</label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={avatarUrl}
                    alt="Profile preview"
                    className="w-24 h-24 rounded-3xl object-cover border-2 border-gray-200"
                  />
                  {avatarFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarFile(null)
                        setAvatarPreview(profile?.avatar_url || null)
                      }}
                      className="absolute -right-2 -bottom-2 bg-white rounded-full p-1.5 shadow-md border border-gray-200 hover:bg-gray-50 transition"
                    >
                      <span className="w-3 h-3 text-gray-500">✕</span>
                    </button>
                  )}
                </div>
                <label className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-600 text-sm font-medium hover:border-emerald-500 hover:text-emerald-700 cursor-pointer transition">
                  <Image className="w-4 h-4" />
                  <span>Change photo</span>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
                {uploading && (
                  <span className="text-xs text-emerald-600 font-medium animate-pulse">Uploading...</span>
                )}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Max 5 MB. JPG, PNG, or WEBP.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Aiswarya S."
                className="w-full pl-4 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">General Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Perumbavoor"
                className="w-full pl-4 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
              />
              <p className="text-[10px] text-gray-400 mt-1">Shown to other community members.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">About / Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="A short intro about you..."
                className="w-full pl-4 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
            >
              {loading || uploading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Your authentication email and ID cannot be changed here.
        </p>
      </div>
    </AccountLayout>
  )
}

