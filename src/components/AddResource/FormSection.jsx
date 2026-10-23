import React from 'react'

export default function FormSection({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-emerald-600 shrink-0" />}
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        </div>
      </div>
      <div className="px-4 sm:px-6 py-4">{children}</div>
    </div>
  )
}
