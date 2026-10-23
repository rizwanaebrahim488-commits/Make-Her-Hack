import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Home, Compass, Plus, Heart, User } from 'lucide-react'

export default function MobileBottomNav({ currentView, setCurrentView }) {
  const { user, requireAuth } = useAuth()

  const isAccountView = [
    'dashboard',
    'resources',
    'requests',
    'messages',
    'chat',
    'notifications',
    'wishlist',
    'activity',
    'settings',
    'help',
    'edit-profile',
  ].includes(currentView)

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/90 shadow-lg px-2 py-1.5 flex items-center justify-around safe-bottom"
      aria-label="Mobile Navigation"
    >
      {/* 1. Home */}
      <button
        onClick={() => setCurrentView('home')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
          currentView === 'home'
            ? 'text-emerald-600 font-bold'
            : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        <Home className={`w-5 h-5 ${currentView === 'home' ? 'stroke-[2.5]' : ''}`} />
        <span className="text-[10px] mt-0.5">Home</span>
      </button>

      {/* 2. Explore */}
      <button
        onClick={() => setCurrentView('explore')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
          currentView === 'explore'
            ? 'text-emerald-600 font-bold'
            : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        <Compass className={`w-5 h-5 ${currentView === 'explore' ? 'stroke-[2.5]' : ''}`} />
        <span className="text-[10px] mt-0.5">Explore</span>
      </button>

      {/* 3. Center Prominent 'Give' Button */}
      <button
        onClick={() =>
          requireAuth(() => {
            setCurrentView('add-resource')
          })
        }
        className="flex flex-col items-center -mt-5 group"
        aria-label="Give an Item"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 group-hover:scale-105 active:scale-95 transition">
          <Plus className="w-6 h-6 stroke-[3]" />
        </div>
        <span className="text-[10px] font-bold text-emerald-800 mt-1">Give</span>
      </button>

      {/* 4. Requests */}
      <button
        onClick={() =>
          requireAuth(() => {
            setCurrentView('requests')
          })
        }
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
          currentView === 'requests'
            ? 'text-emerald-600 font-bold'
            : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        <Heart className={`w-5 h-5 ${currentView === 'requests' ? 'fill-emerald-600 stroke-emerald-600' : ''}`} />
        <span className="text-[10px] mt-0.5">Requests</span>
      </button>

      {/* 5. Account / Dashboard */}
      <button
        onClick={() =>
          requireAuth(() => {
            setCurrentView('dashboard')
          })
        }
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
          isAccountView && currentView !== 'requests'
            ? 'text-emerald-600 font-bold'
            : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        <User className={`w-5 h-5 ${isAccountView && currentView !== 'requests' ? 'stroke-[2.5]' : ''}`} />
        <span className="text-[10px] mt-0.5">{user ? 'Account' : 'Sign In'}</span>
      </button>
    </nav>
  )
}
