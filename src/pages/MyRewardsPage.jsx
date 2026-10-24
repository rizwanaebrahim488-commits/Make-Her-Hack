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
  RotateCcw,
  Trash2,
} from 'lucide-react'

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

  useEffect(() => {
    setRewards(getSavedRewardsList())
  }, [])

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
              Demo rewards unlocked through eco quizzes and circular activities
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setCurrentView('game')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm shadow-emerald-600/20 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Play Match the Material</span>
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

        {/* Empty State */}
        {rewards.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto mb-4 text-3xl">
              🎁
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              No rewards unlocked yet
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto mb-6 leading-relaxed">
              Play our mini-game <strong>"Match the Material"</strong>, score 60+ points, and unlock your 10% OFF demo scratch card reward!
            </p>
            <button
              type="button"
              onClick={() => setCurrentView('game')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <span>Play Eco Game Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Rewards Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {rewards.map((reward) => {
              const isCopied = copiedCode === reward.code
              const dateStr = reward.unlockedAt
                ? new Date(reward.unlockedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Recent'

              return (
                <div
                  key={reward.id || reward.code}
                  className="group relative bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 rounded-3xl p-6 text-white shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  {/* Decorative background sheens */}
                  <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
                  <div className="absolute -left-6 -top-6 w-24 h-24 rounded-full bg-teal-400/20 pointer-events-none" />

                  <div>
                    {/* Top bar */}
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
                        {reward.status || 'Unlocked'}
                      </span>
                    </div>

                    {/* Value */}
                    <div className="my-2">
                      <span className="text-3xl font-black tracking-tight text-white block">
                        {reward.discount || '10% OFF'}
                      </span>
                      <span className="text-xs text-emerald-100 font-medium">
                        {reward.title || 'Circular Community Exchange Discount'}
                      </span>
                    </div>

                    {/* Code Box */}
                    <div className="mt-4 p-3 bg-black/25 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-between gap-2">
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
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-5 pt-3.5 border-t border-white/15 flex items-center justify-between text-[11px] text-emerald-200">
                    <div>
                      <span>Unlocked on {dateStr}</span>
                      {reward.score && <span> • Score: {reward.score} pts</span>}
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

        {/* Info Modal */}
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
                Redeeming Your 10% OFF Voucher
              </h3>
              <p className="text-xs text-gray-500 text-center mb-4">
                Code: <strong className="text-emerald-700 font-mono">{activeInfoReward.code}</strong>
              </p>

              <div className="space-y-3 text-xs text-gray-600 bg-gray-50 p-4 rounded-2xl border border-gray-200/80 mb-5">
                <p>
                  1. Browse items or services on the <strong>Explore Resources</strong> page that have a listed price or transport fee.
                </p>
                <p>
                  2. Share your reward code in direct chat with the resource giver or provider.
                </p>
                <p>
                  3. This demo reward demonstrates circular economy incentives and upcycling gamification.
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
