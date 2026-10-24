import React, { useState } from 'react'
import {
  Gift,
  Copy,
  Check,
  Sparkles,
  Trophy,
  ArrowRight,
  X,
  ExternalLink,
  ShieldCheck
} from 'lucide-react'

export default function MilestoneRewardModal({
  isOpen,
  onClose,
  reward,
  onNavigateToRewards
}) {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !reward) return null

  const handleCopy = () => {
    if (reward.code) {
      navigator.clipboard.writeText(reward.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Festive Celebration Banner */}
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 p-6 text-white text-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mx-auto mb-3 shadow-inner text-3xl">
            🎉
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-emerald-100 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Milestone Unlocked!</span>
          </span>

          <h3 className="text-xl sm:text-2xl font-black text-white">
            {reward.title || 'New Eco-Reward!'}
          </h3>
          <p className="text-xs text-emerald-100/90 mt-1">
            Your circular contributions just grew your living Eco-Tree!
          </p>
        </div>

        {/* Digital Coupon Card (Google Pay / Paytm Style) */}
        <div className="p-6 sm:p-7">
          <div className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-white rounded-3xl border-2 border-dashed border-emerald-300 p-6 shadow-sm overflow-hidden text-center mb-5">
            {/* Corner Decorative circles like real coupons */}
            <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-white border border-emerald-200 shadow-2xs" />
            <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-white border border-emerald-200 shadow-2xs" />
            <div className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-white border border-emerald-200 shadow-2xs" />
            <div className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-white border border-emerald-200 shadow-2xs" />

            {/* ReLoop Brand Header */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-lg">♻️</span>
              <span className="font-extrabold text-gray-800 text-sm tracking-tight">
                Re<span className="text-emerald-600">Loop</span> Eco-Reward
              </span>
            </div>

            {/* Discount Announcement */}
            <div className="my-2">
              <span className="text-4xl sm:text-5xl font-black text-emerald-600 tracking-tight drop-shadow-xs">
                {reward.discount || '10% OFF'}
              </span>
            </div>

            <p className="text-xs text-gray-600 font-medium px-4 mb-4">
              {reward.description || 'Eligible towards local circular store exchanges & sustainable workshops'}
            </p>

            {/* Unique Code Box */}
            <div className="bg-white rounded-2xl border border-emerald-200 p-3 shadow-inner flex items-center justify-between gap-2 max-w-xs mx-auto">
              <span className="font-mono font-black text-gray-800 text-base sm:text-lg tracking-wider select-all pl-2">
                {reward.code}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
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

            {/* Status & Guardrail Disclaimer */}
            <div className="mt-4 pt-3 border-t border-emerald-100 flex flex-col items-center gap-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Saved in My Rewards</span>
              </span>
              <span className="text-[10px] text-gray-400 font-medium">
                Demo Reward — Not Valid for Real Purchases
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => {
                onClose()
                if (onNavigateToRewards) onNavigateToRewards()
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Gift className="w-4 h-4" />
              <span>View in My Rewards</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-3 px-5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs sm:text-sm transition cursor-pointer"
            >
              Continue Growing
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
