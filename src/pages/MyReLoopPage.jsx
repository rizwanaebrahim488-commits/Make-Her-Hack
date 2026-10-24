import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getResourcesByUser,
  getUnreadNotificationCount,
  getConversations,
  getUserWishlist,
} from '../lib/supabase'
import {
  Bell, MessageCircle, Package, ClipboardList, Heart, Activity, MapPin, Sparkles, Calendar, Users, Star, ShieldCheck, Gift
} from 'lucide-react'
import AccountLayout from '../components/AccountLayout'
import LivingEcoTreeCard from '../components/LivingEcoTreeCard'

const STATS = [
  { label: 'Resources given', icon: Package, key: 'resources' },
  { label: 'Requests made', icon: ClipboardList, key: 'requests' },
  { label: 'Completed exchanges', icon: Users, key: 'completed' },
  { label: 'Saved resources', icon: Heart, key: 'saved' },
]

const QUICK_LINKS = [
  { key: 'resources', label: 'My Resources', icon: Package, desc: 'Manage items you are giving' },
  { key: 'requests', label: 'My Requests', icon: ClipboardList, desc: 'Track your resource requests' },
  { key: 'rewards', label: 'My Rewards', icon: Gift, desc: 'Demo discounts & coupon codes' },
  { key: 'wishlist', label: 'Wishlist', icon: Heart, desc: 'Saved items you love' },
]

export default function MyReLoopPage({ setCurrentView }) {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState({
    resources: 0, requests: 0, completed: 0, saved: 0, messages: 0
  })
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [memberSince, setMemberSince] = useState(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        if (user) {
          // Resources given
          const { data: resources } = await getResourcesByUser(user.id)
          // Wishlist / saved
          const { data: wishlist } = await getUserWishlist(user.id)
          // Conversations / messages
          const { data: conversations } = await getConversations(user.id)
          // Unread notifications
          const { count } = await getUnreadNotificationCount(user.id)

          if (mounted) {
            setStats({
              resources: resources?.length || 0,
              requests: 0,
              completed: 0,
              saved: wishlist?.length || 0,
              messages: conversations?.length || 0,
            })
            setUnreadCount(count || 0)
          }
        }
        if (mounted && profile?.created_at) {
          setMemberSince(new Date(profile.created_at).getFullYear())
        }
      } catch (err) {
        setError(err.message || 'Failed to load your account data.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [user, profile])

  if (loading) {
    return (
      <AccountLayout currentView="dashboard" setCurrentView={setCurrentView} unreadCount={0}>
        <div className="py-12 text-center">
          <div className="animate-pulse h-8 w-32 bg-gray-200 rounded-full mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading your ReLoop account...</p>
        </div>
      </AccountLayout>
    )
  }

  const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile?.full_name || user?.email || 'user')}`
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Community Member'
  const location = profile?.location || 'Not set'

  return (
    <AccountLayout currentView="dashboard" setCurrentView={setCurrentView} unreadCount={unreadCount}>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => setCurrentView('explore')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-gray-100 text-gray-700 font-semibold text-sm border border-gray-200 shadow-xs transition"
        >
          <ArrowLeftIcon />
          <span>Back to Explore</span>
        </button>

        <div className="mt-8 sm:mt-12">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">My ReLoop</h1>
          <p className="text-sm text-gray-500 mt-1">
            Your community giving dashboard. Manage your items, requests, and connections.
          </p>
        </div>

        {/* Profile Header Card */}
        <div className="mt-6 bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-shrink-0">
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-20 h-20 rounded-3xl object-cover border-2 border-emerald-100"
              />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {displayName}
                </h2>
                {Boolean(profile?.is_verified ?? (Number(profile?.avg_rating || 5.0) >= 4.5 && Number(profile?.total_reviews || 0) >= 5)) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified Member</span>
                  </span>
                )}
                {memberSince && (
                  <span className="text-sm text-gray-500 font-medium">
                    • Member since {memberSince}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <div className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  <span>{Number(profile?.avg_rating || 5.0).toFixed(1)} / 5.0</span>
                  <span className="text-gray-400 font-normal">({profile?.total_reviews || 0} reviews)</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{location}</span>
                </div>
              </div>
            </div>
            <div className="self-start sm:self-center">
              <button
                onClick={() => setCurrentView('edit-profile')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-200 hover:bg-emerald-100 transition"
              >
                <span className="w-4 h-4">✎</span>
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* Living Eco-Tree Progression Card */}
        <div className="mt-6">
          <LivingEcoTreeCard
            setCurrentView={setCurrentView}
            onOpenRewards={() => setCurrentView('rewards')}
          />
        </div>

        {/* Quick stats + links row */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Notifications</p>
                <p className="text-lg font-bold text-gray-900">{unreadCount} unread</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Messages</p>
                <p className="text-lg font-bold text-gray-900">{stats.messages} conversations</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Activity score</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats.resources + stats.saved}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="mt-8">
          <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider text-gray-400">
            Quick access
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon
              return (
                <button
                  key={link.key}
                  onClick={() => setCurrentView(link.key)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-gray-200 text-left hover:bg-gray-50 hover:border-gray-300 transition text-sm"
                >
                  <Icon className="w-4 h-4 shrink-0 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-gray-800">{link.label}</p>
                    <p className="text-xs text-gray-500">{link.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Activity summary */}
        <div className="mt-8 bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wider text-gray-400">
            My Activity
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((s) => {
              const Icon = s.icon
              let value = 0
              if (s.key === 'resources') value = stats.resources
              if (s.key === 'saved') value = stats.saved
              return (
                <div key={s.key} className="text-center p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-600">
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-black text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                </div>
              )
            })}
            {/* Requests + completed placeholders calculated from data */}
            <div className="text-center p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-3 text-blue-600">
                <ClipboardList className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-gray-900">{stats.requests}</p>
              <p className="text-xs text-gray-500 mt-1">Requests made</p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center mx-auto mb-3 text-indigo-600">
                <Calendar className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-gray-900">{stats.completed}</p>
              <p className="text-xs text-gray-500 mt-1">Completed exchanges</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>
    </AccountLayout>
  )
}

// Fallback icon for back arrow since we import lucide locally
function ArrowLeftIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  )
}

