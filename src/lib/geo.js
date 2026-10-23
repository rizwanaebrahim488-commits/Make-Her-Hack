/**
 * Reverse geocodes coordinates to a clean human-readable town/city/area name using OpenStreetMap Nominatim.
 */
export async function reverseGeocode(lat, lng, signal) {
  if (lat == null || lng == null) return null

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=14&addressdetails=1`
    
    const headers = {
      'Accept-Language': 'en',
    }

    // In non-browser environments (like testing or SSR), Nominatim requires a User-Agent header
    if (typeof window === 'undefined') {
      headers['User-Agent'] = 'ReLoop-App/1.0 (community-reuse-platform)'
    }

    const res = await fetch(url, {
      signal,
      headers,
    })

    if (!res.ok) return null

    const data = await res.json()
    if (!data || !data.address) {
      return data?.display_name ? data.display_name.split(',')[0].trim() : null
    }

    const addr = data.address

    // Priority for local neighborhood or town
    const local =
      addr.suburb ||
      addr.neighbourhood ||
      addr.residential ||
      addr.quarter ||
      addr.village ||
      addr.town ||
      addr.city ||
      addr.municipality ||
      ''

    // Priority for municipality / city / district
    const city =
      addr.town ||
      addr.city ||
      addr.municipality ||
      addr.county ||
      addr.state_district ||
      ''

    if (local && city && local.toLowerCase() !== city.toLowerCase()) {
      return `${local}, ${city}`
    }

    return local || city || data.display_name?.split(',').slice(0, 2).join(',').trim() || null
  } catch (err) {
    if (err?.name !== 'AbortError') {
      console.warn('Reverse geocoding error:', err)
    }
    return null
  }
}
