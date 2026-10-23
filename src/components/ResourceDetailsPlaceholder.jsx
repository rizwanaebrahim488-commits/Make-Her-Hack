import React from 'react'
import { ArrowLeft, CheckCircle2, ShieldCheck, MapPin, Sparkles } from 'lucide-react'

export default function ResourceDetailsPlaceholder({ resource, onBack }) {
  if (!resource) return null

  return (
    <div className="min-h-screen bg-gray-50/80 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Back Button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-gray-100 text-gray-700 font-semibold text-sm border border-gray-200 shadow-xs transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore Resources</span>
        </button>

        {/* Card info preview */}
        <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-8 shadow-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-4 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Navigation Route Handshake Verified
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
            {resource.title}
          </h2>

          <p className="text-xs text-gray-400 font-mono mt-1">
            Resource ID: <span className="text-emerald-600 font-bold">{resource.id}</span> • Type: <span className="capitalize font-semibold text-gray-700">{resource.resource_type}</span>
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-6 items-start">
            <img
              src={resource.image_url}
              alt={resource.title}
              className="w-full sm:w-64 h-48 rounded-2xl object-cover shadow-sm"
            />
            
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  {resource.category}
                </span>
                <span className="text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {resource.location}
                </span>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">
                {resource.description}
              </p>

              <div className="pt-3 border-t border-gray-100 text-xs text-gray-500">
                <span>Provider: </span>
                <span className="font-bold text-gray-800">{resource.provider?.full_name}</span>
                {resource.status && (
                  <span className="ml-3 px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-semibold">
                    {resource.status}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl text-emerald-900 text-xs sm:text-sm flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Resource Details Page Ready for Implementation</p>
              <p className="mt-0.5 text-emerald-700 text-xs">
                The resource ID and payload are successfully routed. In the next step, once you share the Resource Details Page requirements, we will render the full detail layout, contact giver messaging flow, and location map.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
