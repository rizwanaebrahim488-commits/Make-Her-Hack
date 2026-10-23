import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getUserWishlist,
  getResources,
  toggleWishlist,
} from '../lib/supabase'
import { ArrowLeft, Heart, Sparkles, AlertCircle, Package, MapPin } from 'lucide-react'
import AccountLayout from '../components/AccountLayout'

export default function WishlistPage({ setCurrentView, onOpenResourceDetails }) {
  const { user, wishlist: contextWishlist, toggleWishlist } = useAuth()
  const [wishlistIds, setWishlistIds] = useState([])
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        let ids = []
        if (user) {
          const { data: dbIds } = await getUserWishlist(user.id)
          ids = dbIds || []
        }
        // Merge with context wishlist to ensure optimistic/local items also appear
        const mergedIds = Array.from(new Set([...ids, ...(contextWishlist || [])]))
        setWishlistIds(mergedIds)

        if (mergedIds.length > 0 && mounted) {
          const { data: all } = await getResources()
          const wishlistResources = (all || []).filter(r => mergedIds.includes(r.id))
          if (mounted) setResources(wishlistResources)
        } else if (mounted) {
          setResources([])
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load your wishlist.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [user, contextWishlist])

  const handleRemove = async (resourceId) => {
    try {
      toggleWishlist(resourceId)
      setResources(prev => prev.filter(r => r.id !== resourceId))
      setWishlistIds(prev => prev.filter(id => id !== resourceId))
    } catch (err) {
      setError(err.message || 'Failed to update wishlist.')
    }
  }

  if (loading) {
    return (
      <AccountLayout currentView="wishlist" setCurrentView={setCurrentView} unreadCount={0}>
        <div className="py-12 text-center">
          <div className="animate-pulse h-8 w-32 bg-gray-200 rounded-full mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading your wishlist...</p>
        </div>
      </AccountLayout>
    )
  }

  return (
    <AccountLayout currentView="wishlist" setCurrentView={setCurrentView} unreadCount={0}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => setCurrentView('dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-gray-100 text-gray-700 font-semibold text-sm border border-gray-200 shadow-xs transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to My ReLoop</span>
            </button>
            <h2 className="text-lg font-bold text-gray-900 mt-3">Wishlist</h2>
          </div>
          <p className="text-sm text-gray-500">
            {resources.length} saved {resources.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {resources.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-gray-200 shadow-sm">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base font-bold text-gray-900">Your wishlist is empty</h3>
            <p className="text-sm text-gray-500 mt-1">
              Save items you love while browsing, and they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {resources.map((r) => {
              const imageUrl = r.image_url || (r.image_urls && r.image_urls[0]) || null
              return (
                <div
                  key={r.id}
                  onClick={() => onOpenResourceDetails ? onOpenResourceDetails(r) : setCurrentView && setCurrentView('details')}
                  className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer group"
                >
                  <div className="relative h-48 sm:h-56 bg-gray-100 overflow-hidden">
                    {imageUrl ? (
                      <img src={imageUrl} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-8 h-8" />
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(r.id)
                      }}
                      className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition shadow-xs"
                      aria-label="Remove from wishlist"
                    >
                      <span className="w-4 h-4 font-bold">✕</span>
                    </button>
                  </div>
                  <div className="p-4 sm:p-5">
                    <h4 className="text-sm font-bold text-gray-900 leading-tight mb-2 truncate group-hover:text-emerald-700 transition">
                      {r.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {r.category || 'General'}
                      </span>
                      <span className="w-px h-2 bg-gray-300" />
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {r.location_name || r.location || 'Location not specified'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                      <span className="font-bold text-emerald-700">
                        {r.is_free !== false ? 'Free' : `₹${r.price}`}
                      </span>
                      <span className="text-emerald-600 font-semibold group-hover:underline">
                        View details →
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AccountLayout>
  )
}

