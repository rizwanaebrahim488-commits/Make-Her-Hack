import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getNotifications,
  markNotificationRead,
  getResourceById,
} from '../lib/supabase'
import { ArrowLeft, Bell, Sparkles, AlertCircle, CheckCircle2, MapPin, MessageCircle, Clock, Package } from 'lucide-react'
import AccountLayout from '../components/AccountLayout'

const TYPE_LABEL = {
  request_received: 'Request received',
  request_accepted: 'Request accepted',
  request_rejected: 'Request rejected',
  new_message: 'New message',
  like: 'New like',
  resource_updated: 'Resource updated',
}

const TYPE_ICON = {
  request_received: Package,
  request_accepted: CheckCircle2,
  request_rejected: AlertCircle,
  new_message: MessageCircle,
  like: Sparkles,
  resource_updated: Clock,
}

export default function NotificationsPage({ setCurrentView, onOpenChat, onOpenResourceDetails }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!user) return
      try {
        setLoading(true)
        const { data } = await getNotifications(user.id)
        if (mounted) setNotifications(data || [])
      } catch (err) {
        setError(err.message || 'Failed to load notifications.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [user])

  const handleOpen = async (notif) => {
    if (notif.is_read) return
    // Mark as read
    await markNotificationRead(notif.id)
    setNotifications(prev =>
      prev.map(n => (n.id === notif.id ? { ...n, is_read: true } : n))
    )

    // Navigate based on type
    if (notif.type === 'new_message') {
      if (onOpenChat) {
        onOpenChat({
          resourceId: notif.related_resource_id,
          otherUserId: notif.sender_id,
          otherName: notif.sender_name || 'Community Member',
          resourceTitle: notif.title || 'Resource Discussion',
        })
      } else {
        setCurrentView('chat')
      }
    } else if (notif.type === 'request_received' || notif.type === 'request_accepted') {
      setCurrentView('requests')
    } else if (notif.type === 'like' || notif.type === 'resource_updated') {
      if (notif.related_resource_id && onOpenResourceDetails) {
        getResourceById(notif.related_resource_id).then(({ data }) => {
          if (data) onOpenResourceDetails(data)
          else setCurrentView('explore')
        })
      } else {
        setCurrentView('explore')
      }
    }
  }

  if (loading) {
    return (
      <AccountLayout currentView="notifications" setCurrentView={setCurrentView} unreadCount={0}>
        <div className="py-12 text-center">
          <div className="animate-pulse h-8 w-32 bg-gray-200 rounded-full mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading notifications...</p>
        </div>
      </AccountLayout>
    )
  }

  const unread = notifications.filter(n => !n.is_read).length

  return (
    <AccountLayout currentView="notifications" setCurrentView={setCurrentView} unreadCount={unread}>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-gray-100 text-gray-700 font-semibold text-sm border border-gray-200 shadow-xs transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My ReLoop</span>
        </button>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
          </div>
          {unread > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-[10px] text-white font-bold">
              {unread} unread
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Activity from your ReLoop community connections.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-gray-200 shadow-sm">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base font-bold text-gray-900">No notifications yet</h3>
            <p className="text-sm text-gray-500 mt-1">
              When someone interacts with your resources or sends you a message, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => {
              const Icon = TYPE_ICON[n.type] || Sparkles
              const isRead = n.is_read
              return (
                <div
                  key={n.id}
                  onClick={() => handleOpen(n)}
                  className={`cursor-pointer flex items-start gap-3 p-4 rounded-2xl border transition ${
                    isRead
                      ? 'bg-white border-gray-200 hover:border-gray-300'
                      : 'bg-emerald-50 border-emerald-200/60 hover:bg-emerald-100'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isRead ? 'bg-gray-100 text-gray-500' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 leading-tight">
                      {TYPE_LABEL[n.type] || n.type}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">
                      {n.message || n.title}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>{new Date(n.created_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </p>
                  </div>
                  {!isRead && (
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1" />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AccountLayout>
  )
}

