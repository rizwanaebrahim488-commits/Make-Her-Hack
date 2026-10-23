import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { getResources, getResourceCount, getProfileCount, getCompletedRequestCount, getActiveRequestCount } from '../lib/supabase'
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
} from 'lucide-react'

const RESOURCE_TYPES = [
  { id: 'items', label: 'Items', icon: '🪑', desc: 'Furniture, electronics, books & more' },
  { id: 'services', label: 'Services', icon: '🛠', desc: 'Repair, cleaning, tutoring & help' },
  { id: 'disposal', label: 'Disposal', icon: '♻️', desc: 'Recycle & drop-off resources' },
  { id: 'plants', label: 'Plants', icon: '🌱', desc: 'Indoor plants, cuttings & seeds' },
  { id: 'others', label: 'Others', icon: '📦', desc: 'Supplies, crafts & reusables' },
]

export default function HomePage({ setCurrentView }) {
  const { requireAuth } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [featuredResources, setFeaturedResources] = useState([])
  const [activeRequests, setActiveRequests] = useState([])
  const [stats, setStats] = useState({
    resources: 0, members: 0, completed: 0, pending: 0,
  })
  const [loading, setLoading] = useState({ resources: true, requests: true, stats: true })

  // Navigate to Explore with optional search/category
  const navigateToExplore = (category, search) => {
    const params = new URLSearchParams()
    if (category && category !== 'all') params.set('category', category)
    if (search && search.trim()) params.set('search', search)
    const url = `/explore${params.toString() ? '?' + params.toString() : ''}`
    window.location.assign(url)
  }

  const navigateToAddResource = (type) => {
    requireAuth(() => {
      const url = `/add-resource?type=${type || 'item'}`
      window.location.href = url
    })
  }

  const handleResourceClick = (resource) => {
    setCurrentView('details')
    // App.jsx will set selectedResource from explore; here we set via a shared approach
    // Since App manages selectedResource, we expose through setCurrentView only;
    // the Explore page passes onViewDetails. For home cards, set a global via parent.
    // We'll store in sessionStorage so App can pick it up, then navigate.
    sessionStorage.setItem('reloop_selected_resource', JSON.stringify(resource))
    setCurrentView('details')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    // Check if a resource was pre-selected from Home
    const stored = sessionStorage.getItem('reloop_selected_resource')
    if (stored) {
      sessionStorage.removeItem('reloop_selected_resource')
      try {
        const res = JSON.parse(stored)
        if (res && res.id) {
          // Notify App via a custom event
          window.dispatchEvent(new CustomEvent('reloop-open-resource', { detail: res }))
        }
      } catch { /* ignore */ }
    }
  }, [])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading({ resources: true, requests: true, stats: true })
      try {
        // Featured resources (recent, available)
        const { data: resources } = await getResources({
          resourceType: null,
          category: null,
          typeFilter: 'All',
          searchTerm: '',
        })
        if (mounted) {
          setFeaturedResources((resources || []).slice(0, 6))
        }

        // Active requests (public)
        const { data: requests } = await supabase
          .from('requests')
          .select(`
            id,
            title,
            message,
            status,
            created_at,
            resource_id,
            requester_id,
            provider_id,
            resource:resources ( id, title, category, image_url, location_name ),
            requester:profiles!requests_requester_id_fkey ( id, full_name, avatar_url )
          `)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(4)
        if (mounted) setActiveRequests(requests || [])

        // Stats
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
        if (mounted) setLoading({ resources: false, requests: false, stats: false })
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    navigateToExplore(null, searchQuery)
  }

  const handleCategory = (id) => {
    navigateToExplore(id, null)
  }

  if (loading.resources || loading.requests || loading.stats) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-gray-100 text-gray-700 font-semibold text-sm border border-gray-200 shadow-xs transition mb-8">
            <ArrowRight className="w-4 h-4" />
            <span>Back to Home</span>
          </div>
          <div className="flex flex-col gap-6">
            <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-32 w-full bg-gray-200 rounded-xl animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <ResourceCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="bg-white border-b border-emerald-100/60 px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-800 text-xs font-semibold mb-4 border border-emerald-200/60">
            <Sparkles className="w-3 h-3" />
            Give. Reuse. Repeat. ♻️
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-4">
            Give unused things a second life.
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Find useful resources nearby. Share, reuse, and help your community — no buying, no selling.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigateToExplore(null, null)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
            >
              <Compass className="w-5 h-5" />
              <span>Explore Resources</span>
            </button>
            <button
              onClick={() => navigateToAddResource('item')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-emerald-50 text-gray-800 font-bold text-base border border-gray-200 hover:border-emerald-300 transition flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              <span>Give a Resource</span>
            </button>
          </div>
        </div>
      </section>

      {/* UNIVERSAL SEARCH */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">What are you looking for?</h2>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                placeholder="Search ReLoop (laptop, study table, repair, floral waste)..."
                className="w-full pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 rounded-2xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition whitespace-nowrap"
            >
              Search
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-3 text-center">
            Try: laptop • study table • repair • floral waste • plants
          </p>
        </div>
      </section>

      {/* QUICK CATEGORIES */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900">Explore ReLoop</h2>
            <p className="text-sm text-gray-500">Choose a category to browse</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {RESOURCE_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => handleCategory(type.id)}
                className="group relative bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:border-emerald-200/80 hover:shadow-md transition cursor-pointer"
              >
                <div className="h-40 bg-emerald-50 flex items-center justify-center">
                  <span className="text-4xl">{type.icon}</span>
                </div>
                <div className="p-5 text-center">
                  <h3 className="text-base font-bold text-gray-900">{type.label}</h3>
                  <p className="text-xs text-gray-500 mt-1">{type.desc}</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/90 to-transparent opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center pb-6">
                  <span className="text-xs text-white font-medium mb-1">Browse {type.label.toLowerCase()}</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* RESOURCES YOU MIGHT LIKE */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-12 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Resources You Might Like</h2>
            <button
              onClick={() => navigateToExplore(null, null)}
              className="text-sm font-semibold text-emerald-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
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
            <div className="py-16 text-center bg-gray-50 rounded-3xl border border-gray-200">
              <RefreshCw className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-900">No resources available yet</h3>
              <p className="text-sm text-gray-500 mt-1">
                Be the first to share something with the community.
              </p>
              <button
                onClick={() => navigateToAddResource('item')}
                className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
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

      {/* COMMUNITY REQUESTS */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-600" />
              Community Requests
            </h2>
            <button
              onClick={() => setCurrentView('requests')}
              className="text-sm font-semibold text-emerald-600 hover:underline flex items-center gap-1"
            >
              View All Requests <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {loading.requests && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl border border-gray-200 p-4 h-24 flex items-center gap-4 animate-pulse">
                  <div className="h-10 w-10 bg-gray-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                    <div className="h-3 w-1/2 bg-gray-200 rounded mt-2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading.requests && activeRequests.length === 0 && (
            <div className="py-12 text-center bg-white rounded-3xl border border-gray-200">
              <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-900">No community requests yet</h3>
              <p className="text-sm text-gray-500 mt-1">
                Be the first to post what you're looking for.
              </p>
            </div>
          )}

          {!loading.requests && (
            <div className="space-y-3">
              {activeRequests.map((req) => {
                const resource = req.resource
                const handleRequestClick = () => {
                  if (resource?.id) {
                    sessionStorage.setItem('reloop_selected_resource', JSON.stringify({
                      ...resource,
                      resource_type: resource.resource_type || 'item',
                    }))
                    setCurrentView('details')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                }
                return (
                  <div
                    key={req.id}
                    onClick={handleRequestClick}
                    className="bg-white rounded-3xl border border-gray-200 p-4 hover:border-emerald-200/80 hover:shadow-md transition cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <img
                          src={resource?.image_url || `https://api.dicebear.com/7.x/initials/svg?seed=resource`}
                          alt={resource?.title || 'Request'}
                          className="w-16 h-16 rounded-xl object-cover bg-gray-100"
                          onError={(e) => { e.target.src = '' }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 leading-tight">
                          {req.title || 'Resource Request'}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {resource?.category || 'General'} • {resource?.location_name || ''}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-2">
                          {new Date(req.created_at).toLocaleDateString(undefined, { dateStyle: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-50/50 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                        Pending
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* GIVE SOMETHING A SECOND LIFE */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-12 bg-emerald-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Have something you don't use?
          </h2>
          <p className="text-sm text-gray-600 mb-8">
            Don't throw it away. Someone else might need it. ♻️
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigateToAddResource('item')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-emerald-50 text-gray-800 font-bold text-base border border-gray-200 hover:border-emerald-300 transition flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              <span>Give an Item</span>
            </button>
            <button
              onClick={() => navigateToAddResource('service')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-teal-50 text-teal-800 font-bold text-base border border-teal-200 hover:border-teal-300 transition flex items-center justify-center gap-2"
            >
              <Clock className="w-5 h-5 text-teal-600" />
              <span>Offer a Service</span>
            </button>
          </div>
        </div>
      </section>

      {/* HOW RELOOP WORKS */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">How ReLoop Works</h2>
          <p className="text-sm text-gray-500 text-center mb-10">Give things a second life in three simple steps.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold text-lg">
                  {step === 1 ? '①' : step === 2 ? '②' : '③'}
                </div>
                <h4 className="text-sm font-bold text-gray-900">
                  {step === 1 ? 'Find' : step === 2 ? 'Connect' : 'Reuse'}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {step === 1
                    ? 'Explore resources shared by the community.'
                    : step === 2
                    ? 'Request a resource or chat with the provider.'
                    : 'Give things a second life and reduce waste.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMUNITY IMPACT */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-12 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">ReLoop Community</h2>
          <p className="text-sm text-gray-500 text-center mb-10">Real impact from our giving community.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[stats.resources, stats.members, stats.completed, stats.pending].map((value, i) => {
              const labels = [
                'Resources Shared',
                'Community Members',
                'Resources Reused',
                'Requests Active',
              ]
              return (
                <div key={i} className="bg-gray-50 rounded-3xl border border-gray-200 p-6 sm:p-8 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">
                    {loading.stats ? (
                      <div className="h-6 w-20 bg-gray-200 rounded mx-auto animate-pulse" />
                    ) : (
                      value
                    )}
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {labels[i]}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="max-w-5xl mx-auto">
          <div className="border-t border-gray-200 pt-8 sm:pt-10 mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-base">♻️</span>
                <span className="font-bold text-gray-800 text-sm">ReLoop</span>
              </div>
              <p className="text-xs text-gray-500 text-center sm:text-left">
                Give. Reuse. Repeat. A community platform for sharing resources.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Explore</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => navigateToExplore(null, null)} className="text-sm text-gray-600 hover:text-emerald-600">Browse Resources</button>
                </li>
                <li>
                  <button onClick={() => navigateToExplore('items', null)} className="text-sm text-gray-600 hover:text-emerald-600">Items</button>
                </li>
                <li>
                  <button onClick={() => navigateToExplore('services', null)} className="text-sm text-gray-600 hover:text-emerald-600">Services</button>
                </li>
                <li>
                  <button onClick={() => navigateToExplore('disposal', null)} className="text-sm text-gray-600 hover:text-emerald-600">Disposal &amp; Recycling</button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Give</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => navigateToAddResource('item')} className="text-sm text-gray-600 hover:text-emerald-600">Give an Item</button>
                </li>
                <li>
                  <button onClick={() => navigateToAddResource('service')} className="text-sm text-gray-600 hover:text-emerald-600">Offer a Service</button>
                </li>
                <li>
                  <button onClick={() => setCurrentView('add-resource')} className="text-sm text-gray-600 hover:text-emerald-600">Post a Request</button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Community</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => setCurrentView('dashboard')} className="text-sm text-gray-600 hover:text-emerald-600">My ReLoop</button>
                </li>
                <li>
                  <button onClick={() => setCurrentView('messages')} className="text-sm text-gray-600 hover:text-emerald-600">Messages</button>
                </li>
                <li>
                  <button onClick={() => setCurrentView('notifications')} className="text-sm text-gray-600 hover:text-emerald-600">Notifications</button>
                </li>
                <li>
                  <button onClick={() => setCurrentView('help')} className="text-sm text-gray-600 hover:text-emerald-600">Help &amp; Support</button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-emerald-600">Terms</a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-emerald-600">Privacy</a>
                </li>
              </ul>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 text-center">
            © 2026 ReLoop. Community-driven circular giving.
          </p>
        </div>
      </footer>
    </div>
  )
}
