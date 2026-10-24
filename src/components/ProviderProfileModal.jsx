import React, { useState, useEffect } from 'react'
import {
  Star,
  X,
  ShieldCheck,
  CheckCircle,
  MapPin,
  Calendar,
  MessageCircle,
  Award,
  Sparkles,
  UserCheck
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getProviderProfile } from '../lib/supabase'

export default function ProviderProfileModal({
  isOpen,
  onClose,
  providerId,
  initialProvider,
  onOpenRateModal,
  onOpenChat
}) {
  const { user } = useAuth()
  const [profile, setProfile] = useState(initialProvider || null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const loadData = async () => {
      const pid = providerId || initialProvider?.id
      if (!isOpen || !pid) return

      setLoading(true)
      try {
        const { data } = await getProviderProfile(pid)
        if (mounted && data) {
          setProfile(data)
          setReviews(data.reviews || [])
        }
      } catch (err) {
        console.warn('Failed to load provider profile:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    if (isOpen) {
      loadData()
    }

    // Listen for real-time review updates to refresh profile stats live
    const handleReviewUpdate = (e) => {
      const pid = providerId || initialProvider?.id
      if (e.detail && e.detail.providerId === pid) {
        loadData()
      }
    }
    window.addEventListener('reloop-review-submitted', handleReviewUpdate)

    return () => {
      mounted = false
      window.removeEventListener('reloop-review-submitted', handleReviewUpdate)
    }
  }, [isOpen, providerId, initialProvider])

  if (!isOpen) return null

  const isOwnProfile = Boolean(user && profile && user.id === profile.id)
  const avgRating = Number(profile?.avg_rating || 4.8).toFixed(1)
  const totalReviews = Number(profile?.total_reviews || reviews.length || 0)
  const isVerified = Boolean(profile?.is_verified ?? (Number(avgRating) >= 4.5 && totalReviews >= 5))

  // Calculate rating distribution
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)))
    ratingCounts[star] = (ratingCounts[star] || 0) + 1
  })

  const memberSinceYear = profile?.created_at
    ? new Date(profile.created_at).getFullYear()
    : profile?.member_since || '2023'

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all my-6 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Hero */}
        <div className="relative bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 p-6 sm:p-7 text-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="relative shrink-0">
              <img
                src={profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile?.full_name || 'Member')}`}
                alt={profile?.full_name || 'Provider Profile'}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-3 border-white/90 shadow-lg"
              />
              {isVerified && (
                <div 
                  className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-xs"
                  title="Verified Community Member"
                >
                  <CheckCircle className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="text-center sm:text-left flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white truncate">
                  {profile?.full_name || 'Community Member'}
                </h2>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-400/25 border border-emerald-300 text-emerald-100 text-xs font-bold backdrop-blur-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Verified Member</span>
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-emerald-100/90 font-medium line-clamp-1 mb-2">
                {profile?.badge || 'Active Circular Contributor'}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-emerald-100/80">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{profile?.location || 'Kerala, India'}</span>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Member since {memberSinceYear}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* Verified Trust Badge Callout */}
          {isVerified ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-extrabold text-emerald-900 text-sm">
                  Verified ReLoop Community Member
                </p>
                <p className="text-emerald-800/90 mt-0.5 leading-relaxed">
                  This provider has maintained a stellar rating of 4.5+ stars across 5+ verified exchanges. Verified members uphold reliable communication, timely handovers, and transparent item descriptions.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gray-200 text-gray-600 flex items-center justify-center shrink-0 mt-0.5">
                <Award className="w-5 h-5" />
              </div>
              <div className="text-xs text-gray-600">
                <p className="font-bold text-gray-900 text-sm">Community Contributor</p>
                <p className="mt-0.5">
                  Building trust in circular exchanges. Reach 4.5+ stars and 5+ completed exchanges to unlock the verified community trust badge.
                </p>
              </div>
            </div>
          )}

          {/* Rating Statistics Grid */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              Community Rating & Performance
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              {/* Big Score */}
              <div className="sm:col-span-5 text-center sm:text-left sm:border-r border-gray-100 sm:pr-5">
                <div className="flex items-baseline justify-center sm:justify-start gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
                    {avgRating}
                  </span>
                  <span className="text-lg font-bold text-gray-400">/ 5.0</span>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400 my-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(Number(avgRating))
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs font-semibold text-gray-500">
                  Based on {totalReviews} community {totalReviews === 1 ? 'review' : 'reviews'}
                </p>
              </div>

              {/* Progress Breakdown Bars */}
              <div className="sm:col-span-7 space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingCounts[star] || 0
                  const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-7 text-gray-600 font-bold flex items-center justify-end gap-0.5">
                        <span>{star}</span>
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-[11px] text-gray-400 text-right font-medium">
                        {count}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Action Row */}
          {!isOwnProfile && (
            <div className="flex flex-col sm:flex-row gap-3">
              {onOpenRateModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onOpenRateModal(profile)
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Star className="w-4 h-4 fill-white" />
                  <span>Rate & Review Provider</span>
                </button>
              )}

              {onOpenChat && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onOpenChat({
                      otherUserId: profile?.id,
                      otherName: profile?.full_name,
                      resourceTitle: 'Circular Exchange'
                    })
                  }}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Send Message</span>
                </button>
              )}
            </div>
          )}

          {/* Community Reviews List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <span>Community Feedback & Testimonials</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {reviews.length}
                </span>
              </h4>
            </div>

            {loading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-gray-100 rounded-2xl p-4 h-20" />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-gray-50 border border-gray-100">
                <Sparkles className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-bold text-gray-800">No reviews yet</p>
                <p className="text-xs text-gray-500 mt-1">
                  Be the first to review this provider after an exchange!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 hover:border-emerald-200 transition"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.reviewer?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(rev.reviewer?.full_name || 'Reviewer')}`}
                          alt={rev.reviewer?.full_name || 'Reviewer'}
                          className="w-8 h-8 rounded-full object-cover border border-emerald-100 shadow-2xs shrink-0"
                        />
                        <div>
                          <p className="text-xs font-bold text-gray-900">
                            {rev.reviewer?.full_name || 'Community Member'}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {rev.created_at ? new Date(rev.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Verified Exchange'}
                          </p>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= Number(rev.rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {rev.resource_title && (
                      <div className="inline-block px-2 py-0.5 mb-1.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                        Exchange: {rev.resource_title}
                      </div>
                    )}

                    {rev.comment && (
                      <p className="text-xs text-gray-700 leading-relaxed italic">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
