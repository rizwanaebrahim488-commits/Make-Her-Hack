import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet'
import { MapPin, AlertCircle, Loader2 } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import { reverseGeocode } from '../../lib/geo'

const DEFAULT_CENTER = [10.0, 76.3] // Kerala, India region (ReLoop demo area)
const DEFAULT_ZOOM = 13

// Small marker component that moves the map to the clicked location
const MapClickHandler = ({ onClick }) => {
  const map = useMap()
  useEffect(() => {
    map.on('click', (e) => onClick(e.latlng))
    return () => map.off('click', (e) => onClick(e.latlng))
  }, [map, onClick])
  return null
}

const GEOLOCATION_ERRORS = {
  1: 'Location permission was denied. Please enable location access or select a location manually on the map.',
  2: 'Location is unavailable. Please select a location manually on the map.',
  3: 'Location request timed out. Please select a location manually on the map.',
}

export default function LocationMap({
  value,
  onChange,
  onGeocodingStateChange,
  showGeolocation = true,
  className = '',
}) {
  const [error, setError] = useState(null)
  const [locating, setLocating] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  const [resolvedName, setResolvedName] = useState(value?.locationName || '')
  const [selectedLat, setSelectedLat] = useState(value?.latitude)
  const [selectedLng, setSelectedLng] = useState(value?.longitude)
  const mapRef = useRef(null)
  const containerRef = useRef(null)
  const abortControllerRef = useRef(null)

  // Sync external value changes
  useEffect(() => {
    if (value?.latitude != null && value?.longitude != null) {
      setSelectedLat(value.latitude)
      setSelectedLng(value.longitude)
    }
    if (value?.locationName) {
      setResolvedName(value.locationName)
    }
  }, [value?.latitude, value?.longitude, value?.locationName])

  // Cleanup pending requests on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Reverse geocodes coordinates and informs parent
  const processLocationSelection = useCallback(
    async (lat, lng) => {
      // 1. Immediately notify coordinates
      setSelectedLat(lat)
      setSelectedLng(lng)
      onChange && onChange(lat, lng)

      // 2. Abort any previous pending geocode
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      const controller = new AbortController()
      abortControllerRef.current = controller

      // 3. Initiate reverse geocode
      setGeocoding(true)
      onGeocodingStateChange && onGeocodingStateChange(true)

      try {
        const areaName = await reverseGeocode(lat, lng, controller.signal)
        if (!controller.signal.aborted) {
          setGeocoding(false)
          onGeocodingStateChange && onGeocodingStateChange(false)
          if (areaName) {
            setResolvedName(areaName)
            onChange && onChange(lat, lng, areaName)
          }
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setGeocoding(false)
          onGeocodingStateChange && onGeocodingStateChange(false)
        }
      }
    },
    [onChange, onGeocodingStateChange]
  )

  const handleMapClick = useCallback(
    (latlng) => {
      setError(null)
      processLocationSelection(latlng.lat, latlng.lng)
    },
    [processLocationSelection]
  )

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Please select a location manually on the map.')
      return
    }
    setError(null)
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false)
        setError(null)
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], DEFAULT_ZOOM)
        }
        processLocationSelection(lat, lng)
      },
      (err) => {
        setLocating(false)
        setError(GEOLOCATION_ERRORS[err.code] || 'Unable to retrieve your location. Please select a location manually on the map.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }, [processLocationSelection])

  const center = (selectedLat != null && selectedLng != null)
    ? [selectedLat, selectedLng]
    : DEFAULT_CENTER

  return (
    <div className={`${className} flex flex-col gap-3 relative z-0`} style={{ isolation: 'isolate' }}>
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div
        className="relative z-0 w-full h-64 rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
        style={{ isolation: 'isolate' }}
        ref={containerRef}
      >
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
          {(selectedLat != null && selectedLng != null) && (
            <Marker position={[selectedLat, selectedLng]}>
              <Popup>
                <div className="text-xs">
                  <strong className="block font-semibold text-emerald-800">
                    {resolvedName || 'Selected Location'}
                  </strong>
                  <span className="text-gray-500">
                    {selectedLat.toFixed(4)}, {selectedLng.toFixed(4)}
                  </span>
                </div>
              </Popup>
            </Marker>
          )}
          <MapClickHandler onClick={handleMapClick} />
        </MapContainer>
        {locating && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white rounded-2xl z-1000">
            <Loader2 className="w-6 h-6 animate-spin mb-2" />
            <span className="text-sm font-medium">Acquiring current GPS…</span>
          </div>
        )}
      </div>

      {/* Selected location coordinates and reverse geocode status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-xs">
        <div className="flex items-center gap-2 text-gray-700 truncate">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          {selectedLat != null && selectedLng != null ? (
            <span className="truncate">
              {resolvedName ? (
                <>
                  <strong className="text-gray-900">{resolvedName}</strong>{' '}
                  <span className="text-gray-400">({selectedLat.toFixed(4)}, {selectedLng.toFixed(4)})</span>
                </>
              ) : (
                <span>Location set: {selectedLat.toFixed(5)}, {selectedLng.toFixed(5)}</span>
              )}
            </span>
          ) : (
            <span className="text-gray-500">Click on the map or use "Use My Location"</span>
          )}
        </div>

        {geocoding && (
          <div className="flex items-center gap-1.5 text-emerald-700 font-medium shrink-0">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Resolving area name…</span>
          </div>
        )}
      </div>

      {showGeolocation && (
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={locating || geocoding}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 text-xs font-semibold hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/50 cursor-pointer transition shadow-2xs disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {locating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Locating your device…</span>
            </>
          ) : (
            <>
              <span className="text-base leading-none">📍</span>
              <span>Use My Location & Auto-Fill Name</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}
