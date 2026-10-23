import { useEffect, useRef, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet'
import { MapPin, AlertCircle, Loader2 } from 'lucide-react'

const DEFAULT_ZOOM = 13

// Centers the map on the user's location once it's available
const MyLocationMarker = ({ position }) => {
  const map = useMap()
  useEffect(() => {
    if (!position) return
    map.flyTo(position, DEFAULT_ZOOM)
  }, [map, position])
  return null
}

const GEOLOCATION_ERRORS = {
  1: 'Location permission was denied. Please enable location access or select a location manually.',
  2: 'Location is unavailable. Please try again later.',
  3: 'Location request timed out. Please try again.',
}

export default function ResourceMap({ resource, className = '' }) {
  const [error, setError] = useState(null)
  const [locating, setLocating] = useState(false)
  const [myLocation, setMyLocation] = useState(null)
  const mapRef = useRef(null)

  const lat = resource?.latitude
  const lng = resource?.longitude
  const hasCoords = lat != null && lng != null

  // Fallback when the resource has no stored coordinates
  if (!hasCoords) {
    return (
      <div className={`${className} w-full h-64 rounded-2xl border border-gray-200 bg-gray-50 flex flex-col items-center justify-center py-10`}>
        <MapPin className="w-8 h-8 mb-2 text-gray-300" />
        <p className="text-sm text-gray-500">Location not set for this resource.</p>
      </div>
    )
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }
    setError(null)
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false)
        setError(null)
        setMyLocation([position.coords.latitude, position.coords.longitude])
        if (mapRef.current) {
          mapRef.current.flyTo(
            [position.coords.latitude, position.coords.longitude],
            DEFAULT_ZOOM,
          )
        }
      },
      (err) => {
        setLocating(false)
        setError(GEOLOCATION_ERRORS[err.code] || 'Unable to retrieve your location.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  const center = [lat, lng]

  return (
    <div className={`${className} flex flex-col gap-3`}>
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div className="w-full h-64 rounded-2xl border border-gray-200 overflow-hidden shadow-sm relative">
        <MapContainer
          center={center}
          zoom={DEFAULT_ZOOM}
          ref={mapRef}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={center}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold text-gray-800">
                  {resource?.location_name || 'Resource Location'}
                </div>
                <div className="text-xs text-gray-500">📍 Resource location</div>
              </div>
            </Popup>
          </Marker>
          {myLocation && (
            <Marker position={myLocation}>
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold text-gray-800">My Location</div>
                  <div className="text-xs text-gray-500">🔵 You are here</div>
                </div>
              </Popup>
            </Marker>
          )}
          <MyLocationMarker position={myLocation} />
        </MapContainer>
        {locating && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white rounded-2xl">
            <Loader2 className="w-6 h-6 animate-spin mb-2" />
            <span className="text-sm font-medium">Locating…</span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span>Resource location</span>
        </span>
        {myLocation && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>My location</span>
          </span>
        )}
      </div>
      <button
        onClick={handleUseMyLocation}
        disabled={locating}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-600 text-sm font-medium hover:border-emerald-500 hover:text-emerald-700 cursor-pointer transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {locating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Locating…</span>
          </>
        ) : (
          <>
            <span className="w-4 h-4">📍</span>
            <span>Use My Location</span>
          </>
        )}
      </button>
    </div>
  )
}
