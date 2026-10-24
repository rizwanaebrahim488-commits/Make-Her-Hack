import React, { useState, useEffect } from 'react'
import { Star, X, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { submitReview, getUserReviewForResource } from '../lib/supabase'

const RATING_LABELS = {
  1: 'Needs Improvement — 1 Star',
  2: 'Below Average — 2 Stars',
  3: 'Good & Satisfactory — 3 Stars',
  4: 'Very Good & Helpful — 4 Stars',
  5: 'Outstanding & Highly Recommended! — 5 Stars 🌟'
}

export default function RateProviderModal({
  isOpen,
  onClose,
  resource,
  provider: passedProvider,
  onReviewSubmitted
}) {
  const { user, profile } = useAuth()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loadingExisting, setLoadingExisting] = useState(false)
  const [existingReview, setExistingReview] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const provider = passedProvider || resource?.provider || {}
  const providerId = provider.id || resource?.provider_id
  const isSelf = Boolean(user && providerId && user.id === providerId)

  // Load existing user review if already submitted for this resource
  useEffect(() => {
    let mounted = true
    const checkExisting = async () => {
      if (!isOpen || !user || !resource?.id) return
      setLoadingExisting(true)
      setErrorMessage('')
      setSuccessMessage('')
      try {
        const { data: existing } = await getUserReviewForResource(user.id, resource.id)
        if (mounted && existing) {
          setExistingReview(existing)
          setRating(Number(existing.rating) || 5)
          setComment(existing.comment || '')
        } else if (mounted) {
          setExistingReview(null)
          setRating(0)
          setComment('')
        }
      } catch (err) {
        console.warn('Error checking existing review:', err)
      } finally {
        if (mounted) setLoadingExisting(false)
      }
    }

    if (isOpen) {
      checkExisting()
    }
    return () => {
      mounted = false
    }
  }, [isOpen, user, resource?.id])

  if (!isOpen) return null

  const activeRating = hoverRating || rating

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      setErrorMessage('Please sign in or create an account to submit a review.')
      return
    }
    if (isSelf) {
      setErrorMessage('You cannot submit a review for your own resource listing.')
      return
    }
    if (rating === 0) {
      setErrorMessage('Please tap a star to give a rating between 1 and 5.')
      return
    }

    setSubmitting(true)
    setErrorMessage('')
    try {
      const reviewerName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Community Member'
      const reviewerAvatar = profile?.avatar_url || user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(reviewerName)}`

      const { data, newStats, error } = await submitReview({
        reviewerId: user.id,
        providerId,
        resourceId: resource?.id,
        rating,
        comment,
        reviewerName,
        reviewerAvatar,
        resourceTitle: resource?.title || 'Community Resource'
      })

      if (error) {
        setErrorMessage(error)
      } else {
        setSuccessMessage(existingReview ? 'Your review has been updated!' : 'Review submitted successfully! Thank you for building community trust.')
        if (onReviewSubmitted) {
          onReviewSubmitted({ review: data, newStats })
        }
        setTimeout(() => {
          onClose()
        }, 1200)
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1 text-emerald-200 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Community Trust & Ratings</span>
          </div>
          <h3 className="text-xl font-extrabold text-white">
            {existingReview ? 'Update Your Review' : 'Rate & Review Provider'}
          </h3>
          <p className="text-xs text-emerald-100/90 mt-1 line-clamp-1">
            Exchange for &ldquo;{resource?.title || 'Resource'}&rdquo;
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7">
          {/* Provider Card Snippet */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-100 mb-5">
            <img
              src={provider.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(provider.full_name || 'Provider')}`}
              alt={provider.full_name || 'Provider'}
              className="w-11 h-11 rounded-full object-cover border-2 border-emerald-200 shadow-2xs shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {provider.full_name || 'Community Member'}
                </p>
                {provider.is_verified && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                    ✓ Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                Current Rating: ⭐ {provider.avg_rating || '5.0'} ({provider.total_reviews || 0} reviews)
              </p>
            </div>
          </div>

          {/* Self-Rating Guardrail */}
          {isSelf && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold">Self-Review Not Allowed</p>
                <p className="text-xs mt-0.5">
                  You are the provider of this resource listing. Users can only review exchanges provided by other community members.
                </p>
              </div>
            </div>
          )}

          {/* Unauthenticated Guardrail */}
          {!user && (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-sm flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />
              <div>
                <p className="font-bold">Sign In to Review</p>
                <p className="text-xs mt-0.5">
                  Please log in or sign up to rate this provider and contribute to our verified circular community.
                </p>
              </div>
            </div>
          )}

          {/* Existing review badge if updating */}
          {existingReview && !successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>You previously reviewed this resource. Submitting will update your rating and feedback.</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm flex items-center gap-3 mb-4 font-semibold">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {!isSelf && user && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Star Rating Picker */}
              <div className="text-center py-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Select Your Overall Rating
                </label>
                <div className="flex items-center justify-center gap-2 sm:gap-3 py-1">
                  {[1, 2, 3, 4, 5].map((starValue) => {
                    const isFilled = starValue <= activeRating
                    return (
                      <button
                        key={starValue}
                        type="button"
                        onClick={() => setRating(starValue)}
                        onMouseEnter={() => setHoverRating(starValue)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 rounded-full focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition transform hover:scale-115 active:scale-95 cursor-pointer"
                        aria-label={`${starValue} Stars`}
                      >
                        <Star
                          className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors ${
                            isFilled
                              ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                              : 'text-gray-300 hover:text-amber-200'
                          }`}
                        />
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs font-semibold text-emerald-700 min-h-[1.25rem] mt-2 transition-all">
                  {RATING_LABELS[activeRating] || 'Tap a star to rate from 1 to 5'}
                </p>
              </div>

              {/* Optional Feedback Comment */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Share Your Experience (Optional)
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={`Describe your exchange with ${provider.full_name || 'the provider'}. Was the resource in described condition? How was the communication and handover?`}
                  maxLength={500}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition outline-hidden resize-none placeholder:text-gray-400"
                />
                <div className="flex justify-between items-center text-[11px] text-gray-400 mt-1">
                  <span>Honest community reviews foster circular trust.</span>
                  <span>{comment.length}/500</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || rating === 0 || loadingExisting}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{existingReview ? 'Update Review' : 'Submit Review'}</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {(!user || isSelf) && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
