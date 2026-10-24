import { useState, useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import AuthModal from './components/AuthModal'
import DatabaseNoticeBanner from './components/DatabaseNoticeBanner'
import HomePage from './pages/HomePage'
import ExploreResourcesPage from './pages/ExploreResourcesPage'
import ResourceDetailsPage from './pages/ResourceDetailsPage'
// Account pages
import MyReLoopPage from './pages/MyReLoopPage'
import EditProfilePage from './pages/EditProfilePage'
import NotificationsPage from './pages/NotificationsPage'
import MessagesPage from './pages/MessagesPage'
import ChatPage from './pages/ChatPage'
import MyResourcesPage from './pages/MyResourcesPage'
import MyRequestsPage from './pages/MyRequestsPage'
import WishlistPage from './pages/WishlistPage'
import ActivityPage from './pages/ActivityPage'
import SettingsPage from './pages/SettingsPage'
import HelpSupportPage from './pages/HelpSupportPage'
import AddResourcePage from './pages/AddResourcePage'
import MatchTheMaterialGame from './pages/MatchTheMaterialGame'
import MyRewardsPage from './pages/MyRewardsPage'
import MobileBottomNav from './components/MobileBottomNav'
import ProviderProfileModal from './components/ProviderProfileModal'
import RateProviderModal from './components/RateProviderModal'
import MilestoneRewardModal from './components/MilestoneRewardModal'

function AppContent() {
  const [currentView, setCurrentView] = useState('explore')
  const [selectedResource, setSelectedResource] = useState(null)
  const [previousView, setPreviousView] = useState('explore')
  const [chat, setChat] = useState(null)
  const [exploreFilter, setExploreFilter] = useState({ category: 'all', search: '' })
  const [globalProfileModalProvider, setGlobalProfileModalProvider] = useState(null)
  const [globalRateModalTarget, setGlobalRateModalTarget] = useState(null)
  const [unlockedMilestoneReward, setUnlockedMilestoneReward] = useState(null)

  const handleNavigateToExplore = ({ category = 'all', search = '' } = {}) => {
    setExploreFilter({ category: category || 'all', search: search || '' })
    setPreviousView(currentView)
    setCurrentView('explore')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleOpenResourceDetails = (resource) => {
    setSelectedResource(resource)
    setPreviousView(currentView === 'details' ? previousView : currentView)
    setCurrentView('details')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Listen for resource opens from Home page cards
  useEffect(() => {
    const handler = (e) => {
      if (e.detail && e.detail.id) {
        setSelectedResource(e.detail)
        setPreviousView(currentView === 'details' ? previousView : currentView)
        setCurrentView('details')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
    window.addEventListener('reloop-open-resource', handler)
    return () => window.removeEventListener('reloop-open-resource', handler)
  }, [currentView, previousView])

  // Listen for provider profile modal triggers from any resource card
  useEffect(() => {
    const handler = (e) => {
      if (e.detail) {
        setGlobalProfileModalProvider(e.detail)
      }
    }
    window.addEventListener('reloop-open-provider-profile', handler)
    return () => window.removeEventListener('reloop-open-provider-profile', handler)
  }, [])

  // Listen for tree growth milestone reward unlocks
  useEffect(() => {
    const handler = (e) => {
      if (e.detail && e.detail.reward) {
        setUnlockedMilestoneReward(e.detail.reward)
      }
    }
    window.addEventListener('reloop-milestone-unlocked', handler)
    return () => window.removeEventListener('reloop-milestone-unlocked', handler)
  }, [])

  const handleOpenChat = ({ resourceId, otherUserId, otherName, resourceTitle }) => {
    setChat({ resourceId, otherUserId, otherName, resourceTitle })
    setCurrentView('chat')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 selection:bg-emerald-500 selection:text-white">
      {/* Database Setup Notice if tables not yet created */}
      <DatabaseNoticeBanner />

      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenResourceDetails={handleOpenResourceDetails}
        onOpenChat={handleOpenChat}
      />

      {/* Main Content View Switcher */}
      <div className="flex-1 pb-16 md:pb-0">
        {currentView === 'home' && (
          <HomePage
            onExploreClick={handleNavigateToExplore}
            setCurrentView={setCurrentView}
            onOpenResourceDetails={handleOpenResourceDetails}
          />
        )}

        {currentView === 'explore' && (
          <ExploreResourcesPage
            onViewDetails={handleOpenResourceDetails}
            onOpenChat={handleOpenChat}
            initialCategory={exploreFilter.category}
            initialSearch={exploreFilter.search}
          />
        )}

        {currentView === 'details' && (
          <ResourceDetailsPage
            resource={selectedResource}
            onBack={() => setCurrentView(previousView || 'explore')}
            onOpenChat={handleOpenChat}
            onManageMyResources={() => setCurrentView('resources')}
          />
        )}

        {/* Account section */}
        {currentView === 'dashboard' && (
          <MyReLoopPage setCurrentView={setCurrentView} />
        )}
        {currentView === 'edit-profile' && (
          <EditProfilePage setCurrentView={setCurrentView} />
        )}
        {currentView === 'notifications' && (
          <NotificationsPage
            setCurrentView={setCurrentView}
            onOpenChat={handleOpenChat}
            onOpenResourceDetails={handleOpenResourceDetails}
          />
        )}
        {currentView === 'messages' && (
          <MessagesPage
            setCurrentView={setCurrentView}
            onOpenChat={handleOpenChat}
            onOpenResourceDetails={handleOpenResourceDetails}
          />
        )}
        {currentView === 'chat' && (
          <ChatPage
            setCurrentView={setCurrentView}
            chat={chat}
            onOpenResourceDetails={handleOpenResourceDetails}
          />
        )}
        {currentView === 'resources' && (
          <MyResourcesPage
            setCurrentView={setCurrentView}
            onOpenResourceDetails={handleOpenResourceDetails}
            onOpenChat={handleOpenChat}
          />
        )}
        {currentView === 'requests' && (
          <MyRequestsPage
            setCurrentView={setCurrentView}
            onOpenChat={handleOpenChat}
            onOpenResourceDetails={handleOpenResourceDetails}
          />
        )}
        {currentView === 'wishlist' && (
          <WishlistPage
            setCurrentView={setCurrentView}
            onOpenResourceDetails={handleOpenResourceDetails}
          />
        )}
        {currentView === 'activity' && (
          <ActivityPage setCurrentView={setCurrentView} />
        )}
        {currentView === 'settings' && (
          <SettingsPage setCurrentView={setCurrentView} />
        )}
        {currentView === 'help' && (
          <HelpSupportPage setCurrentView={setCurrentView} />
        )}
        {currentView === 'rewards' && (
          <MyRewardsPage setCurrentView={setCurrentView} />
        )}
        {currentView === 'game' && (
          <MatchTheMaterialGame
            setCurrentView={setCurrentView}
            onNavigateToExplore={handleNavigateToExplore}
          />
        )}
        {currentView === 'add-resource' && (
          <AddResourcePage setCurrentView={setCurrentView} />
        )}
      </div>

      {/* Community Footer */}
      <footer className="bg-white border-t border-gray-200/80 py-10 px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-base">♻️</span>
            <span className="font-bold text-gray-800 text-sm">ReLoop</span>
            <span>— Give. Reuse. Repeat.</span>
          </div>
          <p>
            Community-driven circular resource sharing. Built for sustainability.
          </p>
          <div className="flex items-center gap-4 text-gray-400">
            <span>Items</span>
            <span>•</span>
            <span>Services</span>
            <span>•</span>
            <span>Disposal</span>
            <span>•</span>
            <span>Plants</span>
          </div>
        </div>
      </footer>

      {/* Mobile-Friendly Fixed Bottom Navigation Bar */}
      <MobileBottomNav currentView={currentView} setCurrentView={setCurrentView} />

      {/* Action-Based Authentication Modal */}
      <AuthModal />

      {/* Global Provider Profile & Reviews Modal */}
      <ProviderProfileModal
        isOpen={Boolean(globalProfileModalProvider)}
        onClose={() => setGlobalProfileModalProvider(null)}
        providerId={globalProfileModalProvider?.id}
        initialProvider={globalProfileModalProvider}
        onOpenRateModal={(prov) => {
          setGlobalRateModalTarget({ provider: prov })
        }}
        onOpenChat={handleOpenChat}
      />

      {/* Global Rate Provider Modal */}
      <RateProviderModal
        isOpen={Boolean(globalRateModalTarget)}
        onClose={() => setGlobalRateModalTarget(null)}
        resource={globalRateModalTarget?.resource}
        provider={globalRateModalTarget?.provider}
      />

      {/* Milestone Level-Up Reward Modal */}
      <MilestoneRewardModal
        isOpen={Boolean(unlockedMilestoneReward)}
        onClose={() => setUnlockedMilestoneReward(null)}
        reward={unlockedMilestoneReward}
        onNavigateToRewards={() => {
          setUnlockedMilestoneReward(null)
          setCurrentView('rewards')
        }}
      />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
