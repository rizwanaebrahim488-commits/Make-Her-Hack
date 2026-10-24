import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  Award,
  ChevronRight,
  TrendingUp,
  Gift,
  PlusCircle,
  HelpCircle,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react'
import {
  getEcoPoints,
  getTreeStage,
  getEcoPointHistory,
  TREE_STAGES,
  POINT_RULES
} from '../lib/ecoPoints'

export default function LivingEcoTreeCard({
  setCurrentView,
  onOpenRewards
}) {
  const [points, setPoints] = useState(getEcoPoints())
  const [history, setHistory] = useState(getEcoPointHistory())
  const [showHowItWorks, setShowHowItWorks] = useState(false)

  useEffect(() => {
    const handleUpdate = () => {
      setPoints(getEcoPoints())
      setHistory(getEcoPointHistory())
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
    <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden mb-6">
      {/* Card Header & Dynamic Stage Graphic */}
      <div className={`relative bg-gradient-to-br ${stage.bgGradient} p-6 sm:p-8 overflow-hidden`}>
        {/* Soft Background Accents */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-300/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Tree Visual Illustration */}
          <div className="flex flex-col items-center sm:flex-row sm:items-center gap-5 text-center sm:text-left">
            {/* Visual Icon Avatar with Stage Halo */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/80 backdrop-blur-md border-2 border-white shadow-lg flex items-center justify-center text-5xl sm:text-6xl transform group-hover:scale-105 transition-transform duration-300">
                <span>{stage.icon}</span>
              </div>
              <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[11px] shadow-sm flex items-center gap-1 border-2 border-white">
                <Sparkles className="w-3 h-3 text-yellow-300" />
                <span>Lvl {stage.level}</span>
              </div>
            </div>

            {/* Stage Title & Info */}
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-white/70 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                  Living Eco-Tree
                </span>
                {stage.isGoldenVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-xs font-black shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Golden Verified Guardian</span>
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {stage.title}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-emerald-800/90 mt-0.5">
                {stage.subtitle}
              </p>
              <p className="text-xs text-gray-600 mt-2 max-w-md leading-relaxed">
                {stage.description}
              </p>
            </div>
          </div>

          {/* Right: Score Display & Quiz CTA */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right shrink-0">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-emerald-100 p-4 shadow-sm min-w-[170px]">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Total Eco-Points
              </span>
              <div className="flex items-baseline justify-center md:justify-end gap-1.5 mt-0.5">
                <span className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">
                  {points}
                </span>
                <span className="text-xs font-bold text-gray-400">pts</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentView && setCurrentView('game')}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Daily Quiz (+100 pts)</span>
            </button>
          </div>
        </div>

        {/* Progress Bar towards Next Tree Level */}
        <div className="relative z-10 mt-6 pt-5 border-t border-emerald-200/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-bold mb-2">
            <span className="text-emerald-950 flex items-center gap-1.5">
              <span>Growth Progress:</span>
              <span className="text-emerald-700 font-extrabold">{stage.progressText}</span>
            </span>
            <span className="text-gray-500 font-semibold">
              {stage.nextStage
                ? `${stage.pointsNeeded} pts to level up`
                : 'Maximum stage achieved!'}
            </span>
          </div>

          {/* Animated Bar */}
          <div className="w-full h-3 rounded-full bg-white/80 border border-emerald-200 overflow-hidden shadow-inner">
            <div
              className={`h-full ${stage.barColor} rounded-full transition-all duration-700 ease-out`}
              style={{ width: `${Math.max(5, stage.progressPercent)}%` }}
            />
          </div>

          {/* Stepper Dots for all stages */}
          <div className="grid grid-cols-5 gap-1 mt-3 text-center">
            {TREE_STAGES.map((s) => {
              const isCurrent = s.level === stage.level
              const isPassed = s.level < stage.level
              return (
                <div key={s.level} className="flex flex-col items-center">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all ${
                      isCurrent
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-300 scale-110 shadow-xs'
                        : isPassed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isPassed ? '✓' : s.icon}
                  </div>
                  <span
                    className={`text-[10px] mt-1 font-medium truncate max-w-full ${
                      isCurrent ? 'text-emerald-900 font-bold' : 'text-gray-400'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Action Strip: How to Earn Points & Quick Links */}
      <div className="p-5 sm:p-6 bg-white border-t border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowHowItWorks(!showHowItWorks)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-emerald-700 bg-gray-50 hover:bg-emerald-50 px-3 py-2 rounded-xl border border-gray-200 transition cursor-pointer"
            >
              <Info className="w-4 h-4 text-emerald-600" />
              <span>{showHowItWorks ? 'Hide Point Rules' : 'How to Earn Eco-Points'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onOpenRewards) onOpenRewards()
                else if (setCurrentView) setCurrentView('rewards')
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-3.5 py-2 rounded-xl border border-emerald-200 transition cursor-pointer"
            >
              <Gift className="w-4 h-4" />
              <span>My Unlocked Rewards</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentView && setCurrentView('add-resource')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Give Item (+50 pts)</span>
            </button>
          </div>
        </div>

        {/* Expandable Point Rules Guide */}
        {showHowItWorks && (
          <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in duration-200">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Circular Actions That Grow Your Tree:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">🎁</span>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg">
                    +50 pts
                  </span>
                </div>
                <p className="text-xs font-bold text-gray-900">Post / Give an Item</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Share unused furniture, books, electronics or clothes.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">🤝</span>
                  <span className="text-xs font-black text-teal-700 bg-teal-100 px-2 py-0.5 rounded-lg">
                    +40 pts
                  </span>
                </div>
                <p className="text-xs font-bold text-gray-900">Complete an Exchange</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Handover an item or complete a requested exchange.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-cyan-50/70 border border-cyan-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">♻️</span>
                  <span className="text-xs font-black text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded-lg">
                    +20 pts
                  </span>
                </div>
                <p className="text-xs font-bold text-gray-900">Request or Disposal</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Post a community need or share recycling center info.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">🧠</span>
                  <span className="text-xs font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg">
                    Up to +100
                  </span>
                </div>
                <p className="text-xs font-bold text-gray-900">Match the Material</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Daily mini-quiz: earn +20 bonus points per question.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Points Activity Strip */}
        {history.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Recent Eco-Activity
            </span>
            <div className="flex flex-wrap gap-2">
              {history.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700"
                >
                  <span>{item.icon || '🌱'}</span>
                  <span className="font-semibold text-gray-800">{item.label}</span>
                  <span className="font-bold text-emerald-700">+{item.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
