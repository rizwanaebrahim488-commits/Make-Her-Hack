import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getResources,
  getCommunityRequests,
  getResourceCount,
  getProfileCount,
  getCompletedRequestCount,
  getActiveRequestCount,
} from '../lib/supabase'
import ResourceCard from '../components/ResourceCard'
import ResourceCardSkeleton from '../components/ResourceCardSkeleton'
import {
  ArrowRight,
  Compass,
  PlusCircle,
  Sparkles,
  Search as SearchIcon,
  Bell,
  MessageCircle,
  Clock,
  RefreshCw,
  Heart,
  HelpCircle,
} from 'lucide-react'

const RESOURCE_TYPES = [
  { id: 'items', label: 'Items', icon: '🪑', desc: 'Furniture, electronics, books & more' },
  { id: 'services', label: 'Services', icon: '🛠', desc: 'Repair, cleaning, tutoring & local help' },
  { id: 'requests', label: 'Requests', icon: '📢', desc: 'Community requests & help needed' },
  { id: 'disposal', label: 'Disposal', icon: '♻️', desc: 'Recycle & drop-off resources' },
  { id: 'plants', label: 'Plants', icon: '🌱', desc: 'Indoor plants, cuttings & seeds' },
  { id: 'others', label: 'Others', icon: '📦', desc: 'Supplies, crafts & upcyclables' },
]

