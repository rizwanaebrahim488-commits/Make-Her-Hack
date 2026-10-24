import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Heart, MapPin, ArrowRight, Star, ShieldCheck } from 'lucide-react'

// Badge styling helper based on resource status / type
function getBadgeStyles(status, price) {
  const s = (status || '').toLowerCase()
  if (s.includes('free') || price === 0) {
    return 'bg-emerald-500/95 text-white border-emerald-400 shadow-sm'
  }
  if (s.includes('sale') || price > 0) {
    return 'bg-amber-500/95 text-white border-amber-400 shadow-sm'
  }
  if (s.includes('exchange')) {
    return 'bg-blue-500/95 text-white border-blue-400 shadow-sm'
  }
  if (s.includes('hire')) {
    return 'bg-purple-500/95 text-white border-purple-400 shadow-sm'
  }
  if (s.includes('drop') || s.includes('collection') || s.includes('recycling')) {
    return 'bg-teal-600/95 text-white border-teal-500 shadow-sm'
  }
  return 'bg-gray-800/90 text-white border-gray-700 shadow-sm'
}

// Category icon helper
function getCategoryIcon(category, type) {
  const cat = (category || '').toLowerCase()
  if (cat.includes('furniture')) return '🪑'
  if (cat.includes('electronics') || cat.includes('tech')) return '💻'
  if (cat.includes('book')) return '📚'
  if (cat.includes('clothe') || cat.includes('fabric')) return '👕'
  if (cat.includes('plant') || cat.includes('garden') || cat.includes('seed')) return '🌱'
  if (cat.includes('kitchen') || cat.includes('home')) return '🍳'
  if (cat.includes('school')) return '🎒'
  if (cat.includes('repair')) return '🔧'
  if (cat.includes('tutoring') || cat.includes('math')) return '🎓'
  if (cat.includes('clean')) return '🧹'
  if (cat.includes('transport')) return '🚚'
  if (cat.includes('floral')) return '🌸'
  if (cat.includes('e-waste')) return '🔋'
  if (cat.includes('plastic')) return '♻️'
  if (cat.includes('paper')) return '📄'
  return type === 'services' ? '🛠️' : type === 'disposal' ? '♻️' : '📦'
}

