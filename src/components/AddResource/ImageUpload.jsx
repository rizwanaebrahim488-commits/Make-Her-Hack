import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Image, Plus, AlertCircle, Loader2, Trash2 } from 'lucide-react'

const BUCKET = 'item-images'

// Helper to convert File to Data URL
function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = () => resolve(URL.createObjectURL(file))
    reader.readAsDataURL(file)
  })
}

export default function ImageUpload({ value = [], onChange, maxFiles = 5 }) {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState({})
  const [errors, setErrors] = useState({})

  const [imageUrls, setImageUrls] = useState(value)

  // Sync external value
  if (imageUrls.length === 0 && value.length > 0) {
    setImageUrls(value)
  }

  const handleFiles = async (e) => {
    const selected = Array.from(e.target.files || [])
    if (!selected.length) return

    const tooMany = imageUrls.length + selected.length > maxFiles
    if (tooMany) {
      setErrors({ general: `You can upload up to ${maxFiles} images.` })
      return
    }

    setErrors({})
    setUploading(true)

    const newFileEntries = selected.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      status: 'uploading',
      url: URL.createObjectURL(file),
    }))

    setFiles((prev) => [...prev, ...newFileEntries])
    selected.forEach((file, i) => {
      const idx = newFileEntries[i].id
      setProgress((p) => ({ ...p, [idx]: 25 }))
    })

    e.target.value = ''

    try {
      const uploadedUrls = []
      for (const entry of newFileEntries) {
        let finalUrl = null

        // 1. Try Supabase Storage
        if (supabase) {
          try {
            const fileExt = entry.file.name.split('.').pop()
            const fileName = `items/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
            const { error } = await supabase.storage
              .from(BUCKET)
              .upload(fileName, entry.file, { cacheControl: '3600', upsert: false })

            if (!error) {
              const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName)
              if (urlData?.publicUrl) {
                finalUrl = urlData.publicUrl
              }
            }
          } catch (storageErr) {
            console.warn('Storage bucket upload failed, using DataURL fallback:', storageErr)
          }
        }

        // 2. Fallback to Data URL if storage fails or bucket not created yet
        if (!finalUrl) {
          finalUrl = await fileToDataUrl(entry.file)
        }

        uploadedUrls.push(finalUrl)
        setProgress((p) => ({ ...p, [entry.id]: 100 }))
      }

      const nextUrls = [...imageUrls, ...uploadedUrls]
      setImageUrls(nextUrls)
      setFiles((prev) => prev.filter((f) => !newFileEntries.some((n) => n.id === f.id)))
      setUploading(false)
      onChange && onChange(nextUrls)
    } catch (err) {
      setUploading(false)
      setErrors({ general: err.message || 'Image upload failed. Please try again.' })
    }
  }

  const removeUrl = (url) => {
    const next = imageUrls.filter((u) => u !== url)
    setImageUrls(next)
    onChange && onChange(next)
  }

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
    setProgress((p) => { const { [id]: _, ...rest } = p; return rest })
  }

  const hasError = Object.keys(errors).length > 0

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-700">Photos</label>
        {imageUrls.length > 0 && (
          <span className="text-xs text-gray-500">
            {imageUrls.length}/{maxFiles}
          </span>
        )}
      </div>

      {hasError && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errors.general}</span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {files.map((file) => (
          <div key={file.id} className="relative group">
            <img
              src={file.url}
              alt="Preview"
              className="w-full h-24 rounded-xl object-cover border border-gray-200"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl opacity-0 group-hover:opacity-100 transition">
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="text-white text-xs font-medium"
              >
                Remove
              </button>
            </div>
            {progress[file.id] != null && progress[file.id] < 100 && (
              <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center rounded-xl">
                <Loader2 className="w-5 h-5 text-white animate-spin mb-1" />
                <span className="text-white text-[10px] font-medium">{progress[file.id]}%</span>
              </div>
            )}
          </div>
        ))}
        {imageUrls.map((url, i) => (
          <div key={i} className="relative group">
            <img src={url} alt="Uploaded" className="w-full h-24 rounded-xl object-cover border border-emerald-200" />
            <button
              type="button"
              onClick={() => removeUrl(url)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition cursor-pointer"
              aria-label="Remove image"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
        {imageUrls.length + files.length < maxFiles && (
          <label className="flex flex-col items-center justify-center h-24 w-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 hover:border-emerald-400 hover:text-emerald-600 cursor-pointer transition group">
            <Plus className="w-5 h-5 mb-1 text-gray-400 group-hover:text-emerald-600" />
            <span className="text-xs font-medium">Add Photo</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              className="hidden"
            />
          </label>
        )}
      </div>

      {imageUrls.length === 0 && files.length === 0 && (
        <p className="text-[10px] text-gray-400">At least one photo is recommended.</p>
      )}
    </div>
  )
}
