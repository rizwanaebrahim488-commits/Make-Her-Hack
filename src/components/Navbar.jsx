import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { PlusCircle, Compass, Home, LogIn, LogOut, User, Heart, Bell, MessageCircle, Sparkles, Gift } from 'lucide-react'
import EcoScorePill from './EcoScorePill'

export default function Navbar({ currentView, setCurrentView }) {
  const { user, profile, setIsAuthModalOpen, setAuthMode, signOut, requireAuth } = useAuth()
  const [session, setSession] = useState(null)

  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const handleGiveItem = () => {
    requireAuth(() => {
      setCurrentView('add-resource')
    })
  }

  const handleMyReLoop = () => {
    requireAuth(() => {
      setCurrentView('dashboard')
    })
  }

  const handleRequests = () => {
    requireAuth(() => {
      setCurrentView('requests')
    })
  }

  const handleNotifications = () => {
    requireAuth(() => {
      setCurrentView('notifications')
    })
  }

  const handleMessages = () => {
    requireAuth(() => {
      setCurrentView('messages')
    })
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-emerald-100/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <div 
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
              <span className="text-xl">♻️</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
                  Re<span className="text-emerald-600">Loop</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Community
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium hidden sm:block">
                Give. Reuse. Repeat.
              </p>
            </div>
          </div>

          {/* Center Navigation (Desktop / Tablet) */}
          <nav className="hidden sm:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentView('home')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                currentView === 'home'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </button>

            <button
              onClick={() => setCurrentView('explore')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                currentView === 'explore'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explore</span>
            </button>

            <button
              onClick={handleRequests}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                currentView === 'requests'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Requests</span>
            </button>

            <button
              onClick={() => setCurrentView('rewards')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                currentView === 'rewards'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/60'
              }`}
              title="View Eco-Tree Milestone Rewards"
            >
              <Gift className="w-4 h-4 text-emerald-600" />
              <span>Rewards</span>
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Eco-Score & Tree Level Pill */}
            <EcoScorePill onOpenEcoTree={handleMyReLoop} />

            {/* Notifications */}
            {(session || user) && (
              <button
                onClick={handleNotifications}
                className="p-2 text-gray-400 hover:text-emerald-600 rounded-xl hover:bg-gray-50 transition"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
              </button>
            )}

            {/* Messages */}
            {(session || user) && (
              <button
                onClick={handleMessages}
                className="relative p-2 text-gray-400 hover:text-emerald-600 rounded-xl hover:bg-gray-50 transition"
                aria-label="Messages"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            )}

            {/* My ReLoop (account) */}
            <button
              onClick={handleMyReLoop}
              className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 font-semibold text-xs sm:text-sm border border-emerald-200/60 transition"
            >
              <User className="w-4 h-4" />
              <span>My ReLoop</span>
            </button>

            {/* Give an Item Button */}
            <button
              onClick={handleGiveItem}
              className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100/80 text-teal-800 font-semibold text-xs sm:text-sm border border-teal-200/60 transition"
            >
              <PlusCircle className="w-4 h-4 text-teal-600" />
              <span>Give an Item</span>
            </button>

            {/* Auth Profile / Login */}
            {(session || user) ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMyReLoop}
                  className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 transition cursor-pointer group shadow-2xs"
                  title="Open My ReLoop Dashboard"
                >
                  <img
                    src={profile?.avatar_url || (user || session?.user)?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile?.full_name || (user || session?.user)?.user_metadata?.full_name || (user || session?.user)?.email || 'User')}`}
                    alt="User Avatar"
                    className="w-7 h-7 rounded-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="text-xs font-semibold text-gray-700 group-hover:text-emerald-800 max-w-[100px] truncate hidden sm:inline">
                    {profile?.full_name || (user || session?.user)?.user_metadata?.full_name || (user || session?.user)?.email?.split('@')[0]}
                  </span>
                </button>

                <button
                  onClick={signOut}
                  title="Sign Out"
                  className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition cursor-pointer"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('signin')
                  setIsAuthModalOpen(true)
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold text-xs sm:text-sm hover:bg-gray-50 transition"
              >
                <LogIn className="w-4 h-4 text-gray-500" />
                <span>Sign In</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}
