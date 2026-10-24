import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getResourcesByUser,
  getRequestsByRequester,
  getRequestsByProvider,
  getUserWishlist,
} from '../lib/supabase'
import { ArrowLeft, Activity, Sparkles, Package, ClipboardList, Heart, CheckCircle2, Clock } from 'lucide-react'
import AccountLayout from '../components/AccountLayout'

export default function ActivityPage({ setCurrentView }) {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    given: 0, requests: 0, completed: 0, saved: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!user) return
      try {
        setLoading(true)
        const [resData, reqData, wishData] = await Promise.all([
          getResourcesByUser(user.id),
          getRequestsByRequester(user.id),
          getUserWishlist(user.id),
        ])
        const given = (resData?.data || []).filter(
          (r) => (r.provider_id === user.id || r.provider?.id === user.id) && r.status !== 'deleted'
        ).length
        const userRequests = (reqData?.data || []).filter((r) => r.requester_id === user.id)
        const requests = userRequests.length
        const completed = userRequests.filter((r) => r.status === 'completed').length
        const saved = (wishData?.data || []).length
        if (mounted) setStats({ given, requests, completed, saved })
      } catch (err) {
        setError(err.message || 'Failed to load activity.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [user])

  if (loading) {
    return (
      <AccountLayout currentView="activity" setCurrentView={setCurrentView} unreadCount={0}>
        <div className="py-12 text-center">
          <div className="animate-pulse h-8 w-32 bg-gray-200 rounded-full mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading activity...</p>
        </div>
      </AccountLayout>
    )
  }

  const STATS = [
    { label: 'Resources given', value: stats.given, icon: Package, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Requests made', value: stats.requests, icon: ClipboardList, color: 'bg-blue-100 text-blue-600' },
    { label: 'Completed exchanges', value: stats.completed, icon: CheckCircle2, color: 'bg-indigo-100 text-indigo-600' },
    { label: 'Saved resources', value: stats.saved, icon: Heart, color: 'bg-rose-100 text-rose-600' },
  ]

  return (
    <AccountLayout currentView="activity" setCurrentView={setCurrentView} unreadCount={0}>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-gray-100 text-gray-700 font-semibold text-sm border border-gray-200 shadow-xs transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My ReLoop</span>
        </button>

        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-gray-900">My Activity</h2>
        </div>
        <p className="text-sm text-gray-500 mb-8">
          Your impact in the ReLoop community, calculated from real activity.
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.color} shrink-0`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider text-gray-400">
            What these numbers mean
          </h3>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <Package className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">Resources given</p>
                <p className="text-[11px] text-gray-500">Items you have listed and shared on ReLoop.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ClipboardList className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">Requests made</p>
                <p className="text-[11px] text-gray-500">Resources you have asked other members for.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">Completed exchanges</p>
                <p className="text-[11px] text-gray-500">Requests marked as successfully completed.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Heart className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">Saved resources</p>
                <p className="text-[11px] text-gray-500">Items you have saved to your wishlist.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AccountLayout>
  )
}

