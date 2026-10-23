import { createClient } from '@supabase/supabase-js'
import { INITIAL_RESOURCES } from '../data/initialResources'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://txxgrkcqqrkfxksfyddt.supabase.co'

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_IikmmKT9LO5Uo56YzyaTGw_TWPTL3h0'

// Check if valid URL is present
const isValidSupabaseConfig = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-supabase-project') &&
  !supabaseAnonKey.includes('your-supabase-anon-key')
)

export const supabase = isValidSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export const isLiveBackendAvailable = () => Boolean(supabase)

/* ===================== LOCAL STORAGE RESILIENCE HELPERS ===================== */

const LOCAL_RESOURCES_KEY = 'reloop_custom_resources'

export function getLocalCustomResources() {
  try {
    const raw = localStorage.getItem(LOCAL_RESOURCES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.warn('Failed to parse local resources:', e)
    return []
  }
}

export function saveLocalCustomResource(item) {
  try {
    const existing = getLocalCustomResources()
    const updated = [item, ...existing.filter((x) => x.id !== item.id)]
    localStorage.setItem(LOCAL_RESOURCES_KEY, JSON.stringify(updated))
    return item
  } catch (e) {
    console.warn('Failed to save local resource:', e)
    return item
  }
}

export function updateLocalCustomResource(id, updates) {
  try {
    const existing = getLocalCustomResources()
    const updated = existing.map((x) => (x.id === id ? { ...x, ...updates } : x))
    localStorage.setItem(LOCAL_RESOURCES_KEY, JSON.stringify(updated))
  } catch (e) {
    console.warn(e)
  }
}

export function deleteLocalCustomResource(id) {
  try {
    const existing = getLocalCustomResources()
    const updated = existing.filter((x) => x.id !== id)
    localStorage.setItem(LOCAL_RESOURCES_KEY, JSON.stringify(updated))
  } catch (e) {
    console.warn(e)
  }
}

/**
 * Check if the remote Supabase database tables exist and are ready
 */
export async function checkDatabaseStatus() {
  if (!supabase) return { isReady: false, reason: 'Supabase credentials not configured' }
  try {
    const { error: profileErr } = await supabase.from('profiles').select('id').limit(1)
    const { error: resourceErr } = await supabase.from('resources').select('id').limit(1)
    
    if (profileErr && profileErr.code === 'PGRST205') {
      return { isReady: false, reason: 'Tables not created yet in Supabase. Please run supabase_schema.sql in the Supabase SQL Editor.' }
    }
    if (resourceErr && resourceErr.code === 'PGRST205') {
      return { isReady: false, reason: 'Resources table not found in Supabase. Please run supabase_schema.sql.' }
    }
    return { isReady: true, reason: 'Supabase database tables are active and connected.' }
  } catch (e) {
    return { isReady: false, reason: e.message }
  }
}

/* ===================== EXPIRY PROCESSOR ===================== */

const NOTIFIED_EXPIRED_KEY = 'reloop_notified_expired'

function getNotifiedExpiredIds() {
  try {
    const raw = localStorage.getItem(NOTIFIED_EXPIRED_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function markExpiredNotified(id) {
  try {
    const ids = getNotifiedExpiredIds()
    if (!ids.includes(id)) {
      localStorage.setItem(NOTIFIED_EXPIRED_KEY, JSON.stringify([...ids, id]))
    }
  } catch {
    // ignore
  }
}

/**
 * Inspect resources for time expiration.
 * If expired: update status to 'expired' and notify provider.
 */
export async function processExpiredResources(resourcesList) {
  const now = new Date()
  const notifiedIds = getNotifiedExpiredIds()

  for (const item of resourcesList) {
    if (item.is_time_sensitive && item.expires_at) {
      const expDate = new Date(item.expires_at)
      if (expDate <= now && item.status !== 'expired' && item.status !== 'deleted') {
        // Mark as expired
        item.status = 'expired'
        updateLocalCustomResource(item.id, { status: 'expired' })

        if (supabase) {
          try {
            await supabase.from('resources').update({ status: 'expired' }).eq('id', item.id)
          } catch (e) {
            console.warn('Failed to update expired status in supabase:', e)
          }
        }

        // Send notification to provider if not yet notified
        if (!notifiedIds.includes(item.id)) {
          markExpiredNotified(item.id)
          const providerId = item.provider_id || (item.provider && item.provider.id)
          if (providerId) {
            await createNotification({
              userId: providerId,
              type: 'expiry',
              title: 'Resource Taken Down',
              message: 'Your resource was taken down due to time expiry. Consider proper disposal.',
              relatedResourceId: item.id,
            })
          }
        }
      }
    }
  }
}

/* ===================== RESOURCES ===================== */

/**
 * Fetch resources from Supabase or fallback data with search, category, and expiry filtering
 */
export async function getResources({
  resourceType = 'all',
  category = null,
  typeFilter = 'All', // 'All' | 'Free' | 'Paid'
  searchTerm = ''
} = {}) {
  let combined = []
  let source = 'fallback'

  try {
    if (supabase) {
      let query = supabase
        .from('resources')
        .select(`
          id,
          provider_id,
          resource_type,
          title,
          description,
          category,
          condition,
          repairable_if_damaged,
          is_time_sensitive,
          expires_at,
          status,
          price,
          is_free,
          quantity,
          pickup_available,
          delivery_available,
          location_name,
          latitude,
          longitude,
          image_url,
          image_urls,
          created_at,
          provider:profiles (
            id,
            full_name,
            avatar_url,
            badge
          )
        `)
        .neq('status', 'deleted')
        .neq('status', 'expired')

      if (!resourceType || resourceType === 'all') {
        // "All Resources" shows offered items, services, disposal, etc. Exclude requests!
        query = query.neq('resource_type', 'request')
      } else {
        const normalizedType = resourceType.toLowerCase().replace(/s$/, '')
        query = query.or(`resource_type.eq.${normalizedType},resource_type.eq.${normalizedType}s`)
      }

      if (category && category !== 'All') {
        query = query.eq('category', category)
      }

      if (typeFilter === 'Free') {
        query = query.or('price.eq.0,status.ilike.%free%,is_free.eq.true')
      } else if (typeFilter === 'Paid') {
        query = query.gt('price', 0)
      }

      if (searchTerm && searchTerm.trim()) {
        const term = searchTerm.trim()
        query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%,location_name.ilike.%${term}%,category.ilike.%${term}%`)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        combined = data
        source = 'supabase'
      }
    }
  } catch (err) {
    console.warn('Supabase query failed, falling back to local dataset:', err)
  }

  // If Supabase has no data or wasn't reachable, use INITIAL_RESOURCES
  if (combined.length === 0) {
    combined = [...INITIAL_RESOURCES]
  }

  // Always merge locally created user resources so user's items appear immediately
  const localItems = getLocalCustomResources()
  if (localItems.length > 0) {
    const existingIds = new Set(combined.map((x) => x.id))
    const uniqueLocals = localItems.filter((x) => !existingIds.has(x.id))
    combined = [...uniqueLocals, ...combined]
  }

  // Process time-sensitive expirations
  await processExpiredResources(combined)

  // Filter out expired or deleted resources from public view
  const now = new Date()
  combined = combined.filter((item) => {
    if (item.status === 'deleted' || item.status === 'expired') return false
    if (item.is_time_sensitive && item.expires_at) {
      if (new Date(item.expires_at) <= now) return false
    }
    return true
  })

  // Apply filters on combined list
  let filtered = [...combined]

  if (!resourceType || resourceType === 'all') {
    // "All Resources" excludes requests so requests are only in their own dedicated Requests tab
    filtered = filtered.filter(item => {
      const it = (item.resource_type || 'item').toLowerCase().replace(/s$/, '')
      return it !== 'request'
    })
  } else {
    const rt = resourceType.toLowerCase().replace(/s$/, '')
    filtered = filtered.filter(item => {
      const it = (item.resource_type || 'item').toLowerCase().replace(/s$/, '')
      return it === rt
    })
  }

  if (category && category !== 'All') {
    filtered = filtered.filter(item => (item.category || '').toLowerCase() === category.toLowerCase())
  }

  if (typeFilter === 'Free') {
    filtered = filtered.filter(item => (item.is_free || item.price === 0 || (item.status || '').toLowerCase().includes('free')))
  } else if (typeFilter === 'Paid') {
    filtered = filtered.filter(item => item.price > 0 || (item.status || '').toLowerCase().includes('sale') || (item.status || '').toLowerCase().includes('hire'))
  }

  if (searchTerm && searchTerm.trim()) {
    const term = searchTerm.toLowerCase().trim()
    filtered = filtered.filter(item =>
      (item.title || '').toLowerCase().includes(term) ||
      (item.description || '').toLowerCase().includes(term) ||
      (item.category || '').toLowerCase().includes(term) ||
      (item.location_name || item.location || '').toLowerCase().includes(term)
    )
  }

  return { data: filtered, source, error: null }
}

/**
 * Fetch a single resource by id with provider info
 */
export async function getResourceById(resourceId) {
  if (!resourceId) return { data: null, error: 'No ID provided' }

  // 1. Check local custom items first
  const localItems = getLocalCustomResources()
  const localMatch = localItems.find((x) => x.id === resourceId)
  if (localMatch) return { data: localMatch, error: null }

  // 2. Check initial seed resources next
  const seedMatch = INITIAL_RESOURCES.find((x) => x.id === resourceId)
  if (seedMatch) return { data: seedMatch, error: null }

  // 3. Query Supabase
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select(`
          id,
          provider_id,
          resource_type,
          title,
          description,
          category,
          condition,
          repairable_if_damaged,
          is_time_sensitive,
          expires_at,
          status,
          price,
          is_free,
          quantity,
          pickup_available,
          delivery_available,
          location_name,
          latitude,
          longitude,
          image_url,
          image_urls,
          created_at,
          updated_at,
          provider:profiles ( id, full_name, email, avatar_url, location )
        `)
        .eq('id', resourceId)
        .single()
      if (!error && data) return { data, error: null }

      // Fallback: If joined profiles query fails, fetch resource directly
      const { data: directData, error: directErr } = await supabase
        .from('resources')
        .select('*')
        .eq('id', resourceId)
        .single()

      if (!directErr && directData) {
        if (directData.provider_id) {
          try {
            const { data: prof } = await supabase
              .from('profiles')
              .select('id, full_name, email, avatar_url, location')
              .eq('id', directData.provider_id)
              .maybeSingle()
            if (prof) directData.provider = prof
          } catch (pErr) {
            console.warn('Profile fetch warning:', pErr)
          }
        }
        return { data: directData, error: null }
      }
    } catch (err) {
      console.warn('getResourceById supabase error:', err)
    }
  }

  return { data: null, error: 'Resource not found' }
}

/**
 * Create a new resource listing.
 */
export async function createResource({
  title,
  description,
  category,
  condition,
  repairable_if_damaged,
  is_time_sensitive,
  expires_at,
  quantity,
  image_urls,
  image_url,
  location_name,
  latitude,
  longitude,
  is_free,
  price,
  pickup_available,
  delivery_available,
  resource_type = 'item',
  status = 'available',
  imageFile,
  providerId,
}) {
  let finalImageUrl = image_url || (image_urls && image_urls[0]) || null
  let finalImageUrls = image_urls || (finalImageUrl ? [finalImageUrl] : [])

  // If a File is passed, try storage upload
  if (imageFile && supabase) {
    try {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${providerId || 'public'}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('item-images')
        .upload(fileName, imageFile, { cacheControl: '3600', upsert: false })
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('item-images').getPublicUrl(fileName)
        finalImageUrl = urlData.publicUrl
        finalImageUrls = [finalImageUrl, ...finalImageUrls]
      }
    } catch (e) {
      console.warn('Storage upload failed:', e)
    }
  }

  const payload = {
    provider_id: providerId,
    resource_type,
    title,
    description,
    category,
    condition: condition || null,
    repairable_if_damaged: !!repairable_if_damaged,
    is_time_sensitive: !!is_time_sensitive,
    expires_at: expires_at || null,
    quantity: quantity ? parseInt(quantity, 10) : 1,
    image_url: finalImageUrl,
    image_urls: finalImageUrls,
    location_name: location_name || 'Perumbavoor',
    latitude: latitude || 10.1436,
    longitude: longitude || 76.4746,
    is_free: is_free !== false,
    price: is_free ? 0 : parseFloat(price) || 0,
    pickup_available: !!pickup_available,
    delivery_available: !!delivery_available,
    status: status || 'available',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // 1. Try Supabase insertion if connected
  if (supabase && providerId) {
    try {
      const { data, error } = await supabase
        .from('resources')
        .insert(payload)
        .select()
        .single()

      if (!error && data) {
        saveLocalCustomResource(data)
        return { data, error: null, source: 'supabase' }
      }
      console.warn('Supabase insert failed, saving to local store:', error?.message)
    } catch (err) {
      console.warn('Supabase insert exception:', err)
    }
  }

  // 2. Resilient Fallback: Save to LocalStorage
  const localItem = {
    ...payload,
    id: `local-res-${Date.now()}`,
    provider: {
      id: providerId || 'local-user',
      full_name: 'You',
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=You`,
      badge: 'Active Giver'
    }
  }
  saveLocalCustomResource(localItem)
  return { data: localItem, error: null, source: 'local' }
}

/**
 * Update a resource
 */
export async function updateResource(resourceId, updates) {
  // Update local store
  updateLocalCustomResource(resourceId, updates)

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('resources')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', resourceId)
        .select()
        .single()
      if (!error && data) return { data, error: null }
    } catch (err) {
      console.warn('Supabase updateResource error:', err)
    }
  }
  return { data: updates, error: null }
}

/**
 * Delete a resource (Performs soft delete in Supabase and updates local storage)
 */
export async function deleteResource(resourceId) {
  deleteLocalCustomResource(resourceId)

  if (supabase) {
    try {
      // Soft-delete by setting status = 'deleted'
      const { error } = await supabase
        .from('resources')
        .update({ status: 'deleted', updated_at: new Date().toISOString() })
        .eq('id', resourceId)
      
      if (!error) return { error: null }
    } catch (err) {
      console.warn('Supabase deleteResource error:', err)
    }
  }
  return { error: null }
}

/**
 * Fetch resources posted by a specific user
 */
export async function getResourcesByUser(userId) {
  let results = []

  if (supabase && userId) {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('provider_id', userId)
        .neq('status', 'deleted')
        .order('created_at', { ascending: false })
      if (!error && data) {
        results = data
      }
    } catch (err) {
      console.warn('Supabase getResourcesByUser error:', err)
    }
  }

  // Merge locally created resources
  const localItems = getLocalCustomResources()
  const localMatches = localItems.filter(
    (x) => (x.provider_id === userId || !x.provider_id) && x.status !== 'deleted'
  )
  const existingIds = new Set(results.map((x) => x.id))
  
  for (const item of localMatches) {
    if (!existingIds.has(item.id)) {
      results.push(item)
    }
  }

  // Check for expired status
  await processExpiredResources(results)

  return { data: results, error: null }
}

/* ===================== WISHLISTS ===================== */

export async function toggleWishlistInDb(userId, resourceId, currentlyLiked) {
  if (supabase && userId) {
    try {
      if (currentlyLiked) {
        await supabase.from('wishlists').delete().match({ user_id: userId, resource_id: resourceId })
      } else {
        await supabase.from('wishlists').upsert({ user_id: userId, resource_id: resourceId, created_at: new Date().toISOString() })
      }
      return true
    } catch (err) {
      console.warn('Error syncing wishlist with Supabase:', err)
    }
  }
  return false
}

export async function getUserWishlist(userId) {
  if (!supabase || !userId) return { data: [], error: null }
  try {
    const { data, error } = await supabase
      .from('wishlists')
      .select('resource_id')
      .eq('user_id', userId)
    if (error) throw error
    return { data: (data || []).map((r) => r.resource_id), error: null }
  } catch (err) {
    return { data: [], error: err.message }
  }
}

export async function toggleWishlist(userId, resourceId) {
  if (!supabase || !userId) return { liked: true, error: null }
  try {
    const { data: existing } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('resource_id', resourceId)
      .maybeSingle()

    if (existing && existing.id) {
      await supabase.from('wishlists').delete().eq('id', existing.id)
      return { liked: false, error: null }
    }

    await supabase
      .from('wishlists')
      .insert({ user_id: userId, resource_id: resourceId, created_at: new Date().toISOString() })
    return { liked: true, error: null }
  } catch (err) {
    return { liked: false, error: err.message }
  }
}

/* ===================== MESSAGES ===================== */

const LOCAL_MESSAGES_KEY = 'reloop_local_messages'

export function getLocalMessages() {
  try {
    const raw = localStorage.getItem(LOCAL_MESSAGES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

export function saveLocalMessage(msg) {
  try {
    const list = getLocalMessages()
    const updated = [...list.filter((x) => x.id !== msg.id), msg]
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(updated))
    return msg
  } catch (e) {
    return msg
  }
}

export async function getConversations(userId) {
  if (!userId) return { data: [], error: null }

  let messages = []
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (!error && data) {
        messages = data
      }
    } catch (err) {
      console.warn('getConversations supabase error:', err)
    }
  }

  // Merge with local messages
  const localList = getLocalMessages().filter(
    (m) => m.sender_id === userId || m.receiver_id === userId
  )
  const allMsgs = [...messages, ...localList]

  // Group by pair + resource
  const convoMap = new Map()
  for (const m of allMsgs) {
    const otherId = m.sender_id === userId ? m.receiver_id : m.sender_id
    if (!otherId) continue
    const key = `${otherId}-${m.resource_id || 'general'}`
    const existing = convoMap.get(key)
    if (!existing || new Date(m.created_at) > new Date(existing.created_at)) {
      convoMap.set(key, { ...m, other_id: otherId })
    }
  }

  const convos = Array.from(convoMap.values())

  // Enrich with profile names and resource titles
  const otherIds = [...new Set(convos.map((c) => c.other_id).filter(Boolean))]
  const resourceIds = [...new Set(convos.map((c) => c.resource_id).filter(Boolean))]

  const profilesMap = new Map()
  const resourcesMap = new Map()

  if (supabase && otherIds.length > 0) {
    try {
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', otherIds)
      if (profs) {
        profs.forEach((p) => profilesMap.set(p.id, p))
      }
    } catch (e) {
      console.warn('Profile fetch warning in conversations:', e)
    }
  }

  const localResources = getLocalCustomResources()
  localResources.forEach((r) => resourcesMap.set(r.id, r))

  if (supabase && resourceIds.length > 0) {
    try {
      const { data: resList } = await supabase
        .from('resources')
        .select('id, title, category, image_url')
        .in('id', resourceIds)
      if (resList) {
        resList.forEach((r) => resourcesMap.set(r.id, r))
      }
    } catch (e) {
      console.warn('Resources fetch warning in conversations:', e)
    }
  }

  // Assemble enriched conversations
  const enriched = convos.map((c) => {
    const p = profilesMap.get(c.other_id)
    const r = resourcesMap.get(c.resource_id)
    return {
      ...c,
      other_name: p?.full_name || (c.sender_id === userId ? c.receiver_name : c.sender_name) || 'Community Member',
      other_avatar: p?.avatar_url || null,
      resource_title: r?.title || c.resource_title || 'Resource Discussion',
      resource_category: r?.category || null,
      resource_image: r?.image_url || null,
    }
  })

  enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return { data: enriched, error: null }
}

export async function getMessages(userId, otherUserId, resourceId) {
  if (!userId || !otherUserId) return { data: [], error: null }

  let dbMessages = []
  if (supabase) {
    try {
      let query = supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: true })

      if (resourceId) {
        query = query.eq('resource_id', resourceId)
      }

      const { data, error } = await query
      if (!error && data) {
        dbMessages = data
      }
    } catch (err) {
      console.warn('getMessages supabase error:', err)
    }
  }

  // Merge with local messages
  const localList = getLocalMessages().filter((m) => {
    const isPair =
      (m.sender_id === userId && m.receiver_id === otherUserId) ||
      (m.sender_id === otherUserId && m.receiver_id === userId)
    if (!isPair) return false
    if (resourceId && m.resource_id && m.resource_id !== resourceId) return false
    return true
  })

  const seen = new Set()
  const combined = []
  for (const m of [...dbMessages, ...localList]) {
    const key = m.id || `${m.sender_id}-${m.created_at}-${m.content}`
    if (!seen.has(key)) {
      seen.add(key)
      combined.push(m)
    }
  }

  combined.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  return { data: combined, error: null }
}

