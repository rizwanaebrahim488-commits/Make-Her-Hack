import React, { useEffect, useRef, useState, useMemo } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  MapPin,
  AlertCircle,
  Loader2,
  Crosshair,
  Navigation,
  RotateCcw,
  CheckCircle2,
  Info,
} from 'lucide-react'

const DEFAULT_ZOOM = 13

// Coordinate fallbacks for demo/seed data matching common Kerala regions
const KNOWN_COORDINATES = {
  perumbavoor: [10.1436, 76.4746],
  aluva: [10.1076, 76.3516],
  kalamassery: [10.0534, 76.3218],
  kochi: [9.9312, 76.2673],
  ernakulam: [9.9816, 76.2999],
  edappally: [10.0236, 76.3116],
  kakkanad: [10.0159, 76.3419],
  angamaly: [10.196, 76.386],
  thrissur: [10.5276, 76.2144],
}

function resolveCoordinates(resource) {
  if (resource?.latitude != null && resource?.longitude != null) {
    const lat = Number(resource.latitude)
    const lng = Number(resource.longitude)
    if (!isNaN(lat) && !isNaN(lng)) {
      return [lat, lng]
    }
  }
  const locStr = (resource?.location_name || resource?.location || '').toLowerCase()
  for (const [key, coords] of Object.entries(KNOWN_COORDINATES)) {
    if (locStr.includes(key)) {
      return coords
    }
  }
  return [10.1436, 76.4746] // Default central demo region (Perumbavoor)
}

/**
 * Calculate straight-line distance between two points in meters using Leaflet's
 * built-in .distanceTo() or standard Haversine formula
 */
export function calculateDistanceInMeters(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null
  try {
    if (typeof L !== 'undefined' && L.latLng) {
      return L.latLng(lat1, lon1).distanceTo(L.latLng(lat2, lon2))
    }
  } catch (e) {
    // fallback to mathematical Haversine below
  }

  const R = 6371e3 // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Format distance nicely in meters or kilometers
 */
export function formatDistanceString(meters) {
  if (meters == null || isNaN(meters)) return null
  if (meters < 1000) {
    return `Approx. ${Math.round(meters)} m away`
  }
  const km = (meters / 1000).toFixed(1)
  return `Approx. ${km} km away`
}

// Leaflet DivIcons (Vector HTML markers that avoid broken PNG issues)
const resourceMarkerIcon = L.divIcon({
  className: 'custom-resource-pin',
  html: `
    <div style="
      background-color: #ef4444;
      width: 34px;
      height: 34px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2.5px solid white;
      box-shadow: 0 4px 12px rgba(239,68,68,0.45);
    ">
      <span style="transform: rotate(45deg); font-size: 15px;">📍</span>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34],
})

const userMarkerIcon = L.divIcon({
  className: 'custom-user-pin',
  html: `
    <div style="
      background-color: #2563eb;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 0 0 4px rgba(37,99,235,0.35), 0 4px 12px rgba(0,0,0,0.3);
    ">
      <div style="width: 10px; height: 10px; background: white; border-radius: 50%;"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -20],
})

// Handles clicks anywhere on the map to manually set user location
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng)
      }
    },
  })
  return null
}

// Adjusts the map view to show both markers when user location is chosen
function FitBothBounds({ resourcePos, userPos }) {
  const map = useMap()
  useEffect(() => {
    if (!resourcePos || !userPos) return
    try {
      const bounds = L.latLngBounds([resourcePos, userPos])
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 })
    } catch (e) {
      // ignore
    }
  }, [map, resourcePos, userPos])
  return null
}

