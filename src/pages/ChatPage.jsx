import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getMessages,
  sendMessage,
  markMessagesRead,
  getResourceById,
  getConversations,
  getUserReviewForResource,
  getProviderProfile,
} from '../lib/supabase'
import RateProviderModal from '../components/RateProviderModal'
import {
  ArrowLeft,
  MessageCircle,
  AlertCircle,
  Package,
  Send,
  Loader2,
  Check,
  CheckCheck,
  Star,
  ShieldCheck,
} from 'lucide-react'
import AccountLayout from '../components/AccountLayout'

export default function ChatPage({ setCurrentView, chat, onOpenResourceDetails }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [resource, setResource] = useState(null)
  const [activeOtherUserId, setActiveOtherUserId] = useState(chat?.otherUserId || null)
  const [activeResourceId, setActiveResourceId] = useState(chat?.resourceId || null)
  const [otherName, setOtherName] = useState(chat?.otherName || 'Community Member')
  const [resourceTitle, setResourceTitle] = useState(chat?.resourceTitle || 'Resource Discussion')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  // In-chat Rating Modal & Provider stats states
  const [isRateModalOpen, setIsRateModalOpen] = useState(false)
  const [userReview, setUserReview] = useState(null)
  const [providerStats, setProviderStats] = useState({
    avg_rating: 4.8,
    total_reviews: 0,
    is_verified: false,
  })

  const scrollRef = useRef(null)

  const loadRatingData = async (otherId, resId) => {
    if (!otherId) return
    try {
      const { data: prof } = await getProviderProfile(otherId)
      if (prof) {
        setProviderStats({
          avg_rating: prof.avg_rating || 4.8,
          total_reviews: prof.total_reviews || 0,
          is_verified: prof.is_verified,
          avatar_url: prof.avatar_url,
          full_name: prof.full_name || otherName,
        })
      }
      if (user && resId) {
        const { data: rev } = await getUserReviewForResource(user.id, resId)
        setUserReview(rev)
      }
    } catch (e) {
      console.warn('Rating loading error in chat:', e)
    }
  }

  // 1. Initial setup and fallback inference if chat was opened without parameters
  useEffect(() => {
    let mounted = true

    const setupChat = async () => {
      if (!user) return

      let targetOtherId = chat?.otherUserId
      let targetResId = chat?.resourceId

      // If otherUserId is missing, infer from user's most recent conversation
      if (!targetOtherId) {
        try {
          const { data: convos } = await getConversations(user.id)
          if (convos && convos.length > 0) {
            targetOtherId = convos[0].other_id
            targetResId = targetResId || convos[0].resource_id
            if (mounted) {
              setOtherName(convos[0].other_name || 'Community Member')
              setResourceTitle(convos[0].resource_title || 'Resource Discussion')
            }
          }
        } catch (e) {
          console.warn('Inference error:', e)
        }
      }

      if (mounted) {
        setActiveOtherUserId(targetOtherId)
        setActiveResourceId(targetResId)
      }

      if (targetOtherId) {
        loadRatingData(targetOtherId, targetResId)
      }

      if (targetOtherId && user) {
        try {
          setLoading(true)
          const { data: msgs } = await getMessages(user.id, targetOtherId, targetResId)
          if (targetResId) {
            const { data: res } = await getResourceById(targetResId)
            if (mounted && res) {
              setResource(res)
              if (res.title) setResourceTitle(res.title)
            }
          }
          if (mounted) {
            setMessages(msgs || [])
          }
        } catch (err) {
          if (mounted) setError(err.message || 'Failed to load conversation.')
        } finally {
          if (mounted) setLoading(false)
        }
      } else {
        if (mounted) setLoading(false)
      }
    }

    setupChat()
    return () => {
      mounted = false
    }
  }, [user, chat])

  // Listen for review submissions to keep rating updated live
  useEffect(() => {
    const handleReviewSubmitted = (e) => {
      if (e.detail && (e.detail.providerId === activeOtherUserId || e.detail.resourceId === activeResourceId)) {
        loadRatingData(activeOtherUserId, activeResourceId)
      }
    }
    window.addEventListener('reloop-review-submitted', handleReviewSubmitted)
    return () => window.removeEventListener('reloop-review-submitted', handleReviewSubmitted)
  }, [activeOtherUserId, activeResourceId])

  // 2. Mark messages read
  useEffect(() => {
    if (activeOtherUserId && user) {
      markMessagesRead(user.id, activeOtherUserId, activeResourceId)
    }
  }, [user, activeOtherUserId, activeResourceId, messages.length])

  // 3. Bi-directional polling so both the resource giver and the requester see new replies live!
  useEffect(() => {
    if (!user || !activeOtherUserId) return

    const interval = setInterval(async () => {
      try {
        const { data: msgs } = await getMessages(user.id, activeOtherUserId, activeResourceId)
        if (msgs && Array.isArray(msgs)) {
          setMessages((prev) => {
            // Only update state if count or last id changed to prevent jitter
            if (msgs.length !== prev.length || (msgs[msgs.length - 1]?.id !== prev[prev.length - 1]?.id)) {
              return msgs
            }
            return prev
          })
        }
      } catch (e) {
        // silent polling error
      }
    }, 2500)

    return () => clearInterval(interval)
  }, [user, activeOtherUserId, activeResourceId])

  // 4. Auto scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, sending])

  // 5. Send message handler (works for both giver and requester!)
  const handleSend = async (e) => {
    e.preventDefault()
    const text = content.trim()
    if (!text || !user || !activeOtherUserId) return

    setContent('')
    setError(null)
    setSending(true)

    // Optimistic UI insert for instant response
    const tempId = `temp-${Date.now()}`
    const optimisticMessage = {
      id: tempId,
      sender_id: user.id,
      receiver_id: activeOtherUserId,
      resource_id: activeResourceId,
      content: text,
      created_at: new Date().toISOString(),
      is_optimistic: true,
    }

    setMessages((prev) => [...prev, optimisticMessage])

    try {
      const { data: sentMsg, error: err } = await sendMessage({
        senderId: user.id,
        receiverId: activeOtherUserId,
        resourceId: activeResourceId,
        content: text,
      })

      if (err) {
        setError(err.message || 'Failed to send message.')
      } else {
        // Replace optimistic message with actual persisted message
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, ...sentMsg, is_optimistic: false } : m))
        )
      }
    } catch (err) {
      setError(err.message || 'Failed to send message.')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <AccountLayout currentView="messages" setCurrentView={setCurrentView} unreadCount={0}>
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Connecting conversation...</p>
        </div>
      </AccountLayout>
    )
  }

  if (!activeOtherUserId) {
    return (
      <AccountLayout currentView="messages" setCurrentView={setCurrentView} unreadCount={0}>
        <div className="max-w-md mx-auto text-center py-16 bg-white rounded-3xl p-8 border border-gray-200">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900">No active chat selected</h3>
          <p className="text-xs text-gray-500 mt-1 mb-6">
            Please pick a conversation from your messages list to start chatting.
          </p>
          <button
            onClick={() => setCurrentView('messages')}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
          >
            Back to Messages
          </button>
        </div>
      </AccountLayout>
    )
  }

  return (
    <AccountLayout currentView="messages" setCurrentView={setCurrentView} unreadCount={0}>
      <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-175px)]">
        {/* Chat Top Header */}
        <div className="flex items-center justify-between gap-3 p-3.5 bg-white border border-gray-200 rounded-2xl shadow-xs mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setCurrentView('messages')}
              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition cursor-pointer shrink-0"
              title="Back to all conversations"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-sm shrink-0">
              {otherName.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900 leading-tight truncate">
                {otherName}
              </h3>
              <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                <Package className="w-3 h-3 text-emerald-600 inline shrink-0" />
                <span className="truncate">{resourceTitle}</span>
              </p>
            </div>
          </div>

          {resource && onOpenResourceDetails && (
            <button
              type="button"
              onClick={() => onOpenResourceDetails(resource)}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition shrink-0 cursor-pointer"
            >
              View Item
            </button>
          )}
        </div>

        {/* ================= IN-CHAT PROVIDER RATING WIDGET ================= */}
        {user && activeOtherUserId && user.id !== activeOtherUserId && (
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white rounded-2xl border border-emerald-200/90 p-3.5 shadow-2xs mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-white border border-emerald-200 flex items-center justify-center text-amber-500 shadow-2xs shrink-0">
                <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-gray-900 truncate">
                    {userReview ? 'Your Service Rating' : `Rate ${otherName} for this service`}
                  </span>
                  {providerStats?.is_verified && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                      <span>Verified Provider</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                  {userReview ? (
                    <span className="text-emerald-800 font-semibold flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-0.5 text-amber-600 font-bold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                        <span>{userReview.rating} / 5 Stars</span>
                      </span>
                      {userReview.comment && (
                        <span className="text-gray-500 italic truncate max-w-[180px] hidden sm:inline">
                          &ldquo;{userReview.comment}&rdquo;
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <span>Provider Overall Rating:</span>
                      <span className="text-amber-600 font-bold">⭐ {Number(providerStats?.avg_rating || 4.8).toFixed(1)}</span>
                      <span className="text-gray-400">({providerStats?.total_reviews || 0} reviews)</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsRateModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <Star className="w-3.5 h-3.5 fill-white" />
              <span>{userReview ? 'Edit Rating' : 'Rate Provider'}</span>
            </button>
          </div>
        )}

        {error && (
          <div className="mb-2 p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Message Stream */}
        <div
          className="flex-1 overflow-y-auto px-2 py-3 space-y-3 bg-gray-50/50 rounded-2xl border border-gray-200/80 mb-3"
          ref={scrollRef}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <MessageCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-gray-800">Start the conversation</p>
              <p className="text-xs text-gray-500 max-w-xs mt-1">
                Say hello, ask questions about the resource, or coordinate pickup location and time!
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.sender_id === user.id
              const timeString = new Date(m.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })

              return (
                <div
                  key={m.id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[82%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl text-sm break-words shadow-2xs ${
                      isMine
                        ? 'bg-emerald-600 text-white rounded-tr-xs'
                        : 'bg-white text-gray-900 border border-gray-200 rounded-tl-xs'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                      {m.content}
                    </p>
                    <div
                      className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${
                        isMine ? 'text-emerald-100' : 'text-gray-400'
                      }`}
                    >
                      <span>{timeString}</span>
                      {isMine && (
                        m.is_optimistic ? (
                          <span className="opacity-70">⋯</span>
                        ) : m.read_at ? (
                          <CheckCheck className="w-3 h-3 text-white" />
                        ) : (
                          <Check className="w-3 h-3 text-emerald-200" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Message Input Bar */}
        <div className="bg-white p-2.5 rounded-2xl border border-gray-200 shadow-sm">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend(e)
                }
              }}
              placeholder="Type your message... (Press Enter to send)"
              rows={1}
              className="flex-1 min-h-[42px] max-h-32 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition resize-none leading-relaxed"
            />
            <button
              type="submit"
              disabled={sending || !content.trim()}
              className="h-[42px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Rate Provider Modal inside Chat */}
      <RateProviderModal
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        resource={
          resource || {
            id: activeResourceId,
            title: resourceTitle,
            provider_id: activeOtherUserId,
            provider: {
              id: activeOtherUserId,
              full_name: otherName,
              avg_rating: providerStats?.avg_rating,
              total_reviews: providerStats?.total_reviews,
              is_verified: providerStats?.is_verified,
            },
          }
        }
        provider={{
          id: activeOtherUserId,
          full_name: otherName,
          avg_rating: providerStats?.avg_rating,
          total_reviews: providerStats?.total_reviews,
          is_verified: providerStats?.is_verified,
        }}
        onReviewSubmitted={({ review, newStats }) => {
          setUserReview(review)
          if (newStats) setProviderStats((prev) => ({ ...prev, ...newStats }))
        }}
      />
    </AccountLayout>
  )
}
