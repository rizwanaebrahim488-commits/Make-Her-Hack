import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import {
  getRequestsByRequester,
  updateRequestStatus,
} from '../lib/supabase'
import { ArrowLeft, ClipboardList, Package, Clock, MessageCircle } from 'lucide-react'
import AccountLayout from '../components/AccountLayout'

const STATUS_LABELS = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  completed: 'Completed',
}

const STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  cancelled: 'bg-gray-50 text-gray-700 border-gray-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
}

export default function MyRequestsPage({ setCurrentView, onOpenChat, onOpenResourceDetails }) {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        if (user) {
          // Personal view: requests made by this user
          const { data } = await getRequestsByRequester(user.id)
          if (mounted) setRequests(data || [])
        } else {
          // Public view: all pending requests
          const { data, error: err } = await supabase
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
            .limit(20)
          if (err) throw err
          if (mounted) setRequests(data || [])
        }
      } catch (err) {
        setError(err.message || 'Failed to load requests.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [user])

  const handleAccept = async (req) => {
    if (!user) return
    try {
      await updateRequestStatus(req.id, 'completed')
      setRequests((prev) => prev.map((r) => (r.id === req.id ? { ...r, status: 'completed' } : r)))
    } catch (err) {
      setError(err.message || 'Failed to update request.')
    }
  }

  if (loading) {
    return (
      <AccountLayout currentView="requests" setCurrentView={setCurrentView} unreadCount={0}>
        <div className="py-12 text-center">
          <div className="animate-pulse h-8 w-32 bg-gray-200 rounded-full mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading requests...</p>
        </div>
      </AccountLayout>
    )
  }

  const isPersonal = !!user

  return (
    <AccountLayout currentView="requests" setCurrentView={setCurrentView} unreadCount={0}>
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
          <div>
            <button
              onClick={() => setCurrentView(isPersonal ? 'dashboard' : 'explore')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-gray-100 text-gray-700 font-semibold text-sm border border-gray-200 shadow-xs transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <h2 className="text-lg font-bold text-gray-900 mt-3">
              {isPersonal ? 'My Requests' : 'Community Requests'}
            </h2>
          </div>
          <p className="text-sm text-gray-500 hidden md:block">
            {isPersonal
              ? 'Resources you have asked for from other community members.'
              : 'Active requests from the community. Click a request to view its resource.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {requests.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-gray-200 shadow-sm">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base font-bold text-gray-900">
              {isPersonal ? 'You haven\'t posted any requests yet' : 'No community requests yet'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isPersonal
                ? 'When you request a resource from a giver, it will appear here with its current status.'
                : 'There are no active requests right now.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => {
              const statusColor = STATUS_COLORS[r.status] || 'bg-gray-50 text-gray-700 border-gray-200'
              const statusLabel = STATUS_LABELS[r.status] || r.status
              const resource = r.resource || {}
              const requester = r.requester || {}
              return (
                <div
                  key={r.id}
                  className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm"
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 leading-tight">
                          {r.title || resource.title || 'Resource Request'}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {resource.category || 'General'} • {resource.location_name || ''}
                        </p>
                        {!isPersonal && requester.full_name && (
                          <p className="text-xs text-gray-600 mt-2">
                            Requested by {requester.full_name}
                          </p>
                        )}
                        <p className="text-xs text-gray-600 mt-2">
                          {r.message || 'No additional message.'}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(r.created_at).toLocaleDateString(undefined, { dateStyle: 'short' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {r.status === 'accepted' && (
                          <button
                            type="button"
                            onClick={() => {
                              if (onOpenChat) {
                                const otherUserId = isPersonal ? r.provider_id : r.requester_id
                                const otherName = isPersonal
                                  ? r.provider?.full_name || 'Resource Giver'
                                  : r.requester?.full_name || 'Requester'
                                onOpenChat({
                                  resourceId: r.resource_id,
                                  otherUserId,
                                  otherName,
                                  resourceTitle: r.title || r.resource?.title || 'Resource Request',
                                })
                              } else {
                                setCurrentView('chat')
                              }
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Open conversation</span>
                          </button>
                        )}
                        {r.status === 'pending' && isPersonal && (
                          <button
                            type="button"
                            onClick={() => handleAccept(r)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
                          >
                            Mark fulfilled
                          </button>
                        )}
                      </div>
                    </div>

                    {resource.id && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                        <Package className="w-3.5 h-3.5 text-emerald-600" />
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenResourceDetails) {
                              onOpenResourceDetails(resource)
                            }
                          }}
                          className="hover:underline hover:text-emerald-700 font-medium cursor-pointer"
                        >
                          View resource: {resource.title}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AccountLayout>
  )
}