export default function HomePage({
  setCurrentView,
  onExploreClick,
  onOpenResourceDetails,
}) {
  const { requireAuth } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [featuredResources, setFeaturedResources] = useState([])
  const [activeRequests, setActiveRequests] = useState([])
  const [stats, setStats] = useState({
    resources: 0,
    members: 0,
    completed: 0,
    pending: 0,
  })
  const [loading, setLoading] = useState({ resources: true, requests: true, stats: true })

  // Seamless client-side navigation to Explore without page reloads or 404s
  const navigateToExplore = (category, search) => {
    if (onExploreClick) {
      onExploreClick({
        category: category || 'all',
        search: search || '',
      })
    } else if (setCurrentView) {
      setCurrentView('explore')
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Seamless navigation to Add Resource form
  const navigateToAddResource = (type) => {
    requireAuth(() => {
      if (setCurrentView) {
        setCurrentView('add-resource')
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  // Handle clicking a resource card to view full details
  const handleResourceClick = (resource) => {
    if (onOpenResourceDetails) {
      onOpenResourceDetails(resource)
    } else if (setCurrentView) {
      setCurrentView('details')
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Load resources, requests, and stats from live database or resilient fallback
  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoading({ resources: true, requests: true, stats: true })
      try {
        // 1. Featured recent resources (items, services, disposal, plants - user posts included)
        const { data: resources } = await getResources({
          resourceType: 'all',
          category: null,
          typeFilter: 'All',
          searchTerm: '',
        })
        if (mounted) {
          setFeaturedResources((resources || []).slice(0, 6))
        }

        // 2. Active community requests (public)
        const { data: requests } = await getCommunityRequests(4)
        if (mounted) {
          setActiveRequests(requests || [])
        }

        // 3. Community Stats
        const [resCount, profCount, compCount, pendCount] = await Promise.all([
          getResourceCount(),
          getProfileCount(),
          getCompletedRequestCount(),
          getActiveRequestCount(),
        ])

        if (mounted) {
          setStats({
            resources: resCount.count || 0,
            members: profCount.count || 0,
            completed: compCount.count || 0,
            pending: pendCount.count || 0,
          })
        }
      } catch (err) {
        console.error('Home data load error:', err)
      } finally {
        if (mounted) {
          setLoading({ resources: false, requests: false, stats: false })
        }
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    navigateToExplore('all', searchQuery.trim())
  }

  const handleCategory = (id) => {
    navigateToExplore(id, null)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="bg-white border-b border-emerald-100/60 px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-800 text-xs font-semibold mb-4 border border-emerald-200/60">
            <Sparkles className="w-3.5 h-3.5" />
            Give. Reuse. Repeat. ♻️
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-4">
            Give unused things a second life.
          </h1>

          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Find useful resources nearby. Share, reuse, and help your community — sustainable, local, and free to explore.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigateToExplore('all', null)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Compass className="w-5 h-5" />
              <span>Explore Resources</span>
            </button>
            <button
              onClick={() => navigateToAddResource('item')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white hover:bg-emerald-50 text-gray-800 font-bold text-base border border-gray-200 hover:border-emerald-300 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              <span>Give a Resource</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. UNIVERSAL SEARCH (CONNECTED TO EXPLORE) */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="max-w-2xl mx-auto">
          <div className="text-left mb-2 px-1 flex items-center justify-between">
            <label className="text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-1.5">
              <span>🔍</span>
              <span>What are you looking for?</span>
            </label>
            <span className="text-[11px] text-gray-400 hidden sm:inline">
              Instant search across items, services & requests
            </span>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ReLoop (laptop, study table, repair, floral waste)..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition whitespace-nowrap cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Quick Suggestions Tags */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-xs text-gray-500">
            <span className="font-semibold text-gray-600">Popular:</span>
            {['study table', 'laptop', 'books', 'bike repair', 'plants', 'floral waste'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => navigateToExplore('all', tag)}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 text-gray-600 hover:text-emerald-700 transition cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. RELOOP EXPLORE CARDS (CONNECTED TO EXPLORE CATEGORIES) */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">Explore ReLoop</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Click any category to browse resources shared by community members
              </p>
            </div>
            <button
              onClick={() => navigateToExplore('all', null)}
              className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>View All Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {RESOURCE_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => handleCategory(type.id)}
                className="group relative bg-gray-50/80 hover:bg-white rounded-3xl border border-gray-200/90 hover:border-emerald-300 overflow-hidden shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer p-4 text-center flex flex-col items-center justify-between min-h-[160px]"
              >
                <div className="w-14 h-14 rounded-2xl bg-white group-hover:bg-emerald-50 border border-gray-100 group-hover:border-emerald-200 flex items-center justify-center text-3xl mb-3 shadow-2xs group-hover:scale-110 transition-transform">
                  <span>{type.icon}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                    {type.label}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-tight">
                    {type.desc}
                  </p>
                </div>
                <div className="mt-2 text-[10px] font-bold text-emerald-600 group-hover:text-emerald-700 flex items-center gap-0.5">
                  <span>Browse</span>
                  <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. RESOURCES YOU MIGHT LIKE (CONNECTED TO USER-POSTED RESOURCES) */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                Resources You Might Like
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Recently posted items, services & resources from your local community
              </p>
            </div>
            <button
              onClick={() => navigateToExplore('all', null)}
              className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading.resources && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <ResourceCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!loading.resources && featuredResources.length === 0 && (
            <div className="py-16 text-center bg-white rounded-3xl border border-gray-200 shadow-2xs">
              <RefreshCw className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-900">No resources available yet</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Be the first to share an item with the community!
              </p>
              <button
                onClick={() => navigateToAddResource('item')}
                className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
              >
                Give a Resource
              </button>
            </div>
          )}

          {!loading.resources && featuredResources.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {featuredResources.map((item) => (
                <ResourceCard
                  key={item.id}
                  resource={item}
                  onViewDetails={handleResourceClick}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. COMMUNITY REQUESTS (TEXT-ONLY, NO BROKEN IMAGES) */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-600" />
                <span>Community Requests</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Neighbors seeking items or help — offer assistance or fulfill a request
              </p>
            </div>
            <button
              onClick={() => navigateToExplore('requests', null)}
              className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Requests</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading.requests && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-3xl border border-gray-200 p-5 h-28 animate-pulse" />
              ))}
            </div>
          )}

          {!loading.requests && activeRequests.length === 0 && (
            <div className="py-12 text-center bg-gray-50 rounded-3xl border border-gray-200">
              <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-gray-900">No open requests right now</h3>
              <p className="text-xs text-gray-500 mt-1">
                Looking for something? Post a request and ask the community.
              </p>
            </div>
          )}

          {!loading.requests && activeRequests.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeRequests.map((req) => {
                const resource = req.resource || {}
                const requester = req.requester || {}
                return (
                  <div
                    key={req.id}
                    onClick={() => handleResourceClick({ ...resource, id: req.resource_id || req.id, resource_type: 'request', title: req.title || resource.title, description: req.message || resource.description })}
                    className="group bg-gradient-to-br from-rose-50/50 via-white to-gray-50 rounded-3xl border border-rose-100 hover:border-emerald-300 p-5 shadow-2xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <span>📢</span>
                          <span>Seeking Item</span>
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {new Date(req.created_at).toLocaleDateString(undefined, { dateStyle: 'short' })}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1 leading-snug">
                        {req.title || resource.title || 'Community Request'}
                      </h4>

                      <p className="text-xs text-gray-600 mt-1.5 line-clamp-2 leading-relaxed">
                        {req.message || resource.description || 'Details provided by member.'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={requester.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(requester.full_name || 'Member')}`}
                          alt="Requester"
                          className="w-6 h-6 rounded-full object-cover border border-emerald-100"
                        />
                        <span className="font-semibold text-gray-800 text-xs truncate max-w-[120px]">
                          {requester.full_name || 'Community Member'}
                        </span>
                      </div>

                      <span className="text-xs font-bold text-emerald-600 group-hover:text-emerald-700 flex items-center gap-1">
                        <span>Offer Help</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* 6. GIVE SOMETHING A SECOND LIFE CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14 bg-emerald-50/60 border-t border-emerald-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
            Have something you don't use?
          </h2>
          <p className="text-sm text-gray-600 mb-6 max-w-xl mx-auto">
            Don't let it sit in storage or go to waste. Share it with someone nearby in three simple taps. ♻️
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigateToAddResource('item')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Give an Item</span>
            </button>
            <button
              onClick={() => navigateToAddResource('service')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-teal-50 text-teal-800 font-bold text-sm border border-teal-200 hover:border-teal-300 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Clock className="w-4 h-4 text-teal-600" />
              <span>Offer a Service</span>
            </button>
          </div>
        </div>
      </section>

      {/* 7. COMMUNITY IMPACT STATS */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-12 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-1">ReLoop Community Impact</h2>
          <p className="text-xs text-gray-500 text-center mb-8">Real impact from neighborhood circular sharing</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { val: stats.resources, label: 'Resources Shared' },
              { val: stats.members, label: 'Community Members' },
              { val: stats.completed, label: 'Resources Reused' },
              { val: stats.pending, label: 'Requests Active' },
            ].map((st, i) => (
              <div key={i} className="bg-gray-50 rounded-3xl border border-gray-200/80 p-5 text-center">
                <p className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">
                  {loading.stats ? '...' : st.val}
                </p>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  {st.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FOOTER WITH SAFE SPA LINKS (ZERO 404s) */}
      <footer className="bg-white border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-8 sm:py-10 text-xs text-gray-500">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
            <div>
              <h4 className="font-bold text-gray-900 uppercase tracking-wider mb-3">Explore</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => navigateToExplore('all', null)} className="hover:text-emerald-600 cursor-pointer">Browse All</button>
                </li>
                <li>
                  <button onClick={() => navigateToExplore('items', null)} className="hover:text-emerald-600 cursor-pointer">Items</button>
                </li>
                <li>
                  <button onClick={() => navigateToExplore('services', null)} className="hover:text-emerald-600 cursor-pointer">Services</button>
                </li>
                <li>
                  <button onClick={() => navigateToExplore('requests', null)} className="hover:text-emerald-600 cursor-pointer">Requests</button>
                </li>
                <li>
                  <button onClick={() => navigateToExplore('disposal', null)} className="hover:text-emerald-600 cursor-pointer">Disposal &amp; Recycling</button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 uppercase tracking-wider mb-3">Give</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => navigateToAddResource('item')} className="hover:text-emerald-600 cursor-pointer">Give an Item</button>
                </li>
                <li>
                  <button onClick={() => navigateToAddResource('service')} className="hover:text-emerald-600 cursor-pointer">Offer a Service</button>
                </li>
                <li>
                  <button onClick={() => navigateToAddResource('request')} className="hover:text-emerald-600 cursor-pointer">Post a Request</button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 uppercase tracking-wider mb-3">Community</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => setCurrentView('dashboard')} className="hover:text-emerald-600 cursor-pointer">My ReLoop</button>
                </li>
                <li>
                  <button onClick={() => setCurrentView('messages')} className="hover:text-emerald-600 cursor-pointer">Messages</button>
                </li>
                <li>
                  <button onClick={() => setCurrentView('notifications')} className="hover:text-emerald-600 cursor-pointer">Notifications</button>
                </li>
                <li>
                  <button onClick={() => setCurrentView('help')} className="hover:text-emerald-600 cursor-pointer">Help &amp; Support</button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 uppercase tracking-wider mb-3">About ReLoop</h4>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Circular economy platform empowering communities to give, reuse, and reduce waste.
              </p>
            </div>
          </div>
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-center text-[11px] text-gray-400">
            <div className="flex items-center gap-1.5 font-bold text-gray-700">
              <span>♻️</span>
              <span>ReLoop — Give. Reuse. Repeat.</span>
            </div>
            <p>© 2026 ReLoop Community. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
