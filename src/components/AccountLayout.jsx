import React from 'react'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, Home, Bell, MessageCircle, Package, ClipboardList, Heart, Activity, Settings, HelpCircle, LogOut, User } from 'lucide-react'

const NAV_ITEMS = [
  { key: 'dashboard', label: 'My ReLoop', icon: Home },
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar on mobile */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <button
          onClick={() => setCurrentView('explore')}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-2">
          <img
            src={profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile?.full_name || user?.email || 'user')}`}
            alt="Avatar"
            className="w-8 h-8 rounded-full object-cover border border-gray-200"
          />
          <button
            onClick={handleLogout}
            className="ml-2 p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Desktop-only sidebar + content */}
        <div className="hidden md:flex gap-8">
          <nav className="w-72 shrink-0">
            <div className="px-4 pb-6">
              <div className="flex items-center gap-3 mb-6">
                <img
                  src={profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile?.full_name || user?.email || 'user')}`}
                  alt="Avatar"
                  className="w-10 h-10 rounded-2xl object-cover border border-emerald-100"
                />
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-tight">
                    {profile?.full_name || user?.email?.split('@')[0] || 'You'}
                  </p>
                  <p className="text-xs text-gray-500">Member</p>
                </div>
              </div>

              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive = currentView === item.key
                return (
                  <button
                    key={item.key}
                    onClick={() => setCurrentView(item.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </nav>

          <main className="flex-1">
            {children}
          </main>
        </div>

        {/* Mobile-only bottom nav for account section */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 pb-6 pt-3">
          <div className="grid grid-cols-5 gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => setCurrentView(item.key)}
                  className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              )
            })}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
