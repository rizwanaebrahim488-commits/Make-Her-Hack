import React from 'react'

export default function PriceSelector({ value, onChange, showPriceField = true }) {
  // Directly derive from parent form state for reliable toggling
  const isFree = value?.is_free !== false
  const isPriced = !isFree
  const price = value?.price ?? ''

  const handleToggle = (free) => {
    if (!onChange) return
    if (free) {
      onChange({
        ...(value || {}),
        is_free: true,
        price: 0,
      })
    } else {
      onChange({
        ...(value || {}),
        is_free: false,
        price: value?.price && Number(value.price) > 0 ? value.price : '',
      })
    }
  }

  const handlePriceChange = (e) => {
    if (!onChange) return
    const rawVal = e.target.value
    onChange({
      ...(value || {}),
      is_free: false,
      price: rawVal,
    })
  }

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-gray-700">Price *</label>
      
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="radio"
            name="price-mode"
            checked={isFree}
            onChange={() => handleToggle(true)}
            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />
          <span className={`text-sm ${isFree ? 'font-bold text-emerald-700' : 'text-gray-700'}`}>
            Free (Giving Away)
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="radio"
            name="price-mode"
            checked={isPriced}
            onChange={() => handleToggle(false)}
            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />
          <span className={`text-sm ${isPriced ? 'font-bold text-emerald-700' : 'text-gray-700'}`}>
            Priced / For Sale
          </span>
        </label>
      </div>

      {showPriceField && isPriced && (
        <div className="pt-2 animate-fade-in">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Enter Price (₹) *
          </label>
          <div className="relative max-w-xs">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">
              ₹
            </span>
            <input
              type="number"
              min="1"
              step="any"
              required
              value={price}
              onChange={handlePriceChange}
              placeholder="e.g. 250"
              autoFocus
              className="w-full pl-8 pr-4 py-2.5 bg-gray-50/90 border border-emerald-300 rounded-2xl text-sm font-semibold text-gray-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition shadow-xs"
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Specify the token amount or price for this resource.
          </p>
        </div>
      )}
    </div>
  )
}
