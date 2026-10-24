import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getResourcesByUser,
  updateResource,
  deleteResource,
} from '../lib/supabase'
import { awardEcoPoints } from '../lib/ecoPoints'
import {
  ArrowLeft,
  Package,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  Eye,
  Clock,
  MapPin,
  X,
  Loader2,
  Tag,
  Calendar,
  AlertTriangle,
  ImageIcon,
  Wrench,
  Truck,
  MessageCircle,
} from 'lucide-react'
import AccountLayout from '../components/AccountLayout'
import ImageUpload from '../components/AddResource/ImageUpload'

const STATUS_LABELS = {
  available: 'Active',
  pending: 'Pending',
  completed: 'Completed',
  unavailable: 'Unavailable',
  expired: 'Expired',
  deleted: 'Deleted',
}

const STATUS_COLORS = {
  available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
  unavailable: 'bg-gray-50 text-gray-700 border-gray-200',
  expired: 'bg-red-50 text-red-700 border-red-200',
  deleted: 'bg-gray-100 text-gray-400 border-gray-200',
}

export default function MyResourcesPage({ setCurrentView, onOpenResourceDetails, onOpenChat }) {
  const { user } = useAuth()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // Modals state
  const [resourceToDelete, setResourceToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [resourceToEdit, setResourceToEdit] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!user) {
        if (mounted) {
          setResources([])
          setLoading(false)
        }
        return
      }
      try {
        setLoading(true)
        const { data } = await getResourcesByUser(user.id)
        if (mounted) {
          // Strictly verify that only resources belonging to this logged in user appear in My Resources
          const myOnly = (data || []).filter(
            (r) => (r.provider_id === user.id || r.provider?.id === user.id) && r.status !== 'deleted'
          )
          setResources(myOnly)
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load your resources.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [user])

  const [quickViewResource, setQuickViewResource] = useState(null)

  // View handler
  const handleView = (resource) => {
    if (onOpenResourceDetails) {
      onOpenResourceDetails(resource)
    } else if (setCurrentView) {
      setCurrentView('details')
    } else {
      setQuickViewResource(resource)
    }
  }

  // Edit Modal Open
  const handleOpenEdit = (resource) => {
    const existingImages = (Array.isArray(resource.image_urls) && resource.image_urls.length > 0)
      ? resource.image_urls
      : (resource.image_url ? [resource.image_url] : [])

    setResourceToEdit(resource)
    setEditForm({
      title: resource.title || '',
      description: resource.description || '',
      category: resource.category || '',
      condition: resource.condition || '',
      repairable_if_damaged: !!resource.repairable_if_damaged,
      is_free: resource.is_free !== false,
      price: resource.price ?? 0,
      location_name: resource.location_name || resource.location || '',
      is_time_sensitive: !!resource.is_time_sensitive,
      expires_at: resource.expires_at ? resource.expires_at.slice(0, 16) : '',
      image_urls: existingImages,
      quantity: resource.quantity || '1',
      pickup_available: resource.pickup_available !== false,
      delivery_available: !!resource.delivery_available,
    })
  }

  // Save Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!resourceToEdit) return
    setUpdating(true)
    setError(null)

    try {
      const updates = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        category: editForm.category,
        condition: editForm.condition || null,
        repairable_if_damaged: !!editForm.repairable_if_damaged,
        is_free: editForm.is_free,
        price: editForm.is_free ? 0 : parseFloat(editForm.price) || 0,
        location_name: editForm.location_name.trim(),
        is_time_sensitive: !!editForm.is_time_sensitive,
        expires_at: editForm.is_time_sensitive && editForm.expires_at ? new Date(editForm.expires_at).toISOString() : null,
        image_urls: editForm.image_urls || [],
        image_url: editForm.image_urls?.[0] || null,
        quantity: parseInt(editForm.quantity, 10) || 1,
        pickup_available: !!editForm.pickup_available,
        delivery_available: !!editForm.delivery_available,
      }

      await updateResource(resourceToEdit.id, updates)

      setResources((prev) =>
        prev.map((r) => (r.id === resourceToEdit.id ? { ...r, ...updates } : r))
      )

      setResourceToEdit(null)
      setSuccessMessage('Resource updated successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err.message || 'Failed to update resource.')
    } finally {
      setUpdating(false)
    }
  }

  // Soft Delete Handler with Confirmation
  const handleConfirmDelete = async () => {
    if (!resourceToDelete) return
    setDeleting(true)
    try {
      await deleteResource(resourceToDelete.id)
      setResources((prev) => prev.filter((r) => r.id !== resourceToDelete.id))
      setResourceToDelete(null)
      setSuccessMessage('Resource has been deleted successfully.')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err.message || 'Failed to delete resource.')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleAvailability = async (resource) => {
    const nextStatus = resource.status === 'unavailable' ? 'available' : 'unavailable'
    try {
      await updateResource(resource.id, { status: nextStatus })
      setResources((prev) =>
        prev.map((r) => (r.id === resource.id ? { ...r, status: nextStatus } : r))
      )
    } catch (err) {
      setError(err.message || 'Failed to update status.')
    }
  }

  const handleMarkCompleted = async (resource) => {
    try {
      await updateResource(resource.id, { status: 'completed' })
      setResources((prev) =>
        prev.map((r) => (r.id === resource.id ? { ...r, status: 'completed' } : r))
      )
      awardEcoPoints('COMPLETE_EXCHANGE', 40, {
        userId: user?.id,
        details: `Completed exchange for resource: "${resource.title}"`
      })
      setSuccessMessage(`"${resource.title}" marked as completed! +40 Eco-Points earned! 🤝`)
      setTimeout(() => setSuccessMessage(null), 3500)
    } catch (err) {
      setError(err.message || 'Failed to update status.')
    }
  }

  if (loading) {
    return (
      <AccountLayout currentView="resources" setCurrentView={setCurrentView} unreadCount={0}>
        <div className="py-16 text-center">
          <div className="animate-pulse h-8 w-32 bg-gray-200 rounded-full mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading your resources...</p>
        </div>
      </AccountLayout>
    )
  }

  return (
    <AccountLayout currentView="resources" setCurrentView={setCurrentView} unreadCount={0}>
      <div className="max-w-4xl mx-auto">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <button
              onClick={() => setCurrentView('dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-gray-100 text-gray-700 font-semibold text-sm border border-gray-200 shadow-xs transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to My ReLoop</span>
            </button>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-3">My Resources</h2>
          </div>
          <button
            onClick={() => setCurrentView('add-resource')}
            className="self-start sm:self-auto px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition cursor-pointer"
          >
            + Give Another Item
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Listings Cards Grid */}
        {resources.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-gray-200 shadow-xs">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base font-bold text-gray-900">You haven't posted any resources yet</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              Give an item or share a service with your community. It will appear here once submitted.
            </p>
            <button
              onClick={() => setCurrentView('add-resource')}
              className="mt-5 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
            >
              Give an Item Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {resources.map((r) => {
              const statusColor = STATUS_COLORS[r.status] || 'bg-gray-50 text-gray-700 border-gray-200'
              const statusLabel = STATUS_LABELS[r.status] || r.status
              const imageUrl = r.image_url || (r.image_urls && r.image_urls[0]) || null
              const isTimeSensitive = r.is_time_sensitive
              const locationDisplay = r.location_name || r.location || 'Location not specified'
              const priceDisplay = r.is_free !== false || r.price === 0 ? 'Free' : `₹${r.price}`

              return (
                <div
                  key={r.id}
                  className="bg-white rounded-3xl border border-gray-200/90 hover:border-emerald-200 overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col sm:flex-row"
                >
                  {/* Left: Image & Badges */}
                  <div className="relative w-full sm:w-48 h-40 sm:h-auto bg-gray-100 overflow-hidden shrink-0">
                    {imageUrl ? (
                      <img src={imageUrl} alt={r.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-8 h-8" />
                      </div>
                    )}

                    <span className={`absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${statusColor}`}>
                      {statusLabel}
                    </span>

                    <span className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-md">
                      {priceDisplay}
                    </span>
                  </div>

                  {/* Right: Info & Actions */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="text-base font-bold text-gray-900 leading-snug line-clamp-1">
                          {r.title}
                        </h4>
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 shrink-0">
                          {r.category || 'General'}
                        </span>
                      </div>

                      {/* Location Name Display */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-2">
                        <span className="flex items-center gap-1 font-medium text-gray-700">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{locationDisplay}</span>
                        </span>

                        {r.condition && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span>{r.condition}</span>
                          </>
                        )}

                        {r.repairable_if_damaged && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-teal-700 font-semibold bg-teal-50 px-1.5 py-0.5 rounded text-[10px]">
                              Repairable
                            </span>
                          </>
                        )}
                      </div>

                      {/* Description preview */}
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                        {r.description || 'No description provided.'}
                      </p>

                      {/* Time Sensitive Banner */}
                      {isTimeSensitive && (
                        <div className="mb-3 px-2.5 py-1.5 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>
                            Time-Sensitive: Available until {r.expires_at ? new Date(r.expires_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Expiry specified'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons: View, Edit, Availability, Delete */}
                    <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {/* VIEW BUTTON - Fully Functional */}
                        <button
                          type="button"
                          onClick={() => handleView(r)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>

                        {/* EDIT BUTTON - Fully Functional */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(r)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {/* MESSAGES / CHATS BUTTON */}
                        <button
                          type="button"
                          onClick={() => setCurrentView('messages')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold transition cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Messages</span>
                        </button>

                        {/* MARK COMPLETED / EXCHANGED BUTTON */}
                        {r.status !== 'completed' && r.status !== 'deleted' && (
                          <button
                            type="button"
                            onClick={() => handleMarkCompleted(r)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition cursor-pointer"
                            title="Mark transaction completed and award +40 Eco-Points"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Mark Completed (+40 pts)</span>
                          </button>
                        )}

                        {/* Toggle Status */}
                        {r.status !== 'expired' && (
                          <button
                            type="button"
                            onClick={() => handleToggleAvailability(r)}
                            className="text-xs text-gray-500 hover:text-gray-800 underline ml-1 cursor-pointer"
                          >
                            {r.status === 'unavailable' ? 'Mark Available' : 'Mark Unavailable'}
                          </button>
                        )}
                      </div>

                      {/* DELETE BUTTON - Opens Confirmation Modal */}
                      <button
                        type="button"
                        onClick={() => setResourceToDelete(r)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-xl transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>

      {/* ===================== DELETE CONFIRMATION DIALOG ===================== */}
      {resourceToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-red-100">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-gray-900">
              Delete Resource?
            </h3>
            
            <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
              Are you sure you want to delete <strong className="text-gray-900">"{resourceToDelete.title}"</strong>? 
              This will remove the listing from public view across ReLoop.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setResourceToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs sm:text-sm font-semibold hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete Resource</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== EDIT RESOURCE MODAL ===================== */}
      {resourceToEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-gray-900">Edit Resource Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setResourceToEdit(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Photo Upload & Image Edit */}
              <div className="space-y-1.5 p-3.5 bg-gray-50/80 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>Resource Photos</span>
                  </label>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {editForm.image_urls?.length || 0} / 5 photos
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mb-2">
                  Upload new photos, replace existing photos, or remove photos.
                </p>
                <ImageUpload
                  value={editForm.image_urls}
                  onChange={(urls) => setEditForm((prev) => ({ ...prev, image_urls: urls }))}
                  maxFiles={5}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Detailed Description *</label>
                <textarea
                  required
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Condition</label>
                  <input
                    type="text"
                    value={editForm.condition}
                    onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                    placeholder="e.g. Gently Used"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.quantity}
                    onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Repairable Checkbox */}
              <label className="flex items-center gap-2.5 cursor-pointer p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <input
                  type="checkbox"
                  checked={!!editForm.repairable_if_damaged}
                  onChange={(e) => setEditForm({ ...editForm, repairable_if_damaged: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-semibold text-gray-800">
                  Repairable if damaged
                </span>
              </label>

              {/* Fulfillment Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-800">
                  <input
                    type="checkbox"
                    checked={!!editForm.pickup_available}
                    onChange={(e) => setEditForm({ ...editForm, pickup_available: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Pickup available</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-800">
                  <input
                    type="checkbox"
                    checked={!!editForm.delivery_available}
                    onChange={(e) => setEditForm({ ...editForm, delivery_available: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Delivery available</span>
                </label>
              </div>

              {/* Price / Free Toggle */}
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <label className="block text-xs font-semibold text-gray-700">Pricing Mode</label>
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="edit-price-mode"
                      checked={editForm.is_free}
                      onChange={() => setEditForm({ ...editForm, is_free: true, price: 0 })}
                      className="text-emerald-600"
                    />
                    <span className="font-semibold text-gray-800">Free</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="edit-price-mode"
                      checked={!editForm.is_free}
                      onChange={() => setEditForm({ ...editForm, is_free: false })}
                      className="text-emerald-600"
                    />
                    <span className="font-semibold text-gray-800">Priced (₹)</span>
                  </label>
                </div>
                {!editForm.is_free && (
                  <div className="pt-1">
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="Enter price in ₹"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-sm font-semibold"
                    />
                  </div>
                )}
              </div>

              {/* Location Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Location Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.location_name}
                  onChange={(e) => setEditForm({ ...editForm, location_name: e.target.value })}
                  placeholder="e.g. Perumbavoor Town"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                />
              </div>

              {/* Time Sensitive */}
              <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!editForm.is_time_sensitive}
                    onChange={(e) => setEditForm({ ...editForm, is_time_sensitive: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span className="text-xs font-bold text-gray-800">Time-Sensitive Resource</span>
                </label>
                {editForm.is_time_sensitive && (
                  <input
                    type="datetime-local"
                    value={editForm.expires_at}
                    onChange={(e) => setEditForm({ ...editForm, expires_at: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs"
                  />
                )}
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResourceToEdit(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition disabled:opacity-50 flex items-center gap-2"
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AccountLayout>
  )
}
