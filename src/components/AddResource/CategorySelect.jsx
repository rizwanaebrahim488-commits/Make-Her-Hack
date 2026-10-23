import React from 'react'
import { ChevronDown, Sparkles } from 'lucide-react'

const CATEGORIES = {
  item: [
    'Furniture',
    'Electronics',
    'Books',
    'Clothes',
    'Plants',
    'Home & Kitchen',
    'School Supplies',
    'Other',
  ],
  service: [
    'Repair',
    'Cleaning',
    'Tutoring',
    'Transport',
    'Gardening',
    'Other',
  ],
  request: [
    'Furniture',
    'Electronics',
    'Books',
    'Clothes',
    'Plants',
    'Home & Kitchen',
    'School Supplies',
    'Repair',
    'Cleaning',
    'Tutoring',
    'Transport',
    'Gardening',
    'Other',
  ],
  disposal: [
    'E-Waste',
    'Plastic',
    'Clothes',
    'Paper',
    'Floral Waste',
    'Metal',
    'Other',
  ],
}

export default function CategorySelect({ value, onChange, resourceType = 'item', placeholder = 'Select Category' }) {
  const options = CATEGORIES[resourceType] || CATEGORIES.item
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-700">Category</label>
      <div className="relative">
        <Sparkles className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
        >
          <option value="" disabled className="text-gray-400">
            {placeholder}
          </option>
          {options.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  )
}