export async function sendMessage({ senderId, receiverId, resourceId, content }) {
  if (!senderId || !receiverId) {
    return { data: null, error: 'Missing sender or receiver' }
  }

  const newMsg = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sender_id: senderId,
    receiver_id: receiverId,
    resource_id: resourceId || null,
    content,
    created_at: new Date().toISOString(),
  }

  // Save to local resilience store immediately
  saveLocalMessage(newMsg)

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          resource_id: resourceId,
          content,
          created_at: newMsg.created_at,
        })
        .select()
        .single()

      if (!error && data) {
        saveLocalMessage(data)
        // Also trigger notification for receiver in background
        createNotification({
          userId: receiverId,
          type: 'new_message',
          title: 'New Message Received',
          message: content.slice(0, 100),
          relatedResourceId: resourceId,
        }).catch(() => {})

        return { data, error: null }
      }
    } catch (err) {
      console.warn('Supabase sendMessage warning:', err)
    }
  }

  return { data: newMsg, error: null }
}

export async function markMessagesRead(userId, otherUserId, resourceId) {
  if (!supabase || !userId) return
  try {
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('receiver_id', userId)
      .eq('sender_id', otherUserId)
      .eq('resource_id', resourceId)
      .is('read_at', null)
  } catch (err) {
    console.warn('markMessagesRead error:', err)
  }
}

