import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, Settings, Sparkles, AlertCircle, CheckCircle2, Bell, ShieldCheck, Globe, LogOut } from 'lucide-react'
import AccountLayout from '../components/AccountLayout'

export default function SettingsPage({ setCurrentView }) {
  const { signOut } = useAuth()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [profileVisible, setProfileVisible] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      signOut()
      setCurrentView('explore')
    }
  }

  const handleSavePrefs = async (e) => {
    e.preventDefault()
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2500)
  }

  return (
    <AccountLayout currentView="settings" setCurrentView={setCurrentView} unreadCount={0}>
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-gray-100 text-gray-700 font-semibold text-sm border border-gray-200 shadow-xs transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My ReLoop</span>
        </button>

        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-900">Settings</h2>
          </div>

          {/* Account */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Account</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-gray-50/50">
                <div>
                  <p className="font-semibold text-gray-800">Edit Profile</p>
                  <p className="text-xs text-gray-500">Update name, photo, location, bio</p>
                </div>
                <button
                  onClick={() => setCurrentView('edit-profile')}
                  className="text-xs font-medium text-emerald-600 hover:underline"
                >
                  Open
                </button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-gray-50/50">
                <div>
                  <p className="font-semibold text-gray-800">Account / Security</p>
                  <p className="text-xs text-gray-500">Managed via Supabase authentication</p>
                </div>
                <button
                  onClick={() => setCurrentView('edit-profile')}
                  className="text-xs font-medium text-emerald-600 hover:underline"
                >
                  Open
                </button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Notifications</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Notification Preferences</p>
                    <p className="text-xs text-gray-500">Receive updates about your resources and messages</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Privacy</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Profile Visibility</p>
                    <p className="text-xs text-gray-500">Control who can see your profile</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileVisible}
                    onChange={(e) => setProfileVisible(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Preferences</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-gray-50/50">
                <div>
                  <p className="font-semibold text-gray-800">Location Preferences</p>
                  <p className="text-xs text-gray-500">Set your general area for nearby matches</p>
                </div>
                <button
                  onClick={() => setCurrentView('edit-profile')}
                  className="text-xs font-medium text-emerald-600 hover:underline"
                >
                  Open
                </button>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">About</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-gray-50/50">
                <div>
                  <p className="font-semibold text-gray-800">Terms & Privacy</p>
                  <p className="text-xs text-gray-500">Read our terms and privacy policy</p>
                </div>
                <button className="text-xs font-medium text-emerald-600 hover:underline">View</button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-gray-50/50">
                <div>
                  <p className="font-semibold text-gray-800">Help & Support</p>
                  <p className="text-xs text-gray-500">Get help with ReLoop</p>
                </div>
                <button
                  onClick={() => setCurrentView('help')}
                  className="text-xs font-medium text-emerald-600 hover:underline"
                >
                  Open
                </button>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="pt-6 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl border border-red-200 bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {success && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Preferences saved.</span>
          </div>
        )}
      </div>
    </AccountLayout>
  )
}

