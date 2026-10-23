import React, { useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { createResource, createRequest } from '../lib/supabase'
import {
  ArrowLeft,
  PlusCircle,
  Wrench,
  Megaphone,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  MapPin,
  Tag,
  Clock,
  Calendar,
  Sparkles,
} from 'lucide-react'

import LocationMap from '../components/AddResource/LocationMap'
import ImageUpload from '../components/AddResource/ImageUpload'
import CategorySelect from '../components/AddResource/CategorySelect'
import PriceSelector from '../components/AddResource/PriceSelector'
import AvailabilitySelector from '../components/AddResource/AvailabilitySelector'
import FormSection from '../components/AddResource/FormSection'

const TYPE_OPTIONS = [
  {
    key: 'item',
    label: 'Give an Item',
    icon: PlusCircle,
    desc: 'Give something you no longer need a second life',
    sub: 'Items',
  },
  {
    key: 'service',
    label: 'Offer a Service',
    icon: Wrench,
    desc: 'Offer your skills or help to the community',
    sub: 'Services',
  },
  {
    key: 'request',
    label: 'Post a Request',
    icon: Megaphone,
    desc: 'Tell the community what you are looking for',
    sub: 'Requests',
  },
  {
    key: 'disposal',
    label: 'Share a Disposal/Recycling Resource',
    icon: RefreshCw,
    desc: 'Help others dispose or recycle responsibly',
    sub: 'Disposal',
  },
]

const ITEM_CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Damaged']

export default function AddResourcePage({ setCurrentView }) {
  const { user, requireAuth } = useAuth()
  const [type, setType] = useState(null)
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    quantity: '1',
    condition: '',
    repairable_if_damaged: false,
    is_time_sensitive: false,
    expires_at: '',
    image_urls: [],
    location_name: '',
    latitude: 10.1436,
    longitude: 76.4746,
    is_free: true,
    price: '',
    pickup_available: false,
    delivery_available: false,
    resource_type: 'item',
  })
  const [acceptedMaterials, setAcceptedMaterials] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [isGeocodingLocation, setIsGeocodingLocation] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const isItem = type === 'item'
  const isService = type === 'service'
  const isRequest = type === 'request'
  const isDisposal = type === 'disposal'

  const handleSelectType = (t) => {
    setError(null)
    setType(t)
    setForm((prev) => ({ ...prev, resource_type: t }))
  }

  const goBack = () => {
    setType(null)
    setError(null)
    setSuccess(false)
    setForm({
      title: '',
      category: '',
      description: '',
      quantity: '1',
      condition: '',
      repairable_if_damaged: false,
      is_time_sensitive: false,
      expires_at: '',
      image_urls: [],
      location_name: '',
      latitude: 10.1436,
      longitude: 76.4746,
      is_free: true,
      price: '',
      pickup_available: false,
      delivery_available: false,
      resource_type: 'item',
    })
    setAcceptedMaterials('')
    setContactInfo('')
    if (setCurrentView) setCurrentView('explore')
  }

  const updateField = (key, val) => {
    setError(null)
    setForm((prev) => ({ ...prev, [key]: val }))
  }

  const handleLocationChange = useCallback((lat, lng, detectedName) => {
    setError(null)
    setForm((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      ...(detectedName ? { location_name: detectedName } : {}),
    }))
  }, [])

  const validate = () => {
    const errors = []
    if (!form.title.trim()) errors.push('Please enter a title/name.')
    if (!form.category) errors.push('Please select a category.')
    if (!form.description.trim()) errors.push('Please provide a description.')
    if ((isItem || isRequest) && !form.quantity) errors.push('Please enter a quantity.')
    if (isItem && !form.condition) errors.push('Please select a condition.')
    if (!isRequest && form.image_urls.length === 0) errors.push('Please upload at least one photo.')
    if (!form.location_name.trim()) errors.push('Please enter a location.')
    if ((isItem || isDisposal) && !form.pickup_available && !form.delivery_available) {
      errors.push('Please select at least pickup or delivery availability.')
    }
    if (!form.is_free && (!form.price || parseFloat(form.price) <= 0)) {
      errors.push('Please enter a valid price.')
    }
    if (form.is_time_sensitive && !form.expires_at) {
      errors.push('Please set an availability expiry date/time for this time-sensitive resource.')
    }
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const validationErrors = validate()
    if (validationErrors.length > 0) {
      setError(validationErrors.join(' '))
      return
    }

    if (!user) {
      requireAuth(() => handleSubmit(e))
      return
    }

    setLoading(true)
    try {
      let description = form.description.trim()

      if (isDisposal) {
        const parts = []
        if (description) parts.push(description)
        if (acceptedMaterials.trim()) parts.push(`Accepted materials: ${acceptedMaterials.trim()}`)
        if (contactInfo.trim()) parts.push(`Contact: ${contactInfo.trim()}`)
        description = parts.join('\n\n')
      }

      const payload = {
        title: form.title.trim(),
        description,
        category: form.category,
        condition: isItem ? form.condition : undefined,
        repairable_if_damaged: !!form.repairable_if_damaged,
        is_time_sensitive: !!form.is_time_sensitive,
        expires_at: form.is_time_sensitive && form.expires_at ? new Date(form.expires_at).toISOString() : null,
        quantity: (isItem || isRequest) ? parseInt(form.quantity, 10) || 1 : undefined,
        image_urls: isRequest ? [] : form.image_urls,
        image_url: isRequest ? null : (form.image_urls[0] || null),
        location_name: form.location_name.trim(),
        latitude: form.latitude,
        longitude: form.longitude,
        is_free: form.is_free !== false,
        price: form.is_free ? 0 : parseFloat(form.price) || 0,
        pickup_available: form.pickup_available,
        delivery_available: form.delivery_available,
        status: 'available',
        resource_type: type,
      }

      const { data, error: err } = await createResource({
        ...payload,
        providerId: user.id,
      })

      if (err) throw err

      // When posting a Request, ensure it is ALSO inserted into the requests table in Supabase!
      if (isRequest && data?.id) {
        try {
          await createRequest({
            requesterId: user.id,
            resourceId: data.id,
            providerId: user.id,
            title: form.title.trim(),
            message: description,
          })
        } catch (reqErr) {
          console.warn('Failed to insert into requests table:', reqErr)
        }
      }

      setLoading(false)
      setSuccess(true)
      setTimeout(() => {
        if (setCurrentView) setCurrentView('explore')
        goBack()
      }, 1500)
    } catch (err) {
      setLoading(false)
      setError(err.message || 'Failed to submit resource. Please try again.')
    }
  }

  const handleQuantityChange = (e) => {
    const v = e.target.value.replace(/\D/g, '')
    updateField('quantity', v || '1')
  }

  if (!type) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => {
              setType(null)
              if (setCurrentView) setCurrentView('explore')
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-gray-100 text-gray-700 font-semibold text-sm border border-gray-200 shadow-xs transition mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Explore</span>
          </button>

          <div className="flex items-center gap-3 mb-2">
            <PlusCircle className="w-5 h-5 text-emerald-600" />
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Add Resource</h2>
          </div>
          <p className="text-sm text-gray-500 mb-8">
            Choose what you would like to contribute to the ReLoop community.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TYPE_OPTIONS.map((opt) => {
              const Icon = opt.icon
              return (
                <button
                  key={opt.key}
                  onClick={() => handleSelectType(opt.key)}
                  className="flex flex-col items-center gap-3 p-6 sm:p-8 rounded-3xl border border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50 transition cursor-pointer group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl md:text-3xl group-hover:scale-110 transition">
                    <Icon className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                    {opt.label}
                  </h4>
                  <p className="text-xs text-gray-500 text-center leading-relaxed">
                    {opt.desc}
                  </p>
                </button>
              )
            })}
          </div>

          <p className="mt-8 text-center text-xs text-gray-400">
            Only authenticated users can add resources. Sign in if prompted.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={goBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-gray-100 text-gray-700 font-semibold text-sm border border-gray-200 shadow-xs transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-3 mb-2">
          <PlusCircle className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">
            {TYPE_OPTIONS.find((t) => t.key === type)?.label}
          </h2>
        </div>
        <p className="text-sm text-gray-500 mb-8">
          {TYPE_OPTIONS.find((t) => t.key === type)?.desc}
        </p>

        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-sm flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Resource submitted successfully! It is now live in ReLoop.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Basics Details */}
          <FormSection title="Resource Details" icon={Tag}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Title / Name *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder={isItem ? 'e.g. Solid Wood Study Table' : isService ? 'e.g. Laptop Repair Service' : isRequest ? 'e.g. Looking for Textbooks' : 'e.g. Floral Waste Collection Hub'}
                    className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category *</label>
                  <CategorySelect
                    value={form.category}
                    onChange={(v) => updateField('category', v)}
                    resourceType={type}
                  />
                </div>
              </div>

              {/* Quantity and Condition (For Items / Requests) */}
              {isItem && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Quantity *</label>
                    <input
                      type="text"
                      value={form.quantity}
                      onChange={handleQuantityChange}
                      placeholder="1"
                      className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Condition *</label>
                    <select
                      value={form.condition}
                      onChange={(e) => updateField('condition', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                    >
                      <option value="" disabled className="text-gray-400">Select Condition</option>
                      {ITEM_CONDITIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Repairable Checkbox / Toggle */}
              {isItem && (
                <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!form.repairable_if_damaged}
                      onChange={(e) => updateField('repairable_if_damaged', e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs sm:text-sm font-semibold text-gray-800">
                        Repairable if damaged
                      </span>
                      <p className="text-[11px] text-gray-500">
                        Check this if the item can be restored, repaired, or upcycled by a handy member.
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {/* Detailed Description Textarea (NOW AVAILABLE FOR ALL TYPES) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Provide detailed information about the item condition, features, dimensions, usage history, or service details..."
                  className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition resize-none leading-relaxed"
                />
              </div>
            </div>
          </FormSection>

          {/* 2. Disposal Specific Fields */}
          {isDisposal && (
            <FormSection title="Disposal Details" icon={RefreshCw}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Accepted Materials</label>
                  <textarea
                    value={acceptedMaterials}
                    onChange={(e) => setAcceptedMaterials(e.target.value)}
                    rows={2}
                    placeholder="e.g. Floral waste, PET bottles, batteries..."
                    className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Contact Details</label>
                  <input
                    type="text"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="e.g. WhatsApp or Drop-off desk"
                    className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  />
                </div>
              </div>
            </FormSection>
          )}

          {/* 3. Photos (Hidden for requests since the user is seeking an item) */}
          {!isRequest && (
            <FormSection title="Add Photos" icon={ImageIcon}>
              <ImageUpload
                value={form.image_urls}
                onChange={(v) => updateField('image_urls', v)}
              />
            </FormSection>
          )}

          {/* 4. Price Field (Directly Controlled for all types) */}
          <FormSection title="Pricing" icon={Tag}>
            <PriceSelector
              value={form}
              onChange={(updatedForm) => setForm((prev) => ({ ...prev, ...updatedForm }))}
              showPriceField={true}
            />
          </FormSection>

          {/* 5. Time-Sensitive Resource Feature */}
          <FormSection title="Time-Sensitive Availability" icon={Calendar}>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form.is_time_sensitive}
                  onChange={(e) => {
                    const checked = e.target.checked
                    updateField('is_time_sensitive', checked)
                    if (!checked) {
                      updateField('expires_at', '')
                    } else if (!form.expires_at) {
                      // Default to 48 hours
                      const d = new Date(Date.now() + 48 * 3600 * 1000)
                      updateField('expires_at', d.toISOString().slice(0, 16))
                    }
                  }}
                  className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                />
                <div>
                  <span className="text-xs sm:text-sm font-bold text-gray-800">
                    Is this resource time-sensitive?
                  </span>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Check this for perishable items, event flowers, temporary offers, or time-critical giveaways.
                  </p>
                </div>
              </label>

              {form.is_time_sensitive && (
                <div className="pt-2 p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      <span>Availability Expiry Date & Time *</span>
                    </label>
                  </div>

                  <input
                    type="datetime-local"
                    required
                    min={new Date().toISOString().slice(0, 16)}
                    value={form.expires_at}
                    onChange={(e) => updateField('expires_at', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-amber-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 shadow-xs"
                  />

                  {/* Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-amber-900 mr-1">Presets:</span>
                    <button
                      type="button"
                      onClick={() => updateField('expires_at', new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16))}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100/80 text-amber-900 text-xs font-medium border border-amber-300 transition"
                    >
                      24 Hours
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('expires_at', new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().slice(0, 16))}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100/80 text-amber-900 text-xs font-medium border border-amber-300 transition"
                    >
                      3 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('expires_at', new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 16))}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100/80 text-amber-900 text-xs font-medium border border-amber-300 transition"
                    >
                      1 Week
                    </button>
                  </div>

                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    ⏱️ When this timeframe expires, the post will automatically be removed from public view, and you will receive a notification: <em>"Your resource was taken down due to time expiry. Consider proper disposal."</em>
                  </p>
                </div>
              )}
            </div>
          </FormSection>

          {/* 6. Location */}
          <FormSection title="Resource Location" icon={MapPin}>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-700">
                    Location Name / Area *
                  </label>
                  {isGeocodingLocation && (
                    <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" /> Auto-detecting area name...
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={form.location_name}
                  onChange={(e) => updateField('location_name', e.target.value)}
                  placeholder="e.g. Perumbavoor Town, Near Municipal Park"
                  className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                />
                <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                  <span>💡</span>
                  <span>Auto-filled when you tap the map or &ldquo;Use My Location&rdquo;. You can edit or adjust this name anytime.</span>
                </p>
              </div>
              <LocationMap
                value={{
                  latitude: form.latitude,
                  longitude: form.longitude,
                  locationName: form.location_name,
                }}
                onChange={handleLocationChange}
                onGeocodingStateChange={setIsGeocodingLocation}
              />
            </div>
          </FormSection>

          {/* 7. Availability Options */}
          {(isItem || isDisposal) && (
            <FormSection title="Pickup & Delivery" icon={Clock}>
              <AvailabilitySelector
                value={form}
                onChange={(v) => setForm(v)}
                show
              />
            </FormSection>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-md shadow-emerald-600/20 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Submitting Resource…</span>
              </>
            ) : (
              <span>Submit {TYPE_OPTIONS.find((t) => t.key === type)?.sub}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
