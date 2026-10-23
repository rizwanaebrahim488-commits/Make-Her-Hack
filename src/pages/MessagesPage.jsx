import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getConversations,
  getResourceById,
} from '../lib/supabase'
import { ArrowLeft, MessageCircle, Sparkles, AlertCircle, MapPin, Clock, Package, User } from 'lucide-react'
import AccountLayout from '../components/AccountLayout'

export default function MessagesPage({ setCurrentView, onOpenChat, onOpenResourceDetails }) {
  const { user, profile } = useAuth()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadConversations = async (mounted = true) => {
    if (!user) return
    try {
      setLoading(true)
      const { data } = await getConversations(user.id)
      if (mounted) setConversations(data || [])
    } catch (err) {
      if (mounted) setError(err.message || 'Failed to load conversations.')
    } finally {
      if (mounted) setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    loadConversations(mounted)

    // Poll for new messages every 4 seconds
    const interval = setInterval(() => {
      loadConversations(true)
    }, 4000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [user])

  const handleOpenConvo = (c) => {
    const otherName = c.other_name || 'Community Member'
    const resourceTitle = c.resource_title || 'Resource Discussion'

    if (onOpenChat) {
      onOpenChat({
        resourceId: c.resource_id,
        otherUserId: c.other_id,
        otherName,
        resourceTitle,
      })
    } else {
      setCurrentView('chat')
    }
  }

  if (loading && conversations.length === 0) {
    return (
      <AccountLayout currentView="messages" setCurrentView={setCurrentView} unreadCount={0}>
        <div className="py-12 text-center">
          <div className="animate-pulse h-8 w-32 bg-gray-200 rounded-full mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading conversations...</p>
        </div>
      </AccountLayout>
    )
  }

  return (
    <AccountLayout currentView="messages" setCurrentView={setCurrentView} unreadCount={0}>
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
          <div>
            <button
              onClick={() => setCurrentView('dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-gray-100 text-gray-700 font-semibold text-sm border border-gray-200 shadow-xs transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to My ReLoop</span>
            </button>
            <h2 className="text-lg font-bold text-gray-900 mt-3">Messages & Chats</h2>
          </div>
          <p className="text-xs text-gray-500 hidden md:block">
            Chat directly with resource givers and requesters to coordinate handovers.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {conversations.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base font-bold text-gray-900">No conversations yet</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              When someone contacts you about a resource, or you message a giver, your active chats will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-5 py-3 flex items-center justify-between">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Conversations ({conversations.length})
              </p>
              <span className="text-[11px] text-emerald-600 font-medium">● Auto-updating</span>
            </div>
            <div className="divide-y divide-gray-100">
              {conversations.map((c) => {
                const isFromMe = c.sender_id === user.id
                const otherName = c.other_name || 'Community Member'
                const resourceTitle = c.resource_title || 'Resource Discussion'

                return (
                  <div
                    key={`${c.resource_id}-${c.other_id}`}
                    onClick={() => handleOpenConvo(c)}
                    className="w-full flex items-center gap-3.5 px-5 py-4 text-left hover:bg-emerald-50/40 transition cursor-pointer group"
                  >
                    {/* User Avatar */}
                    {c.other_avatar ? (
                      <img
                        src={c.other_avatar}
                        alt={otherName}
                        className="w-11 h-11 rounded-full object-cover border border-emerald-100 shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-sm shrink-0 border border-emerald-200">
                        {otherName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-gray-900 truncate group-hover:text-emerald-700 transition">
                          {otherName}
                        </p>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Resource Tag */}
                      <p className="text-xs font-semibold text-emerald-700 truncate mt-0.5 flex items-center gap-1">
                        <Package className="w-3 h-3 text-emerald-600 inline shrink-0" />
                        <span className="truncate">{resourceTitle}</span>
                      </p>

                      {/* Message Snippet */}
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {isFromMe ? <span className="font-semibold text-gray-700">You: </span> : null}
                        {c.content || 'Start the conversation'}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center">
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 group-hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition">
                        Reply
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </AccountLayout>
  )
}

