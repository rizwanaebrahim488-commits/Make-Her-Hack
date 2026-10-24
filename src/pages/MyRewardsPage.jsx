import React, { useState, useEffect } from 'react'
import AccountLayout from '../components/AccountLayout'
import {
  Gift,
  Copy,
  Check,
  Info,
  Sparkles,
  Trophy,
  ArrowRight,
  PlusCircle,
  RotateCcw,
  Trash2,
  ShieldCheck,
  AlertCircle
} from 'lucide-react'
import { getEcoPoints, getTreeStage, MILESTONES } from '../lib/ecoPoints'

export function getSavedRewardsList() {
  try {
    const raw = localStorage.getItem('reloop_rewards')
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

export default function MyRewardsPage({ setCurrentView }) {
  const [rewards, setRewards] = useState([])
  const [copiedCode, setCopiedCode] = useState(null)
  const [activeInfoReward, setActiveInfoReward] = useState(null)
  const [ecoPoints, setEcoPoints] = useState(getEcoPoints())

  useEffect(() => {
    setRewards(getSavedRewardsList())
    setEcoPoints(getEcoPoints())
  }, [])

  const treeStage = getTreeStage(ecoPoints)

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2500)
  }

  const handleClearRewards = () => {
    if (window.confirm('Are you sure you want to clear your saved demo rewards history?')) {
      localStorage.removeItem('reloop_rewards')
      setRewards([])
    }
  }

  return (
    <AccountLayout currentView="rewards" setCurrentView={setCurrentView} unreadCount={0}>
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-emerald-100 text-emerald-800">
                <Gift className="w-5 h-5 text-emerald-600" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                My Rewards
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Milestone rewards unlocked exclusively through platform transactions & Living Eco-Tree growth
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setCurrentView('add-resource')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm shadow-emerald-600/20 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Give Item (+50 pts)</span>
            </button>

            {rewards.length > 0 && (
              <button
                type="button"
                onClick={handleClearRewards}
                className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-gray-200 transition cursor-pointer"
                title="Clear rewards history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Eco-Tree Milestone Roadmap */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white rounded-3xl border border-emerald-200/80 p-5 sm:p-6 mb-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-10 h-10 rounded-2xl bg-white border border-emerald-200 flex items-center justify-center text-2xl shadow-2xs">
                {treeStage.icon}
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">
                  {treeStage.title} Progression ({ecoPoints} Eco-Points)
                </h3>
                <p className="text-xs text-gray-500">
                  Earn points by giving items (+50 pts), completing exchanges (+40 pts), and sharing resources (+20 pts).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCurrentView('dashboard')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline self-start sm:self-auto cursor-pointer"
            >
              View Full Eco-Tree →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MILESTONES.map((ms) => {
              const isUnlocked = ecoPoints >= ms.points
              return (
                <div
                  key={ms.points}
                  className={`p-3.5 rounded-2xl border transition ${
                    isUnlocked
                      ? 'bg-white border-emerald-300 shadow-xs'
                      : 'bg-white/60 border-gray-200 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-emerald-800">{ms.discount}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isUnlocked
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {isUnlocked ? '✓ Unlocked' : `${ms.points} pts`}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-gray-800 truncate">{ms.title}</p>
                  <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{ms.desc}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Empty State */}
        {rewards.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto mb-4 text-3xl">
              🎁
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              No milestone rewards unlocked yet
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto mb-6 leading-relaxed">
              Give a resource (+50 pts) or complete an exchange (+40 pts) to grow your Living Eco-Tree to 200 pts and unlock your first Google Pay-style digital reward card!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentView('add-resource')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Give an Item (+50 pts)</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentView('explore')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs sm:text-sm transition cursor-pointer"
              >
                <span>Explore Circular Resources</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Rewards Cards Grid (Google Pay / Paytm Style) */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {rewards.map((reward) => {
              const isCopied = copiedCode === reward.code
              const dateStr = reward.unlockedAt
                ? new Date(reward.unlockedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : (reward.date || 'Recent')

              return (
                <div
                  key={reward.id || reward.code}
                  className="group relative bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 rounded-3xl p-6 text-white shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  {/* Decorative background sheens */}
                  <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
                  <div className="absolute -left-6 -top-6 w-24 h-24 rounded-full bg-teal-400/20 pointer-events-none" />

                  <div>
                    {/* Top bar with ReLoop logo and milestone tag */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-sm">
                          ♻️
                        </span>
                        <span className="text-xs font-black tracking-wider uppercase">
                          ReLoop Rewards
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/30 text-emerald-100 border border-emerald-300/30">
                        {reward.badge || 'Milestone Unlocked'}
                      </span>
                    </div>

                    {/* Discount Value */}
                    <div className="my-2">
                      <span className="text-3xl font-black tracking-tight text-white block">
                        {reward.discount || '10% OFF'}
                      </span>
                      <span className="text-xs text-emerald-100 font-medium">
                        {reward.title || 'Living Eco-Tree Growth Milestone Reward'}
                      </span>
                    </div>

                    {/* Demo Disclaimer on Card */}
                    <div className="my-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/30 backdrop-blur-xs border border-white/10 text-[10px] text-amber-200 font-semibold">
                      <AlertCircle className="w-3 h-3 text-amber-300 shrink-0" />
                      <span>Demo Reward — Not Valid for Real Purchases</span>
                    </div>

                    {/* Code Box with Copy Button */}
                    <div className="mt-3 p-3 bg-black/25 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-emerald-200 uppercase tracking-widest block font-bold">
                          Coupon Code
                        </span>
                        <span className="font-mono text-sm sm:text-base font-black tracking-wider text-white">
                          {reward.code}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy(reward.code)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-emerald-900 font-black text-xs hover:bg-emerald-50 transition shadow-xs cursor-pointer shrink-0"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Code copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-5 pt-3.5 border-t border-white/15 flex items-center justify-between text-[11px] text-emerald-200">
                    <div>
                      <span>Unlocked on {dateStr}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveInfoReward(reward)}
                      className="hover:text-white underline font-medium cursor-pointer"
                    >
                      How to Redeem
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Info / How to Redeem Modal */}
        {activeInfoReward && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
            <div
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
                <Gift className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-black text-gray-900 text-center mb-1">
                Redeeming Your {activeInfoReward.discount} Milestone Reward
              </h3>
              <p className="text-xs text-gray-500 text-center mb-3">
                Coupon Code: <strong className="text-emerald-700 font-mono text-sm">{activeInfoReward.code}</strong>
              </p>

              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold text-center mb-4">
                ⚠️ Demo Reward — Not Valid for Real Purchases
              </div>

              <div className="space-y-3 text-xs text-gray-600 bg-gray-50 p-4 rounded-2xl border border-gray-200/80 mb-5">
                <p>
                  1. Browse circular items or services on the <strong>Explore Resources</strong> page that have a listed price or exchange fee.
                </p>
                <p>
                  2. Share your coupon code in direct chat with the resource giver or provider.
                </p>
                <p>
                  3. This reward card is awarded automatically when your <strong>Living Eco-Tree</strong> reaches transaction milestones.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveInfoReward(null)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </AccountLayout>
  )
}
