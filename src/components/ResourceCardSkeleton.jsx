import React from 'react'

export default function ResourceCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xs flex flex-col overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-4/3 sm:aspect-16/10 w-full bg-gray-200" />

      {/* Content Skeleton */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="h-5 w-20 bg-gray-200 rounded-md" />
            <div className="h-4 w-24 bg-gray-100 rounded-md" />
          </div>
          <div className="h-5 w-3/4 bg-gray-200 rounded-md" />
          <div className="h-3.5 w-full bg-gray-100 rounded-md" />
          <div className="h-3.5 w-4/5 bg-gray-100 rounded-md" />
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-200" />
            <div className="h-4 w-20 bg-gray-200 rounded-md" />
          </div>
          <div className="h-6 w-14 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
