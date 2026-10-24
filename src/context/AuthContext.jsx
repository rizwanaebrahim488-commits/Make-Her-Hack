import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState('signin') // 'signin' | 'signup'
  const [pendingAction, setPendingAction] = useState(null)
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('reloop_wishlist')
      return saved ? JSON.parse(saved) : ['item-1', 'pln-1']
    } catch {
      return ['item-1', 'pln-1']
    }
  })

  // Save wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('reloop_wishlist', JSON.stringify(wishlist))
    } catch (e) {
      console.warn(e)
    }
  }, [wishlist])

  // Listen to Supabase Auth State changes if connected
  useEffect(() => {
    let mounted = true

    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!mounted) return
        if (session?.user) {
          setUser(session.user)
          fetchProfile(session.user.id)
          loadUserWishlistFromDb(session.user.id)
        }
        setLoading(false)
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (!mounted) return
        if (session?.user) {
          setUser(session.user)
          fetchProfile(session.user.id)
          loadUserWishlistFromDb(session.user.id)
          // Clean hash fragment after confirmation
          if (typeof window !== 'undefined' && window.location.hash?.includes('access_token')) {
            window.history.replaceState(null, '', window.location.pathname)
          }
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      })

      return () => {
        mounted = false
        subscription.unsubscribe()
      }
    } else {
      // Local dev session fallback from localStorage if present
      const savedUser = localStorage.getItem('reloop_demo_user')
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser)
          setUser(parsed)
          setProfile(parsed)
        } catch {
          // ignore
        }
      }
      setLoading(false)
    }
  }, [])

  async function ensureProfile(user) {
    if (!supabase || !user) return
    try {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()
      if (!existing) {
        await supabase.from('profiles').upsert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Community Member',
          email: user.email,
          avatar_url: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.email || 'user')}`
        })
      }
    } catch (err) {
      console.warn('ensureProfile error:', err)
    }
  }

  async function fetchProfile(userId) {
    if (!supabase) return
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (!error && data) {
        setProfile(data)
      } else {
        // Build fallback profile from user session so the app works seamlessly even before DB migration
        const fallbackProfile = {
          id: userId,
          full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Community Member',
          email: user?.email,
          avatar_url: user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.email || 'user')}`,
          badge: 'Active Member'
        }
        setProfile(fallbackProfile)
        const u = { id: userId, email: user?.email, user_metadata: user?.user_metadata || {} }
        await ensureProfile(u)
      }
    } catch (err) {
      console.warn('Profile fetch error:', err)
      setProfile({
        id: userId,
        full_name: 'Community Member',
        badge: 'Active Member'
      })
    }
  }

  // Action-based auth trigger
  const requireAuth = (callback) => {
    if (user) {
      // Already authenticated
      if (typeof callback === 'function') {
        callback()
      }
      return true
    } else {
      // Not authenticated, remember action and open modal
      setPendingAction(() => callback)
      setIsAuthModalOpen(true)
      return false
    }
  }

  const completeAuth = (authenticatedUser, userProfile) => {
    setUser(authenticatedUser)
    setProfile(userProfile || authenticatedUser)
    setIsAuthModalOpen(false)

    // Execute pending action if any
    if (pendingAction && typeof pendingAction === 'function') {
      const action = pendingAction
      setPendingAction(null)
      setTimeout(() => {
        action()
      }, 100)
    }
  }

  const signIn = async (email, password) => {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      completeAuth(data.user)
      return data
    } else {
      // Demo session
      const demoUser = {
        id: 'usr-demo-' + Date.now(),
        email,
        full_name: email.split('@')[0],
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
      }
      localStorage.setItem('reloop_demo_user', JSON.stringify(demoUser))
      completeAuth(demoUser, demoUser)
      return { user: demoUser }
    }
  }

  const getRedirectUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin + window.location.pathname
    }
    return 'https://rizwanaebrahim488-commits.github.io/Make-Her-Hack/'
  }

  const signUp = async (fullName, email, password) => {
    if (supabase) {
      const redirectUrl = getRedirectUrl()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: redirectUrl,
        }
      })
      if (error) throw error
      if (data.user) {
        // Create profile entry
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName,
          email,
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`
        })
      }
      if (data.session) {
        completeAuth(data.user)
      }
      return { ...data, needsEmailConfirmation: !data.session }
    } else {
      const demoUser = {
        id: 'usr-demo-' + Date.now(),
        email,
        full_name: fullName,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`
      }
      localStorage.setItem('reloop_demo_user', JSON.stringify(demoUser))
      completeAuth(demoUser, demoUser)
      return { user: demoUser }
    }
  }

  const signInWithGoogle = async () => {
    if (supabase) {
      const redirectUrl = window.location.origin + window.location.pathname
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl }
      })
      if (error) throw error
      return data
    } else {
      // Demo Google sign in
      const googleUser = {
        id: 'usr-google-1',
        email: 'alex.community@gmail.com',
        full_name: 'Alex Rivera',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
      }
      localStorage.setItem('reloop_demo_user', JSON.stringify(googleUser))
      completeAuth(googleUser, googleUser)
      return { user: googleUser }
    }
  }

  const resendVerificationEmail = async (email) => {
    if (supabase && email) {
      const redirectUrl = getRedirectUrl()
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      })
      if (error) throw error
      return true
    }
    return true
  }

  const signInAsGuest = (guestName = 'Community Guest') => {
    const guestUser = {
      id: 'usr-guest-' + Date.now(),
      email: 'guest@reloop.community',
      user_metadata: { full_name: guestName },
      full_name: guestName,
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(guestName)}`,
      badge: 'Guest Member'
    }
    localStorage.setItem('reloop_demo_user', JSON.stringify(guestUser))
    completeAuth(guestUser, guestUser)
    return guestUser
  }

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    localStorage.removeItem('reloop_demo_user')
    setUser(null)
    setProfile(null)
  }

  async function loadUserWishlistFromDb(userId) {
    if (!supabase || !userId) return
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('resource_id')
        .eq('user_id', userId)
      if (!error && data && data.length > 0) {
        const dbIds = data.map((x) => x.resource_id)
        setWishlist(prev => Array.from(new Set([...prev, ...dbIds])))
      }
    } catch (e) {
      console.warn('Load wishlist from DB error:', e)
    }
  }

  const toggleWishlist = async (resourceId) => {
    const isCurrentlyLiked = wishlist.includes(resourceId)

    // 1. Optimistic state & local storage update
    setWishlist(prev => {
      const exists = prev.includes(resourceId)
      return exists ? prev.filter(id => id !== resourceId) : [...prev, resourceId]
    })

    // 2. Persist to Supabase Database if authenticated
    if (supabase && user) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resourceId)
        if (isUuid) {
          if (isCurrentlyLiked) {
            await supabase.from('wishlists').delete().eq('user_id', user.id).eq('resource_id', resourceId)
          } else {
            await supabase.from('wishlists').upsert({
              user_id: user.id,
              resource_id: resourceId,
              created_at: new Date().toISOString()
            })
          }
        }
      } catch (err) {
        console.warn('Wishlist DB sync error:', err)
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        wishlist,
        toggleWishlist,
        requireAuth,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authMode,
        setAuthMode,
        signIn,
        signUp,
        signInWithGoogle,
        resendVerificationEmail,
        signInAsGuest,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