export default function ResourceMap({
  resource,
  className = '',
  onDistanceCalculated,
}) {
  const [error, setError] = useState(null)
  const [locating, setLocating] = useState(false)
  const [myLocation, setMyLocation] = useState(null)
  const [distanceMeters, setDistanceMeters] = useState(null)
  const mapRef = useRef(null)

  const resourceCoords = useMemo(() => resolveCoordinates(resource), [resource])
  const resourceLocationName = resource?.location_name || resource?.location || 'Resource Location'

  // Calculate distance whenever resource coordinates or user location changes
  useEffect(() => {
    if (resourceCoords && myLocation) {
      const meters = calculateDistanceInMeters(
        resourceCoords[0],
        resourceCoords[1],
        myLocation[0],
        myLocation[1]
      )
      setDistanceMeters(meters)
      const formatted = formatDistanceString(meters)
      if (onDistanceCalculated) {
        onDistanceCalculated(formatted, meters, myLocation)
      }
    } else {
      setDistanceMeters(null)
      if (onDistanceCalculated) {
        onDistanceCalculated(null, null, null)
      }
    }
  }, [resourceCoords, myLocation, onDistanceCalculated])

  // Click on the map to set location manually
  const handleMapClick = (latlng) => {
    setError(null)
    setMyLocation([latlng.lat, latlng.lng])
  }

  // Use browser geolocation
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Please tap on the map to set your location.')
      return
    }
    setError(null)
    setLocating(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false)
        setError(null)
        const coords = [position.coords.latitude, position.coords.longitude]
        setMyLocation(coords)
      },
      (err) => {
        setLocating(false)
        let msg = 'Unable to retrieve your location. Please tap on the map to set your location manually.'
        if (err.code === 1) {
          msg = 'Location permission was denied. Please allow location access or tap on the map to set your location manually.'
        } else if (err.code === 2) {
          msg = 'Location position unavailable. Please tap on the map to set your location manually.'
        }
        setError(msg)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleResetLocation = () => {
    setMyLocation(null)
    setError(null)
    if (mapRef.current) {
      mapRef.current.flyTo(resourceCoords, DEFAULT_ZOOM)
    }
  }

  const distanceText = formatDistanceString(distanceMeters)

  return (
    <div className={`${className} flex flex-col gap-3.5`}>
      {/* Distance Display & Status Banner */}
      <div className="rounded-2xl border transition-all duration-300 overflow-hidden">
        {distanceText ? (
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/30">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">
                  Straight-Line Distance
                </p>
                <p className="text-sm sm:text-base font-black text-gray-900">
                  {distanceText} <span className="text-xs font-normal text-gray-500">from your location</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetLocation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-gray-600 text-xs font-semibold border border-gray-200 transition shrink-0 self-start sm:self-auto cursor-pointer"
              title="Reset user location"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        ) : (
          <div className="p-3 sm:p-3.5 bg-gray-50/80 border-gray-200 text-gray-600 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Click <strong>"Use My Location"</strong> or <strong>tap anywhere on the map</strong> to measure distance.
              </span>
            </div>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-lg shrink-0 hidden sm:inline">
              Straight-Line
            </span>
          </div>
        )}
      </div>

      {/* Error Notice */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Interactive Leaflet Map Container */}
      <div className="w-full h-72 sm:h-80 md:h-96 rounded-3xl border border-gray-200 overflow-hidden shadow-xs relative">
        <MapContainer
          center={resourceCoords}
          zoom={DEFAULT_ZOOM}
          ref={mapRef}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Map click listener */}
          <MapClickHandler onMapClick={handleMapClick} />

          {/* 1. Primary Marker: Resource Location */}
          <Marker position={resourceCoords} icon={resourceMarkerIcon}>
            <Popup>
              <div className="text-xs p-1">
                <div className="font-bold text-gray-900 text-sm">{resourceLocationName}</div>
                <div className="text-gray-500 mt-0.5">📍 Resource Approximate Location</div>
                {distanceText && (
                  <div className="text-emerald-700 font-bold mt-1.5 pt-1.5 border-t border-gray-100">
                    {distanceText} from you
                  </div>
                )}
              </div>
            </Popup>
          </Marker>

          {/* 2. Secondary Marker: User Location (when set) */}
          {myLocation && (
            <Marker position={myLocation} icon={userMarkerIcon}>
              <Popup>
                <div className="text-xs p-1">
                  <div className="font-bold text-blue-900 text-sm">Your Location</div>
                  <div className="text-gray-500 mt-0.5">🔵 Selected on map / GPS</div>
                  {distanceText && (
                    <div className="text-emerald-700 font-bold mt-1.5 pt-1.5 border-t border-gray-100">
                      {distanceText} to resource
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )}

          {/* 3. Visual Straight-Line Connecting the Two Markers */}
          {myLocation && resourceCoords && (
            <Polyline
              positions={[resourceCoords, myLocation]}
              pathOptions={{
                color: '#059669',
                weight: 3.5,
                dashArray: '6, 8',
                opacity: 0.85,
              }}
            />
          )}

          {/* Automatically adjust view when both markers exist */}
          {myLocation && (
            <FitBothBounds resourcePos={resourceCoords} userPos={myLocation} />
          )}
        </MapContainer>

        {/* Loading Overlay */}
        {locating && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-2xs flex flex-col items-center justify-center text-white rounded-3xl z-1000">
            <Loader2 className="w-7 h-7 animate-spin mb-2" />
            <span className="text-sm font-semibold">Detecting your location…</span>
          </div>
        )}

        {/* Floating Quick Hint on Map */}
        <div className="absolute bottom-3 left-3 z-1000 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200/80 shadow-sm text-[11px] text-gray-700 flex items-center gap-1.5 pointer-events-none">
          <span>💡</span>
          <span>Tap anywhere on the map to set your location</span>
        </div>
      </div>

      {/* Legend & Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Map Legend */}
        <div className="flex items-center gap-4 text-xs text-gray-600 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-200"></span>
            <span className="font-medium">📍 Resource Location</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-blue-200"></span>
            <span className="font-medium">🔵 My Location</span>
          </div>
        </div>

        {/* Use My Location Button */}
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={locating}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm shadow-emerald-600/20 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {locating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Locating…</span>
            </>
          ) : (
            <>
              <Crosshair className="w-4 h-4" />
              <span>Use My Location</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
