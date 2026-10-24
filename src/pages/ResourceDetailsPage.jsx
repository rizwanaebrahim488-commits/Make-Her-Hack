import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getResourceById,
  toggleWishlist,
  getUserWishlist,
  createRequest,
  getRequestsByRequester,
  updateRequestStatus,
  sendMessage,
  getReviewsForProvider,
  getUserReviewForResource,
} from '../lib/supabase'
import ResourceMap from '../components/ResourceMap'
import RateProviderModal from '../components/RateProviderModal'
import ProviderProfileModal from '../components/ProviderProfileModal'
import { awardEcoPoints } from '../lib/ecoPoints'
import {
  ArrowLeft,
  Heart,
  MapPin,
  Mail,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock as ClockIcon,
  User,
  Package,
  RefreshCw,
  Megaphone,
  Wrench,
  Calendar,
  Truck,
  Edit,
  ChevronLeft,
  ChevronRight,
  Star,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react'

const TYPE_LABELS = {
  item: 'Item',
  service: 'Service',
  disposal: 'Disposal / Recycling',
  plant: 'Plant',
  other: 'Other Resource',
  request: 'Community Request',
}

const MAIN_ACTIONS = {
  item: 'Request This Item',
  service: 'Request Service',
  disposal: 'Get Directions / Contact',
  plant: 'Request Plant',
  other: 'Contact Provider',
  request: 'Offer to Help',
}

const TYPE_ICONS = {
  item: Package,
  service: RefreshCw,
  disposal: Megaphone,
  plant: Sparkles,
  other: User,
  request: Megaphone,
}

export default function ResourceDetailsPage({
  resource: initialResource,
  onBack,
  onOpenChat,
  onManageMyResources,
}) {
  const { user, requireAuth } = useAuth()
  const [resource, setResource] = useState(initialResource || null)
  const [loading, setLoading] = useState(!initialResource)
  const [error, setError] = useState(null)
  const [isLiked, setIsLiked] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  const [request, setRequest] = useState(null)
  const [requestLoading, setRequestLoading] = useState(false)
  const [requestStatus, setRequestStatus] = useState(null) // 'pending' | 'accepted' | 'rejected' | null
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [calculatedDistance, setCalculatedDistance] = useState(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  // Safe provider helpers
  const providerId = resource?.provider?.id || resource?.provider_id || null
  const isProvider = Boolean(
    user && resource && (providerId === user.id || resource?.provider?.id === user.id)
  )

  // Keep resource updated if initialResource prop changes
  useEffect(() => {
    if (initialResource) {
      setResource(initialResource)
      setActiveImageIndex(0)
      setLoading(false)
    }
  }, [initialResource])

  useEffect(() => {
    let mounted = true

    const load = async () => {
      const targetId = initialResource?.id || resource?.id
      if (!targetId) return

      try {
        const { data } = await getResourceById(targetId)
        if (!mounted) return
        if (data) {
          // Merge with initialResource so existing images/fields are never lost
          setResource((prev) => ({ ...prev, ...data }))
        }

        if (user) {
          const { data: liked } = await getUserWishlist(user.id)
          if (mounted) setIsLiked((liked || []).includes(targetId))
          const { data: myRequests } = await getRequestsByRequester(user.id)
          const existing = (myRequests || []).find((r) => r.resource_id === targetId)
          if (mounted && existing) {
            setRequest(existing)
            setRequestStatus(existing.status)
          }
        }
      } catch (err) {
        if (!mounted) return
        console.warn('Resource details fetch warning:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [initialResource?.id, user?.id])

  const providerName =
    resource?.provider?.full_name ||
    resource?.provider?.name ||
    (isProvider
      ? user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'You'
      : 'Community Member')
  const providerAvatar =
    resource?.provider?.avatar_url ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(providerName)}`
  const memberSince = resource?.provider?.created_at
    ? new Date(resource.provider.created_at).getFullYear()
    : (resource?.provider?.member_since || '2023')

  const providerAvgRating = Number(resource?.provider?.avg_rating || 4.8).toFixed(1)
  const providerTotalReviews = Number(resource?.provider?.total_reviews || providerReviews.length || 0)
  const isProviderVerified = Boolean(
    resource?.provider?.is_verified ?? (Number(providerAvgRating) >= 4.5 && providerTotalReviews >= 5)
  )

  const handleReviewSubmitted = ({ review, newStats }) => {
    setMyReview(review)
    loadReviews()
    if (newStats) {
      setResource((prev) => ({
        ...prev,
        provider: {
          ...(prev?.provider || {}),
          ...newStats
        }
      }))
    }
  }

  const handleLike = async () => {
    requireAuth(async () => {
      if (!resource?.id) return
      setLikeLoading(true)
      const { liked, error: err } = await toggleWishlist(user.id, resource.id)
      if (err) {
        setError(err.message || 'Failed to update wishlist.')
      } else {
        setIsLiked(liked)
        setError(null)
      }
      setLikeLoading(false)
    })
  }

  const handleRequest = async () => {
    requireAuth(async () => {
      if (!resource) return
      setRequestLoading(true)
      setError(null)

      if (requestStatus === 'pending') {
        setRequestLoading(false)
        return
      }

      const { data, error: err } = await createRequest({
        requesterId: user.id,
        resourceId: resource.id,
        providerId: providerId || user.id,
        title: `Request for "${resource.title}"`,
        message: `I am interested in "${resource.title}".`,
      })

      if (err) {
        setError(err.message || 'Failed to send request.')
        setRequestLoading(false)
        return
      }

      setRequest(data)
      setRequestStatus('pending')
      setRequestLoading(false)
    })
  }

  const handleUpdateRequestStatus = async (status) => {
    if (!request?.id) return
    setRequestLoading(true)
    const { error: err } = await updateRequestStatus(request.id, status)
    if (err) {
      setError(err.message || 'Failed to update request.')
    } else {
      setRequestStatus(status)
      setRequest((prev) => (prev ? { ...prev, status } : null))
      setError(null)

      if (status === 'accepted' || status === 'completed') {
        try {
          awardEcoPoints('COMPLETE_EXCHANGE', 40, {
            userId: user?.id,
            details: `Completed exchange for "${resource?.title}"`
          })
        } catch (pe) {
          console.warn(pe)
        }
      }
    }
    setRequestLoading(false)
  }

  const handleOpenChat = () => {
    requireAuth(() => {
      // If the current user is the provider, the other chat participant is the requester!
      const targetUserId = isProvider ? (request?.requester_id || request?.requester?.id) : providerId
      const targetName = isProvider
        ? (request?.requester?.full_name || 'Requester')
        : providerName

      if (onOpenChat && resource) {
        onOpenChat({
          resourceId: resource.id,
          otherUserId: targetUserId || providerId,
          otherName: targetName || providerName,
          resourceTitle: resource.title,
        })
      }
    })
  }

  const isRequester = user && request && request.requester_id === user.id
  const canRequest = user && !isProvider && requestStatus !== 'accepted' && requestStatus !== 'rejected'
  const showMainAction = canRequest || (isProvider && requestStatus === 'pending')
  const showAcceptReject = isProvider && requestStatus === 'pending'
  const showChat = requestStatus === 'accepted' && (isRequester || isProvider)

  // Extract all images
  const imageUrls = (resource && Array.isArray(resource.image_urls) && resource.image_urls.length > 0)
    ? resource.image_urls
    : (resource?.image_url ? [resource.image_url] : [])
  const currentImage = imageUrls[activeImageIndex] || imageUrls[0] || null

  const postedDate = resource?.created_at
    ? new Date(resource.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : ''

  const isTimeSensitive = !!resource?.is_time_sensitive
  const isExpired = resource?.status === 'expired' || (isTimeSensitive && resource?.expires_at && new Date(resource.expires_at) <= new Date())

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center py-20">
          <div className="animate-pulse h-8 w-32 bg-gray-200 rounded-full mx-auto mb-6" />
          <p className="text-sm text-gray-500">Loading resource details...</p>
        </div>
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center py-20 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900">{error || 'Resource not found'}</h3>
          <p className="text-xs text-gray-500 mt-1 mb-6">
            The resource listing may have been deleted or is temporarily unavailable.
          </p>
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const TypeIcon = TYPE_ICONS[resource.resource_type] || Package
  const mainAction = MAIN_ACTIONS[resource.resource_type] || 'Contact Provider'
  const priceDisplay = resource.is_free ? 'FREE ♻️' : `₹${resource.price}`
  const isFree = resource.is_free !== false

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Navigation & Provider Ownership Banner */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-gray-100 text-gray-700 font-semibold text-sm border border-gray-200 shadow-xs transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {isProvider && (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                ⭐ Your Listing
              </span>
              {onManageMyResources && (
                <button
                  type="button"
                  onClick={onManageMyResources}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit in My Resources</span>
                </button>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Expired Notice Banner */}
        {isExpired && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 text-sm flex items-start gap-3 shadow-xs">
            <ClockIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">This resource listing has expired</p>
              <p className="text-xs text-amber-800 mt-0.5">
                The availability timeframe specified by the provider has ended. Consider proper recycling or disposal.
              </p>
            </div>
          </div>
        )}

        {/* ================= HEADER: REQUEST (NO IMAGE) vs REGULAR RESOURCE (IMAGE GALLERY) ================= */}
        {resource.resource_type === 'request' ? (
          <div className="bg-gradient-to-br from-rose-50/90 via-white to-amber-50/40 rounded-3xl border border-rose-200/90 p-6 sm:p-8 shadow-xs mb-6 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                  <span>📢</span>
                  <span>Community Request</span>
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span>{resource.category || 'General'}</span>
                </span>
                {resource.is_time_sensitive && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    <span>⏱️</span>
                    <span>Urgent / Time-Sensitive</span>
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={handleLike}
                disabled={likeLoading}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition shadow-2xs cursor-pointer ${
                  isLiked
                    ? 'bg-red-500 text-white scale-105 shadow-red-500/30'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                }`}
                title={isLiked ? 'Saved in Wishlist' : 'Add to Wishlist'}
              >
                <Heart
                  className={`w-4 h-4 ${
                    isLiked ? 'fill-white text-white' : 'text-gray-700'
                  } ${likeLoading ? 'animate-pulse' : ''}`}
                />
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-3">
              {resource.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center gap-1.5 font-medium text-emerald-800 bg-white px-3 py-1 rounded-xl border border-emerald-100">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {resource.location_name || resource.location || 'Location not specified'}
                  {calculatedDistance ? ` (${calculatedDistance.replace(/\s*away$/, '')} from you)` : ''}
                </span>
              </div>
              {postedDate && (
                <div className="flex items-center gap-1 text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Requested on {postedDate}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* ================= IMAGE VIEWER & GALLERY ================= */}
            <div className="space-y-3 mb-6">
              <div className="relative bg-gray-900 rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-[16/10] shadow-sm">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={resource.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100">
                    <ImageIcon className="w-12 h-12 mb-2" />
                    <span className="text-sm font-medium">No photo uploaded</span>
                  </div>
                )}

                {/* Wishlist Button */}
                <button
                  onClick={handleLike}
                  disabled={likeLoading}
                  className={`absolute top-4 right-4 z-10 w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition shadow-md cursor-pointer ${
                    isLiked
                      ? 'bg-red-500 text-white scale-105 shadow-red-500/30'
                      : 'bg-white/90 hover:bg-white text-gray-700 hover:scale-105'
                  }`}
                  title={isLiked ? 'Saved in Wishlist' : 'Add to Wishlist'}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isLiked ? 'fill-white text-white' : 'text-gray-700'
                    } ${likeLoading ? 'animate-pulse' : ''}`}
                  />
                </button>

                {/* Price badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span
                    className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-black shadow-md ${
                      isFree
                        ? 'bg-emerald-600 text-white border border-emerald-400'
                        : 'bg-amber-500 text-white border border-amber-300'
                    }`}
                  >
                    {priceDisplay}
                  </span>
                </div>

                {/* Condition / Status Pill */}
                <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
                  {resource.condition && (
                    <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-black/70 backdrop-blur-md text-white border border-white/20">
                      {resource.condition}
                    </span>
                  )}
                  {resource.status && resource.status !== 'available' && (
                    <span className="px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-red-600/90 text-white shadow-xs">
                      {resource.status}
                    </span>
                  )}
                </div>

                {/* Image Counter & Prev/Next */}
                {imageUrls.length > 1 && (
                  <>
                    <div className="absolute bottom-4 right-4 z-10">
                      <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-black/70 backdrop-blur-md text-white border border-white/20">
                        {activeImageIndex + 1} / {imageUrls.length}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : imageUrls.length - 1))
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((prev) => (prev < imageUrls.length - 1 ? prev + 1 : 0))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Multiple Image Thumbnail Strip */}
              {imageUrls.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {imageUrls.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={url}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ================= TITLE & OVERVIEW ================= */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                  <TypeIcon className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {TYPE_LABELS[resource.resource_type] || 'Resource'}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {resource.category || 'General'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-3">
                {resource.title}
              </h1>

              {/* Location & Date */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-1.5 font-medium text-emerald-800 bg-emerald-50/70 px-3 py-1 rounded-xl">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {resource.location_name || resource.location || 'Location not specified'}
                    {calculatedDistance ? ` (${calculatedDistance.replace(/\s*away$/, '')} from you)` : ''}
                  </span>
                </div>
                {postedDate && (
                  <div className="flex items-center gap-1 text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Listed on {postedDate}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ================= FULL DESCRIPTION ================= */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs mb-6">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>📝</span>
            <span>Product Information & Description</span>
          </h3>
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">
            {resource.description || 'No detailed description provided by the resource provider.'}
          </p>
        </div>

        {/* ================= DETAILED SPECIFICATIONS GRID ================= */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs mb-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📋</span>
            <span>All Provided Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Category */}
            <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Category
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {resource.category || 'General'}
              </p>
            </div>

            {/* Condition */}
            <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Condition
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {resource.condition || 'Not specified'}
              </p>
            </div>

            {/* Quantity */}
            {(resource.quantity || resource.resource_type === 'item') && (
              <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Quantity
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {resource.quantity ? `${resource.quantity} unit(s)` : '1 unit'}
                </p>
              </div>
            )}

            {/* Repairable If Damaged */}
            <div
              className={`rounded-2xl p-4 border ${
                resource.repairable_if_damaged
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-gray-50/80 border-gray-100'
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1 text-gray-600">
                <Wrench className="w-3 h-3 text-emerald-600" />
                <span>Repairable Status</span>
              </p>
              <p className="text-sm font-bold text-gray-900">
                {resource.repairable_if_damaged ? (
                  <span className="text-emerald-800">🛠️ Yes — Can be restored / repaired</span>
                ) : (
                  <span className="text-gray-600">No / Standard</span>
                )}
              </p>
            </div>

            {/* Pricing Mode */}
            <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Price Mode
              </p>
              <p className="text-sm font-bold text-gray-900">
                {isFree ? (
                  <span className="text-emerald-700">Free Giving (₹0)</span>
                ) : (
                  <span className="text-amber-800">Priced: ₹{resource.price}</span>
                )}
              </p>
            </div>

            {/* Time-Sensitive Availability */}
            <div
              className={`rounded-2xl p-4 border ${
                isTimeSensitive
                  ? 'bg-amber-50/80 border-amber-200'
                  : 'bg-gray-50/80 border-gray-100'
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1 text-amber-900">
                <ClockIcon className="w-3 h-3 text-amber-600" />
                <span>Time-Sensitive</span>
              </p>
              <p className="text-xs sm:text-sm font-bold text-gray-900">
                {isTimeSensitive ? (
                  resource.expires_at ? (
                    <span className={isExpired ? 'text-red-700' : 'text-amber-900'}>
                      {isExpired ? 'Expired: ' : 'Until: '}
                      {new Date(resource.expires_at).toLocaleString([], {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  ) : (
                    'Time-limited offer'
                  )
                ) : (
                  'No expiry timeframe'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* ================= PICKUP & DELIVERY LOGISTICS ================= */}
        {(resource.pickup_available || resource.delivery_available) && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Fulfillment & Handover Options</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {resource.pickup_available && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-50/80 text-emerald-800 border border-emerald-100 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Pickup available at specified location</span>
                </div>
              )}
              {resource.delivery_available && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-teal-50/80 text-teal-800 border border-teal-100 text-sm font-semibold">
                  <Truck className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Delivery / Local Drop-off can be arranged</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= LOCATION & MAP ================= */}
        <div
          className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs mb-6 relative z-0"
          style={{ isolation: 'isolate' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Resource Location & Distance</span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {calculatedDistance ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <span>📍</span>
                    <span>Location: {resource.location_name || resource.location || 'Resource location'} ({calculatedDistance.replace(/\s*away$/, '')} from you)</span>
                  </span>
                ) : (
                  <span>Click &ldquo;Use My Location&rdquo; or tap on the map to view distance</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                {resource.location_name || resource.location || 'Location set'}
              </span>
              {calculatedDistance && (
                <span className="text-xs font-extrabold text-teal-800 bg-teal-50 px-3 py-1 rounded-xl border border-teal-200 shadow-2xs">
                  {calculatedDistance}
                </span>
              )}
            </div>
          </div>

          <ResourceMap
            resource={resource}
            className="rounded-2xl overflow-hidden relative z-0"
            onDistanceCalculated={(distStr) => setCalculatedDistance(distStr)}
          />
        </div>

        {/* ================= PROVIDER PROFILE & TRUST CARD ================= */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
            <div className="flex items-center gap-3.5">
              <div 
                className="relative cursor-pointer group/avatar"
                onClick={() => setIsProfileModalOpen(true)}
                title="View provider profile"
              >
                <img
                  src={providerAvatar}
                  alt={providerName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-emerald-100 shadow-sm group-hover/avatar:ring-2 group-hover/avatar:ring-emerald-400 transition"
                />
                {isProviderVerified && (
                  <span 
                    className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold shadow-xs" 
                    title="Verified Community Member"
                  >
                    ✓
                  </span>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 
                    onClick={() => setIsProfileModalOpen(true)}
                    className="text-base sm:text-lg font-bold text-gray-900 leading-tight hover:text-emerald-700 cursor-pointer transition"
                  >
                    {providerName} {isProvider ? '(You)' : ''}
                  </h3>
                  {isProviderVerified && (
                    <span 
                      title="Verified Community Member (4.5+ Rating & 5+ Reviews)"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified Member</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1">
                  <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>{providerAvgRating}</span>
                  </span>
                  <span className="text-gray-400">
                    ({providerTotalReviews} {providerTotalReviews === 1 ? 'review' : 'reviews'})
                  </span>
                  <span className="text-gray-300">•</span>
                  <span>{resource?.provider?.badge || 'Active Giver'}</span>
                  <span className="text-gray-300">•</span>
                  <span>Member since {memberSince}</span>
                </div>
              </div>
            </div>

            {/* Provider Actions */}
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-gray-500" />
                <span>View Profile</span>
              </button>

              {!isProvider && (
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Chat with Provider</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Verified Explainer */}
          {isProviderVerified && (
            <div className="mt-4 pt-3 flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-50/70 px-3.5 py-2 rounded-xl border border-emerald-100">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                <strong>Trust Verified:</strong> {providerName} has maintained consistent 4.5+ star ratings across verified circular exchanges.
              </span>
            </div>
          )}
        </div>

        {/* ================= REQUEST STATUS (IF REQUESTER) ================= */}
        {isRequester && request && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Your Request Status</h3>
            <div
              className={`px-4 py-3 rounded-2xl text-sm font-medium flex items-center ${
                requestStatus === 'accepted'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : requestStatus === 'rejected'
                  ? 'bg-red-50 text-red-700 border border-red-100'
                  : 'bg-amber-50 text-amber-700 border border-amber-100'
              }`}
            >
              {requestStatus === 'accepted' && (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Request Accepted! You can now chat to coordinate handover.
                </>
              )}
              {requestStatus === 'rejected' && (
                <>
                  <AlertCircle className="w-4 h-4 mr-2" /> Request was not accepted.
                </>
              )}
              {requestStatus === 'pending' && (
                <>
                  <ClockIcon className="w-4 h-4 mr-2" /> Request Pending provider review.
                </>
              )}
            </div>

            {requestStatus === 'accepted' && showChat && (
              <button
                onClick={handleOpenChat}
                className="mt-4 w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Open Direct Chat</span>
              </button>
            )}
          </div>
        )}

        {/* ================= PROVIDER: INCOMING REQUEST ACTION ================= */}
        {isProvider && request && requestStatus === 'pending' && (
          <div className="bg-white rounded-3xl border border-amber-200 p-6 sm:p-8 shadow-xs mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-600" />
              Incoming Request
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Someone has requested &ldquo;{resource.title}&rdquo;. What would you like to do?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleUpdateRequestStatus('accepted')}
                disabled={requestLoading}
                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 transition cursor-pointer"
              >
                {requestLoading ? 'Accepting...' : 'Accept Request'}
              </button>
              <button
                onClick={() => handleUpdateRequestStatus('rejected')}
                disabled={requestLoading}
                className="flex-1 py-3 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 disabled:opacity-60 transition cursor-pointer"
              >
                Reject
              </button>
            </div>
          </div>
        )}

        {/* ================= BOTTOM ACTION BAR ================= */}
        <div className="space-y-3 pt-2">
          {showMainAction && !isExpired && (
            <button
              onClick={handleRequest}
              disabled={requestLoading || requestStatus === 'accepted' || requestStatus === 'rejected'}
              className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${
                isFree
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20'
              }`}
            >
              {requestLoading ? 'Submitting...' : mainAction}
            </button>
          )}

          {!isProvider && (
            <button
              onClick={handleOpenChat}
              className="w-full py-3.5 rounded-2xl border border-gray-200 bg-white hover:bg-emerald-50 text-gray-800 hover:text-emerald-800 font-bold text-sm transition shadow-2xs cursor-pointer flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4 text-emerald-600" />
              <span>{user ? `Chat with Provider (${providerName})` : 'Sign in to Chat with Provider'}</span>
            </button>
          )}

          {isProvider && onManageMyResources && (
            <button
              type="button"
              onClick={onManageMyResources}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-emerald-600/20 shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit / Manage This Resource in My Resources</span>
            </button>
          )}
        </div>

        {/* ================= PROVIDER PROFILE MODAL ================= */}
        <ProviderProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          providerId={providerId}
          initialProvider={resource?.provider}
          onOpenChat={handleOpenChat}
        />
      </div>
    </div>
  )
}
