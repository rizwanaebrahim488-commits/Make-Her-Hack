import React, { useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import { getEcoPoints, getTreeStage } from '../lib/ecoPoints'

export default function EcoScorePill({ onOpenEcoTree, className = '' }) {
  const [points, setPoints] = useState(getEcoPoints())

  useEffect(() => {
    const handleUpdate = () => {
      setPoints(getEcoPoints())
    }
    window.addEventListener('reloop-points-awarded', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('reloop-points-awarded', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  const stage = getTreeStage(points)

  return (
    <button
      type="button"
      onClick={onOpenEcoTree}
      title={`${stage.title} • ${points} Eco-Points (Click to view your Eco-Tree)`}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs hover:shadow-xs transition transform hover:scale-102 cursor-pointer ${className}`}
    >
      <span className="text-sm">{stage.icon}</span>
      <span className="font-extrabold text-emerald-900">{points}</span>
      <span className="text-[10px] text-emerald-600 font-semibold hidden sm:inline">pts</span>
    </button>
  )
}
