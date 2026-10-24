import React from 'react'
import { useAuth } from '../context/AuthContext'
import {
  ArrowLeft,
  Home,
  Bell,
  MessageCircle,
  Package,
  ClipboardList,
  Heart,
  Activity,
  Settings,
  HelpCircle,
  LogOut,
  User,
  Gift,
} from 'lucide-react'

const NAV_ITEMS = [
  { key: 'dashboard', label: 'My ReLoop', icon: Home },
  { key: 'rewards', label: 'My Rewards', icon: Gift },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'messages', label: 'Messages', icon: MessageCircle },
  { key: 'resources', label: 'My Resources', icon: Package },
  { key: 'requests', label: 'My Requests', icon: ClipboardList },
  { key: 'wishlist', label: 'Wishlist', icon: Heart },
  { key: 'activity', label: 'Activity', icon: Activity },
  { key: 'settings', label: 'Settings', icon: Settings },
  { key: 'help', label: 'Help & Support', icon: HelpCircle },
]

export default function AccountLayout({ children, currentView, setCurrentView, unreadCount }) {
  const { user, profile, signOut } = useAuth()

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      signOut()
      setCurrentView('explore')
    }
  }

  const currentItem = NAV_ITEMS.find((item) => item.key === currentView)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 1. Mobile Top Header Bar */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
        <button
          onClick={() => setCurrentView('explore')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Explore</span>
        </button>

        <span className="text-xs font-bold text-gray-800">
          {currentItem ? currentItem.label : 'My Account'}
        </span>

        <div className="flex items-center gap-1.5">
          <img
            src={profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile?.full_name || user?.email || 'user')}`}
            alt="Avatar"
            className="w-7 h-7 rounded-full object-cover border border-emerald-200"
          />
          <button
            onClick={handleLogout}
            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
            aria-label="Log Out"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Mobile Horizontal Navigation Tab Bar */}
      <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-gray-200 px-3 py-2 sticky top-[49px] z-10 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.key
            return (
              <button
                key={item.key}
                onClick={() => setCurrentView(item.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/70 border border-gray-200/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.key === 'notifications' && unreadCount > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-emerald-700' : 'bg-red-500 text-white'
                    }`}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Main Content Container */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 flex-1">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          {/* Desktop-only Sidebar */}
          <nav className="hidden md:block w-64 lg:w-72 shrink-0">
            <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs sticky top-24">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
                <img
                  src={profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile?.full_name || user?.email || 'user')}`}
                  alt="Avatar"
                  className="w-11 h-11 rounded-2xl object-cover border border-emerald-100 shadow-2xs"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 leading-tight truncate">
                    {profile?.full_name || user?.email?.split('@')[0] || 'You'}
                  </p>
                  <p className="text-xs text-emerald-600 font-medium">ReLoop Member</p>
                </div>
              </div>

              <div className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon
                  const isActive = currentView === item.key
                  return (
                    <button
                      key={item.key}
                      onClick={() => setCurrentView(item.key)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 font-bold shadow-2xs'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                      {item.key === 'notifications' && unreadCount > 0 && (
                        <span className="ml-auto px-2 py-0.5 rounded-full bg-red-500 text-[10px] text-white font-bold">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </nav>

          {/* Main Content Area - Always Rendered for Mobile & Desktop */}
          <main className="flex-1 w-full min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