/* ===================== REQUESTS ===================== */

const LOCAL_REQUESTS_KEY = 'reloop_local_requests'

export function getLocalRequests() {
  try {
    const raw = localStorage.getItem(LOCAL_REQUESTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

export function saveLocalRequest(req) {
  try {
    const list = getLocalRequests()
    const updated = [req, ...list.filter((x) => x.id !== req.id)]
    localStorage.setItem(LOCAL_REQUESTS_KEY, JSON.stringify(updated))
    return req
  } catch (e) {
    return req
  }
}

export async function getCommunityRequests(limit = 4) {
  let list = []
  if (supabase) {
    try {
      const { data, error } = await supabase
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
          resource:resources ( id, title, category, location_name, resource_type, is_time_sensitive ),
          requester:profiles!requests_requester_id_fkey ( id, full_name, avatar_url )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (!error && data && data.length > 0) {
        list = data
      }
    } catch (e) {
      console.warn('getCommunityRequests query warning:', e)
    }
  }

  // Also include any local custom resources with resource_type === 'request'
  const localItems = getLocalCustomResources().filter(
    (x) => (x.resource_type === 'request' || x.type === 'request') && x.status !== 'deleted'
  )

  for (const item of localItems) {
    if (!list.some((r) => r.resource_id === item.id || r.id === item.id)) {
      list.unshift({
        id: item.id,
        title: item.title,
        message: item.description,
        status: 'pending',
        created_at: item.created_at || new Date().toISOString(),
        resource_id: item.id,
        requester_id: item.provider_id,
        resource: item,
        requester: item.provider || { full_name: 'Community Member' }
      })
    }
  }

  // If still empty, use initial seed requests
  if (list.length === 0) {
    const seedReqs = INITIAL_RESOURCES.filter((x) => x.resource_type === 'request')
    list = seedReqs.map((sr) => ({
      id: sr.id,
      title: sr.title,
      message: sr.description,
      status: 'pending',
      created_at: sr.created_at,
      resource_id: sr.id,
      requester_id: sr.provider?.id,
      resource: sr,
      requester: sr.provider || { full_name: 'Community Member' },
    }))
  }

  return { data: list.slice(0, limit), error: null }
}

export async function getRequestsByRequester(userId) {
  if (!userId) return { data: [], error: null }

  let dbRequests = []
  if (supabase) {
    try {
      // 1. Try query with joined resource & provider
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          resource:resources ( id, title, category, condition, status, image_url, location_name ),
          provider:profiles!requests_provider_id_fkey ( id, full_name, avatar_url )
        `)
        .eq('requester_id', userId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        dbRequests = data
      } else {
        // Fallback without foreign key name in case constraint name differs
        const { data: fallbackData } = await supabase
          .from('requests')
          .select(`
            *,
            resource:resources ( id, title, category, condition, status, image_url, location_name )
          `)
          .eq('requester_id', userId)
          .order('created_at', { ascending: false })

        if (fallbackData) {
          dbRequests = fallbackData
        }
      }
    } catch (err) {
      console.warn('getRequestsByRequester supabase error:', err)
    }
  }

  // 2. Also check resources table for any community requests created by this user
  // that need to be reflected in My Requests and backfilled
  let requestResources = []
  if (supabase) {
    try {
      const { data: resData } = await supabase
        .from('resources')
        .select('*')
        .eq('provider_id', userId)
        .eq('resource_type', 'request')
        .neq('status', 'deleted')
      if (resData) requestResources = resData
    } catch (e) {
      console.warn('Request resources fetch warning:', e)
    }
  }

  // Include local custom resources of type 'request'
  const localItems = getLocalCustomResources().filter(
    (x) => x.provider_id === userId && x.resource_type === 'request' && x.status !== 'deleted'
  )
  const combinedRequestResources = [...requestResources, ...localItems]

  // For any 'request' resource posted by user that isn't yet in dbRequests, add it and backfill to Supabase
  const existingResourceIds = new Set(dbRequests.map((r) => r.resource_id))
  for (const res of combinedRequestResources) {
    if (!existingResourceIds.has(res.id)) {
      const syntheticReq = {
        id: `req-${res.id}`,
        requester_id: userId,
        resource_id: res.id,
        provider_id: userId,
        title: res.title,
        message: res.description,
        status: res.status === 'completed' ? 'completed' : 'pending',
        created_at: res.created_at || new Date().toISOString(),
        resource: res,
      }
      dbRequests.push(syntheticReq)

      // Backfill to Supabase requests table if valid UUID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(res.id)
      if (supabase && isUuid) {
        supabase
          .from('requests')
          .insert({
            requester_id: userId,
            resource_id: res.id,
            provider_id: userId,
            title: res.title,
            message: res.description,
            status: 'pending',
            created_at: res.created_at || new Date().toISOString(),
          })
          .then(() => {})
          .catch((backfillErr) => console.warn('Backfill request warning:', backfillErr))
      }
    }
  }

  // Merge with local requests
  const localRequests = getLocalRequests().filter((r) => r.requester_id === userId)
  const seenIds = new Set()
  const result = []

  for (const r of [...dbRequests, ...localRequests]) {
    const key = r.id || `${r.resource_id}-${r.created_at}`
    if (!seenIds.has(key)) {
      seenIds.add(key)
      if (!r.resource && r.resource_id) {
        const localRes = getLocalCustomResources().find((x) => x.id === r.resource_id)
        if (localRes) r.resource = localRes
      }
      result.push(r)
    }
  }

  result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return { data: result, error: null }
}

export async function getRequestsByProvider(userId) {
  if (!supabase || !userId) return { data: [], error: null }
  try {
    const { data, error } = await supabase
      .from('requests')
      .select(`
        *,
        resource:resources ( id, title, category, condition, status, image_url, location_name ),
        requester:profiles!requests_requester_id_fkey ( id, full_name, avatar_url )
      `)
      .eq('provider_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { data: data || [], error: null }
  } catch (err) {
    return { data: [], error: err.message }
  }
}

export async function createRequest({ requesterId, resourceId, providerId, title, message }) {
  if (!requesterId) return { data: null, error: 'No requester ID' }

  const newReq = {
    id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    requester_id: requesterId,
    resource_id: resourceId,
    provider_id: providerId || requesterId,
    title,
    message,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  saveLocalRequest(newReq)

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('requests')
        .insert({
          requester_id: requesterId,
          resource_id: resourceId,
          provider_id: providerId || requesterId,
          title,
          message,
          status: 'pending',
          created_at: newReq.created_at,
          updated_at: newReq.updated_at,
        })
        .select()
        .single()

      if (!error && data) {
        saveLocalRequest(data)
        return { data, error: null }
      }
    } catch (err) {
      console.warn('Supabase createRequest warning:', err)
    }
  }

  return { data: newReq, error: null }
}

export async function updateRequestStatus(requestId, status) {
  if (!supabase) return { data: null, error: null }
  try {
    const { data, error } = await supabase
      .from('requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', requestId)
      .select()
      .single()
    if (error) throw error
    return { data, error: null }
  } catch (err) {
    return { data: null, error: err.message }
  }
}

/* ===================== NOTIFICATIONS ===================== */

export async function getNotifications(userId) {
  if (!supabase || !userId) {
    // Return local notifications if any
    try {
      const raw = localStorage.getItem(`reloop_notifs_${userId}`)
      return { data: raw ? JSON.parse(raw) : [], error: null }
    } catch {
      return { data: [], error: null }
    }
  }
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { data: data || [], error: null }
  } catch (err) {
    try {
      const raw = localStorage.getItem(`reloop_notifs_${userId}`)
      return { data: raw ? JSON.parse(raw) : [], error: null }
    } catch {
      return { data: [], error: null }
    }
  }
}

export async function markNotificationRead(notificationId) {
  if (!supabase) return { error: null }
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
    if (error) throw error
    return { error: null }
  } catch (err) {
    return { error: null }
  }
}

export async function getUnreadNotificationCount(userId) {
  if (!userId) return { count: 0, error: null }
  const { data } = await getNotifications(userId)
  const unread = (data || []).filter((n) => !n.is_read).length
  return { count: unread, error: null }
}

export async function createNotification({ userId, type, title, message, relatedResourceId, relatedRequestId }) {
  const newNotif = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    user_id: userId,
    type: type || 'general',
    title,
    message,
    related_resource_id: relatedResourceId || null,
    related_request_id: relatedRequestId || null,
    is_read: false,
    created_at: new Date().toISOString(),
  }

  // Save to localStorage cache as well
  try {
    const raw = localStorage.getItem(`reloop_notifs_${userId}`)
    const list = raw ? JSON.parse(raw) : []
    localStorage.setItem(`reloop_notifs_${userId}`, JSON.stringify([newNotif, ...list]))
  } catch {
    // ignore
  }

  if (supabase && userId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          related_resource_id: relatedResourceId,
          related_request_id: relatedRequestId,
          is_read: false,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()
      if (!error && data) return { data, error: null }
    } catch (err) {
      console.warn('Supabase notification insert error:', err)
    }
  }

  return { data: newNotif, error: null }
}

/* ===================== PROFILE IMAGE UPLOAD ===================== */

export async function uploadProfileImage(userId, imageFile) {
  if (!supabase) return { url: URL.createObjectURL(imageFile), error: null }
  try {
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(fileName, imageFile, { cacheControl: '3600', upsert: false })
    
    if (uploadError) {
      return { url: URL.createObjectURL(imageFile), error: null }
    }

    const { data: urlData } = supabase.storage.from('profile-images').getPublicUrl(fileName)
    return { url: urlData.publicUrl, error: null }
  } catch (e) {
    return { url: URL.createObjectURL(imageFile), error: null }
  }
}

/* ===================== HOME PAGE STATS ===================== */

export async function getResourceCount() {
  if (!supabase) return { count: INITIAL_RESOURCES.length, error: null }
  try {
    const { count, error } = await supabase
      .from('resources')
      .select('*', { head: true, count: 'exact' })
      .eq('status', 'available')
    if (error) throw error
    return { count: count || 0, error: null }
  } catch (err) {
    const local = getLocalCustomResources().length
    return { count: INITIAL_RESOURCES.length + local, error: null }
  }
}

export async function getProfileCount() {
  if (!supabase) return { count: 12, error: null }
  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { head: true, count: 'exact' })
    if (error) throw error
    return { count: count || 0, error: null }
  } catch (err) {
    return { count: 12, error: null }
  }
}

export async function getCompletedRequestCount() {
  if (!supabase) return { count: 8, error: null }
  try {
    const { count, error } = await supabase
      .from('requests')
      .select('*', { head: true, count: 'exact' })
      .eq('status', 'completed')
    if (error) throw error
    return { count: count || 0, error: null }
  } catch (err) {
    return { count: 8, error: null }
  }
}

export async function getActiveRequestCount() {
  if (!supabase) return { count: 3, error: null }
  try {
    const { count, error } = await supabase
      .from('requests')
      .select('*', { head: true, count: 'exact' })
      .eq('status', 'pending')
    if (error) throw error
    return { count: count || 0, error: null }
  } catch (err) {
    return { count: 3, error: null }
  }
}