export default function ResourceCard({ resource, onViewDetails }) {
  const { wishlist, toggleWishlist, requireAuth } = useAuth()
  const [imageError, setImageError] = useState(false)

  const isLiked = wishlist.includes(resource.id)

  const handleWishlistClick = (e) => {
    e.stopPropagation()
    requireAuth(() => {
      toggleWishlist(resource.id)
    })
  }

  const isPaid = resource.is_free === false || parseFloat(resource.price) > 0
  const priceValue = parseFloat(resource.price) || 0
  const badgeText = isPaid
    ? (priceValue > 0 ? `Paid: ₹${priceValue}` : 'Paid')
    : 'Free'

  const badgeStyle = isPaid
    ? 'bg-amber-500/95 text-white border-amber-400 shadow-sm'
    : 'bg-emerald-500/95 text-white border-emerald-400 shadow-sm'

  // Special text-only layout for Community Requests (no photo accepted/shown)
  if (resource.resource_type === 'request') {
    return (
      <div
        onClick={() => onViewDetails(resource)}
        className="group bg-white rounded-3xl border border-rose-100/90 hover:border-emerald-300 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between cursor-pointer relative overflow-hidden"
      >
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-500" />

        <div>
          {/* Header Tags & Wishlist */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                <span>📢</span>
                <span>Community Request</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                <span>{getCategoryIcon(resource.category, 'request')}</span>
                <span>{resource.category || 'General'}</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleWishlistClick}
              aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition shadow-2xs cursor-pointer ${
                isLiked
                  ? 'bg-red-500 text-white scale-110 shadow-red-500/30'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-red-500'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white stroke-white' : 'stroke-current'}`} />
            </button>
          </div>

          {/* Title */}
          <h4 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
            {resource.title}
          </h4>

          {/* User-Provided Information & Description */}
          <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-3 leading-relaxed">
            {resource.description || 'No additional details provided by requester.'}
          </p>

          {/* Specification Pills (Quantity, Condition, Time-sensitivity, Location) */}
          <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
            {resource.quantity && (
              <span className="px-2.5 py-1 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-medium">
                Needed: {resource.quantity}
              </span>
            )}

            {resource.condition && (
              <span className="px-2.5 py-1 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-medium">
                Condition: {resource.condition}
              </span>
            )}

            {resource.is_time_sensitive && (
              <span className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-semibold flex items-center gap-1">
                <span>⏱️</span>
                <span>Time-Sensitive</span>
              </span>
            )}

            <span className="inline-flex items-center gap-1 text-gray-500 font-medium px-2 py-1 rounded-xl bg-gray-50">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate max-w-[130px]">{resource.location_name || resource.location || 'Location not specified'}</span>
            </span>
          </div>
        </div>

        {/* Footer: Requester info + Offer to Help Button */}
        <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between gap-2">
          <div 
            onClick={(e) => {
              e.stopPropagation()
              window.dispatchEvent(new CustomEvent('reloop-open-provider-profile', { detail: resource.provider }))
            }}
            className="flex items-center gap-2 min-w-0 cursor-pointer group/provider hover:opacity-90"
            title={`View ${resource.provider?.full_name || 'Requester'}'s community profile & rating`}
          >
            <div className="relative shrink-0">
              <img
                src={resource.provider?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(resource.provider?.full_name || 'Requester')}`}
                alt={resource.provider?.full_name || 'Requester'}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-emerald-100 shrink-0"
              />
              {Boolean(resource.provider?.is_verified ?? (Number(resource.provider?.avg_rating || 4.8) >= 4.5 && Number(resource.provider?.total_reviews || 0) >= 5)) && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border border-white flex items-center justify-center text-[8px] text-white font-bold" title="Verified Community Member">
                  ✓
                </span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-xs font-semibold text-gray-800 truncate group-hover/provider:text-emerald-700 transition-colors">
                  {resource.provider?.full_name || 'Community Member'}
                </p>
                {Boolean(resource.provider?.is_verified ?? (Number(resource.provider?.avg_rating || 4.8) >= 4.5 && Number(resource.provider?.total_reviews || 0) >= 5)) && (
                  <span 
                    title="Verified Community Member"
                    className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 shrink-0"
                  >
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                    <span className="hidden sm:inline">Verified</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium leading-none mt-0.5">
                <span className="inline-flex items-center gap-0.5 text-amber-600 font-bold">
                  <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-500" />
                  <span>{Number(resource.provider?.avg_rating || 4.8).toFixed(1)}</span>
                </span>
                {Number(resource.provider?.total_reviews || 0) > 0 && (
                  <span className="text-gray-400 text-[10px]">({resource.provider.total_reviews})</span>
                )}
                <span className="text-gray-300">•</span>
                <span className="text-[10px] text-gray-500 font-medium">Requester</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 rounded-xl shadow-xs transition shrink-0"
          >
            <span>Offer to Help</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      onClick={() => onViewDetails(resource)}
      className="group bg-white rounded-3xl border border-gray-100 hover:border-emerald-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Image Container with Badges */}
      <div className="relative aspect-4/3 sm:aspect-16/10 w-full overflow-hidden bg-gray-100">
        {!imageError && resource.image_url ? (
          <img
            src={resource.image_url}
            alt={resource.title}
            onError={() => setImageError(true)}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 text-gray-400 p-4 text-center">
            <span className="text-4xl mb-2">{getCategoryIcon(resource.category, resource.resource_type)}</span>
            <span className="text-xs font-medium text-gray-500">{resource.category || 'ReLoop Resource'}</span>
          </div>
        )}

        {/* Gradient Overlay for Top Badges */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-transparent pointer-events-none" />

        {/* Free / Paid Badge */}
        <div className="absolute top-3.5 left-3.5 z-10">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold tracking-wide backdrop-blur-md border ${badgeStyle}`}>
            {badgeText}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition shadow-sm cursor-pointer ${
            isLiked
              ? 'bg-red-500 text-white scale-110 shadow-red-500/30'
              : 'bg-white/80 hover:bg-white text-gray-700 hover:text-red-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-white stroke-white' : 'stroke-current'}`} />
        </button>

        {/* Bottom Dark Gradient for Image Legibility */}
        <div className="absolute inset-x-0 bottom-0 h-22 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

        {/* User Profile & Account Rating embedded as part of the Card Image */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between gap-1.5 pointer-events-none">
          <div 
            onClick={(e) => {
              e.stopPropagation()
              window.dispatchEvent(new CustomEvent('reloop-open-provider-profile', { detail: resource.provider }))
            }}
            className="inline-flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white pointer-events-auto transition cursor-pointer shadow-md"
            title={`View ${resource.provider?.full_name || 'Provider'}'s profile & account rating`}
          >
            <div className="relative shrink-0">
              <img
                src={resource.provider?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(resource.provider?.full_name || 'ReLoop')}`}
                alt={resource.provider?.full_name || 'Provider'}
                className="w-7 h-7 rounded-full object-cover border border-white/80 shrink-0"
              />
              {Boolean(resource.provider?.is_verified ?? (Number(resource.provider?.avg_rating || 4.8) >= 4.5 && Number(resource.provider?.total_reviews || 0) >= 5)) && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white flex items-center justify-center text-[7px] text-white font-bold" title="Verified">
                  ✓
                </span>
              )}
            </div>

            <div className="min-w-0 text-left">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-white truncate max-w-[105px] leading-tight">
                  {resource.provider?.full_name || 'Community Member'}
                </span>
                {Boolean(resource.provider?.is_verified ?? (Number(resource.provider?.avg_rating || 4.8) >= 4.5 && Number(resource.provider?.total_reviews || 0) >= 5)) && (
                  <span className="text-emerald-300">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold mt-0.5 leading-none">
                <span className="inline-flex items-center gap-0.5 text-amber-300">
                  <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                  <span>{Number(resource.provider?.avg_rating || 4.8).toFixed(1)}</span>
                </span>
                {Number(resource.provider?.total_reviews || 0) > 0 && (
                  <span className="text-white/70">({resource.provider.total_reviews})</span>
                )}
              </div>
            </div>
          </div>

          {resource.condition && (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-black/55 backdrop-blur-md text-white/95 border border-white/15 shrink-0">
              {resource.condition}
            </span>
          )}
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Chip & Location */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2 gap-2">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50/80 px-2.5 py-0.5 rounded-md border border-emerald-100">
              <span>{getCategoryIcon(resource.category, resource.resource_type)}</span>
              <span>{resource.category}</span>
            </span>

            <span className="inline-flex items-center gap-1 text-gray-500 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span className="truncate max-w-[110px]">{resource.location_name || resource.location}</span>
            </span>
          </div>

          {/* Distance Tag if available */}
          {resource.distance && (
            <div className="text-[11px] text-teal-600 font-medium mb-1.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block"></span>
              {resource.distance}
            </div>
          )}

          {/* Title */}
          <h4 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1 leading-snug">
            {resource.title}
          </h4>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
            {resource.description}
          </p>
        </div>

        {/* Card Footer: Location/Badge & View Details */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 text-emerald-600 font-medium truncate max-w-[150px]">
            <span>{resource.provider?.badge || 'Community Provider'}</span>
          </div>

          {/* View Details CTA */}
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 rounded-xl transition shrink-0 cursor-pointer"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  )
}
