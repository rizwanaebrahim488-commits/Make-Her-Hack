import { useState, useEffect, useMemo } from 'react'
import { getResources } from '../lib/supabase'
import ResourceCard from '../components/ResourceCard'
import ResourceCardSkeleton from '../components/ResourceCardSkeleton'
import { Search, RotateCcw, AlertTriangle, Sparkles, Filter } from 'lucide-react'

// Main resource categories
const RESOURCE_TYPES = [
  { id: 'all', label: 'All Resources', icon: '🌐' },
  { id: 'items', label: 'Items', icon: '🪑' },
  { id: 'services', label: 'Services', icon: '🛠' },
  { id: 'requests', label: 'Requests', icon: '📢' },
  { id: 'disposal', label: 'Disposal & Recycling', icon: '♻️' },
  { id: 'plants', label: 'Plants & Seeds', icon: '🌱' },
  { id: 'others', label: 'Others', icon: '📦' },
]

// Subcategories per resource type
const SUB_CATEGORIES = {
  items: ['All', 'Furniture', 'Electronics', 'Books', 'Clothes', 'Plants', 'Home & Kitchen', 'School Supplies', 'Others'],
  services: ['All', 'Repair', 'Cleaning', 'Tutoring', 'Transport', 'Gardening', 'Others'],
  requests: ['All', 'Books', 'Furniture', 'Electronics', 'Clothes', 'Home & Kitchen', 'Health & Mobility', 'Services & Help', 'Others'],
  disposal: ['All', 'Floral Waste', 'E-Waste', 'Plastic', 'Clothes', 'Paper', 'Metal'],
  plants: ['All', 'Indoor Plants', 'Plant Cuttings', 'Seeds', 'Plant Pots', 'Gardening Resources'],
  others: ['All', 'Upcycling & Storage', 'Packing Supplies', 'Craft & Art', 'Others'],
}

