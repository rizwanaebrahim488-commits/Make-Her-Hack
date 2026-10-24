import React, { useState, useEffect } from 'react'
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
      title={`Eco-Tree: ${stage.title} (${stage.subtitle}) • ${points} Eco-Points (Click to view your Living Eco-Tree & Rewards)`}
      className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200/90 text-emerald-900 text-xs font-bold shadow-2xs hover:shadow-xs transition transform hover:scale-102 cursor-pointer ${className}`}
    >
      <span className="text-base sm:text-lg leading-none">{stage.icon}</span>
      <div className="flex items-baseline gap-1 text-left leading-tight">
        <span className="font-black text-emerald-900 text-xs sm:text-sm">{points}</span>
        <span className="text-[10px] text-emerald-600 font-semibold">pts</span>
        <span className="hidden sm:inline text-[11px] text-emerald-700/90 font-bold ml-0.5">
          • {stage.title}
        </span>
      </div>
    </button>
  )
}
