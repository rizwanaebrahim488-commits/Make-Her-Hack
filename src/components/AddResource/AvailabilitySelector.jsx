import React from 'react'
import { MapPin, Truck } from 'lucide-react'

export default function AvailabilitySelector({ value, onChange, show = true }) {
  if (!show) return null

  const pickup = value?.pickup_available || false
  const delivery = value?.delivery_available || false

  const handleToggle = (field) => {
    onChange && onChange({ ...(value || {}), [field]: !value?.[field] })
  }

  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-gray-700 flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        Availability
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 cursor-pointer transition hover:border-emerald-200">
          <input
            type="checkbox"
            checked={pickup}
            onChange={() => handleToggle('pickup_available')}
            className="rounded text-emerald-600 focus:ring-emerald-500 shrink-0"
          />
          <div>
            <span className="text-sm font-semibold text-gray-800">Pickup available</span>
          </div>
        </label>
        <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 cursor-pointer transition hover:border-teal-200">
          <input
            type="checkbox"
            checked={delivery}
            onChange={() => handleToggle('delivery_available')}
            className="rounded text-teal-600 focus:ring-teal-500 shrink-0"
          />
          <div>
            <span className="text-sm font-semibold text-gray-800">Delivery available</span>
          </div>
        </label>
      </div>
    </div>
  )
}