export default function ExploreResourcesPage({
  onViewDetails,
  onOpenChat,
  initialCategory,
  initialSearch,
}) {
  // Read initial query params if any
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()
  const initialSearchFromUrl = searchParams.get('search') || ''
  const initialCategoryFromUrl = searchParams.get('category') || 'all'

  // Filter states
  const [activeTab, setActiveTab] = useState(initialCategory || initialCategoryFromUrl || 'all')
  const [universalSearch, setUniversalSearch] = useState(
    initialSearch !== undefined && initialSearch !== '' ? initialSearch : initialSearchFromUrl
  )
  const [typeFilter, setTypeFilter] = useState('All') // 'All' | 'Free' | 'Paid'
  const [selectedSubCategory, setSelectedSubCategory] = useState('All')

  // Sync prop changes from HomePage searches and category cards
  useEffect(() => {
    if (initialCategory) {
      setActiveTab(initialCategory)
      setSelectedSubCategory('All')
    }
  }, [initialCategory])

  useEffect(() => {
    if (initialSearch !== undefined) {
      setUniversalSearch(initialSearch)
    }
  }, [initialSearch])

  // Data states
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dataSource, setDataSource] = useState('local')

  const loadResources = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getResources({
        resourceType: activeTab === 'all' ? null : activeTab,
        category: selectedSubCategory === 'All' ? null : selectedSubCategory,
        typeFilter: typeFilter,
        searchTerm: universalSearch,
      })
      setResources(res.data || [])
      setDataSource(res.source)
    } catch (err) {
      console.error('Resource fetch error:', err)
      setError('Something went wrong while loading resources.')
    } finally {
      setLoading(false)
    }
  }

  // Reload when any filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      loadResources()
    }, 150)
    return () => clearTimeout(timer)
  }, [activeTab, selectedSubCategory, typeFilter, universalSearch])

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setSelectedSubCategory('All')
    setTypeFilter('All')
  }

  const handleResetFilters = () => {
    setActiveTab('all')
    setSelectedSubCategory('All')
    setTypeFilter('All')
    setUniversalSearch('')
  }

  const viewConfig = useMemo(() => {
    switch (activeTab) {
      case 'items':
        return {
          title: 'EXPLORE ITEMS',
          subtitle: 'Discover free and affordable items looking for a second life in your neighborhood.',
          searchPlaceholder: 'Search items (e.g. study table, laptop, books, clothes)...',
          gridHeading: 'Recommended & Available Items',
        }
      case 'services':
        return {
          title: 'EXPLORE SERVICES',
          subtitle: 'Find community members offering repairs, tutoring, cleaning & local help.',
          searchPlaceholder: 'Search services (e.g. laptop repair, maths tuition, cleaning)...',
          gridHeading: 'Available Community Services',
        }
      case 'requests':
        return {
          title: 'COMMUNITY REQUESTS',
          subtitle: 'Discover what items, skills, or support neighbors are actively seeking. Lend a hand or share what you have.',
          searchPlaceholder: 'Search community requests (e.g. textbooks, study table, laptop, wheelchair, repair)...',
          gridHeading: 'Open Requests by Community Members',
        }
      case 'disposal':
        return {
          title: 'DISPOSAL & RECYCLING',
          subtitle: 'Responsible drop-off hubs for floral waste, electronics, plastics, and textiles.',
          searchPlaceholder: 'What do you want to dispose? (e.g. floral waste, e-waste, plastic)...',
          gridHeading: 'Disposal & Recycling Hubs',
        }
      case 'plants':
        return {
          title: 'EXPLORE PLANTS & SEEDS',
          subtitle: 'Adopt cuttings, healthy plants, seeds, and gardening resources.',
          searchPlaceholder: 'Search plants (e.g. money plant, aloe vera, seeds, pots)...',
          gridHeading: 'Available Plants & Garden Supplies',
        }
      case 'others':
        return {
          title: 'EXPLORE OTHER RESOURCES',
          subtitle: 'Upcycling materials, glass jars, shipping cartons, and crafting supplies.',
          searchPlaceholder: 'Search other resources (e.g. jars, cartons, art supplies)...',
          gridHeading: 'Other Community Resources',
        }
      default:
        return {
          title: 'EXPLORE RESOURCES',
          subtitle: 'Discover items, services, and recycling resources shared by your community.',
          searchPlaceholder: 'Search ReLoop (study table, laptop, bike repair, floral waste)...',
          gridHeading: 'All Community Resources',
        }
    }
  }, [activeTab])

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-white to-gray-50 pb-20">
      
      {/* 1. HERO + UNIVERSAL SEARCH */}
      <section className="bg-white border-b border-emerald-100/60 pt-8 pb-10 sm:pt-12 sm:pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-800 text-xs font-semibold mb-3 border border-emerald-200/60">
            <span>🌱</span> Give. Reuse. Repeat.
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            {viewConfig.title}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {viewConfig.subtitle}
          </p>

          {/* Large Universal Search Bar */}
          <div className="mt-6 sm:mt-8 max-w-3xl mx-auto">
            <div className="text-left mb-2 px-2 flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <span>🔍</span>
                <span>What are you looking for?</span>
              </label>
              <span className="text-[11px] text-gray-400 hidden sm:inline">
                Instant search across items, services & disposal
              </span>
            </div>

            <div className="relative flex items-center bg-white rounded-3xl shadow-xl shadow-emerald-900/5 border border-emerald-200/80 p-2 sm:p-2.5 transition focus-within:ring-4 focus-within:ring-emerald-500/15 focus-within:border-emerald-500">
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 ml-3 shrink-0" />
              <input
                type="text"
                value={universalSearch}
                onChange={(e) => setUniversalSearch(e.target.value)}
                placeholder={viewConfig.searchPlaceholder}
                className="w-full px-3 py-2 text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-transparent focus:outline-hidden"
              />
              {universalSearch && (
                <button
                  type="button"
                  onClick={() => setUniversalSearch('')}
                  className="mr-2 text-xs font-medium text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Suggestions Tags */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-3 text-xs text-gray-500">
              <span className="font-semibold text-gray-600">Popular:</span>
              {['study table', 'laptop', 'books', 'bike repair', 'tutoring', 'floral waste', 'e-waste', 'plants'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setUniversalSearch(tag)}
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 text-gray-600 hover:text-emerald-700 transition cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. RESOURCE CATEGORIES SELECTOR TABS */}
      <section className="sticky top-16 sm:top-20 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar scroll-smooth">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mr-1 shrink-0 hidden md:inline">
              Categories:
            </span>

            {RESOURCE_TYPES.map((type) => {
              const isActive = activeTab === type.id
              return (
                <button
                  key={type.id}
                  onClick={() => handleTabChange(type.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-102'
                      : 'bg-gray-50 hover:bg-emerald-50/70 text-gray-700 border border-gray-200/80 hover:border-emerald-300'
                  }`}
                >
                  <span className="text-base">{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* 3. SUB-FILTERS BAR (Only for specific category views) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          
          {/* Subcategories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {activeTab !== 'all' && SUB_CATEGORIES[activeTab] ? (
              SUB_CATEGORIES[activeTab].map((cat) => {
                const isSelected = selectedSubCategory === cat
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedSubCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-gray-900 text-white shadow-xs'
                        : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                )
              })
            ) : (
              <div className="text-xs font-medium text-gray-500 flex items-center gap-2">
                <span>Showing resources from all categories</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Select a category tab above to narrow down</span>
              </div>
            )}
          </div>

          {/* Pricing Mode Filter + Reset Button */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            {activeTab !== 'requests' && (
              <>
                <span className="text-xs font-medium text-gray-400">Pricing:</span>
                <div className="inline-flex p-1 bg-gray-100 rounded-2xl border border-gray-200">
                  {['All', 'Free', 'Paid'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setTypeFilter(f)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                        typeFilter === f
                          ? 'bg-white text-emerald-700 shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </>
            )}

            {(universalSearch || selectedSubCategory !== 'All' || typeFilter !== 'All' || activeTab !== 'all') && (
              <button
                onClick={handleResetFilters}
                title="Reset all filters"
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </section>

      {/* 4. MAIN RESOURCE CARDS LISTINGS AREA (ALWAYS VISIBLE) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              {viewConfig.gridHeading}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {!loading && `${resources.length} resource${resources.length === 1 ? '' : 's'} available`}
              {dataSource === 'supabase' && ' • Live Supabase DB'}
              {universalSearch && ` • Matching "${universalSearch}"`}
            </p>
          </div>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="p-6 bg-red-50 border border-red-200 rounded-3xl text-center max-w-lg mx-auto my-12">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-red-800">{error}</h3>
            <p className="text-xs text-red-600 mt-1 mb-4">
              We couldn't load resources from the backend.
            </p>
            <button
              onClick={loadResources}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ResourceCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && resources.length === 0 && (
          <div className="py-16 px-4 text-center max-w-md mx-auto bg-white rounded-3xl border border-gray-100 shadow-xs my-8">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-2xl">
              🔍
            </div>
            <h3 className="text-lg font-bold text-gray-900">No resources found</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
              Nothing matches your current search or category filters.
              Try clearing your search or explore a different category! ♻️
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* RESOURCE CARDS GRID */}
        {!loading && !error && resources.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {resources.map((item) => (
              <ResourceCard
                key={item.id}
                resource={item}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        )}
      </main>

    </div>
  )
}
