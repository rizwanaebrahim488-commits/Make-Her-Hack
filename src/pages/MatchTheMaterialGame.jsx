import React, { useState, useEffect, useRef } from 'react'
import {
  Sparkles,
  Trophy,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Gift,
  Copy,
  Check,
  Info,
  HelpCircle,
  ExternalLink,
  Flame,
  Award,
  Share2,
} from 'lucide-react'

export const GAME_QUESTIONS = [
  {
    id: 1,
    material: 'Old Jeans',
    icon: '👖',
    category: 'Textiles & Denim',
    tip: 'Heavy cotton denim that is too worn out to wear.',
    options: ['Tote Bag', 'Drinking Water', 'Metal Spoon', 'Glass Bottle'],
    correctAnswer: 'Tote Bag',
    explanation: 'Old denim can easily be upcycled into durable tote bags!',
  },
  {
    id: 2,
    material: 'Wooden Scraps',
    icon: '🪵',
    category: 'Wood & Carpentry',
    tip: 'Leftover cuts from furniture making or pallets.',
    options: ['Mini Shelf', 'Paper Cup', 'Soap', 'Plastic Bag'],
    correctAnswer: 'Mini Shelf',
    explanation: 'Scrap wood pieces can be sanded and painted to make rustic mini shelves.',
  },
  {
    id: 3,
    material: 'Empty Glass Jar',
    icon: '🫙',
    category: 'Glass & Containers',
    tip: 'Used pasta sauce or jam containers with lids.',
    options: ['Pen Holder', 'Brick', 'Cotton Shirt', 'Notebook'],
    correctAnswer: 'Pen Holder',
    explanation: 'Glass jars make wonderful desktop pen holders and planters.',
  },
  {
    id: 4,
    material: 'Cardboard Box',
    icon: '📦',
    category: 'Paper & Packaging',
    tip: 'Delivery boxes and packaging cartons in sturdy condition.',
    options: ['Storage Organizer', 'Metal Chain', 'Glass Window', 'Ceramic Plate'],
    correctAnswer: 'Storage Organizer',
    explanation: 'Sturdy cardboard boxes can be covered in fabric or paper for home organization.',
  },
  {
    id: 5,
    material: 'Fabric Scraps',
    icon: '🧵',
    category: 'Cloth & Tailoring',
    tip: 'Colorful remnants left after stitching clothes.',
    options: ['Small Pouch', 'Steel Bottle', 'Glass Bowl', 'Wooden Chair'],
    correctAnswer: 'Small Pouch',
    explanation: 'Leftover cloth scraps are ideal for stitching small pouches or patch quilts.',
  },
]

// Generate a realistic unique coupon code like RELOOP-8K2P9X
function generateCouponCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  let part = ''
  for (let i = 0; i < 6; i++) {
    part += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `RELOOP-${part}`
}

export function getSavedRewards() {
  try {
    const raw = localStorage.getItem('reloop_rewards')
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.warn('Failed to parse reloop_rewards:', e)
    return []
  }
}

export function saveReward(reward) {
  try {
    const existing = getSavedRewards()
    // Avoid exact duplicate code entries
    if (!existing.some((r) => r.code === reward.code)) {
      const updated = [reward, ...existing]
      localStorage.setItem('reloop_rewards', JSON.stringify(updated))
      return updated
    }
    return existing
  } catch (e) {
    console.warn('Failed to save reward:', e)
    return []
  }
}

/* =======================================================================
   INTERACTIVE SCRATCH CARD COMPONENT (Google Pay / Paytm Style)
======================================================================= */
function ScratchCard({ isRevealed, onReveal, children }) {
  const canvasRef = useRef(null)
  const [scratchedPercent, setScratchedPercent] = useState(0)
  const isDrawing = useRef(false)

  useEffect(() => {
    if (isRevealed) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // Make canvas responsive to its container width/height
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    // Draw Google Pay style metallic iridescent scratch coating
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#059669')
    gradient.addColorStop(0.3, '#10b981')
    gradient.addColorStop(0.5, '#34d399')
    gradient.addColorStop(0.7, '#0d9488')
    gradient.addColorStop(1, '#047857')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add decorative shimmer circles & pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
    for (let i = 0; i < 12; i++) {
      ctx.beginPath()
      ctx.arc(
        (i * 45) % canvas.width,
        ((i * 35) + 20) % canvas.height,
        25,
        0,
        Math.PI * 2
      )
      ctx.fill()
    }

    // Text on scratch surface
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('🎁 Tap or Scratch to Reveal', canvas.width / 2, canvas.height / 2 - 8)

    ctx.font = '12px sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
    ctx.fillText('Your Exclusive Eco Reward Inside!', canvas.width / 2, canvas.height / 2 + 16)
  }, [isRevealed])

  const scratch = (clientX, clientY) => {
    if (isRevealed) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, 26, 0, Math.PI * 2)
    ctx.fill()

    // Estimate progress
    setScratchedPercent((prev) => {
      const next = prev + 5
      if (next >= 40 && !isRevealed) {
        onReveal()
      }
      return next
    })
  }

  const handleMouseDown = (e) => {
    isDrawing.current = true
    scratch(e.clientX, e.clientY)
  }

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return
    scratch(e.clientX, e.clientY)
  }

  const handleMouseUp = () => {
    isDrawing.current = false
  }

  const handleTouchStart = (e) => {
    isDrawing.current = true
    if (e.touches[0]) {
      scratch(e.touches[0].clientX, e.touches[0].clientY)
    }
  }

  const handleTouchMove = (e) => {
    if (!isDrawing.current) return
    if (e.touches[0]) {
      scratch(e.touches[0].clientX, e.touches[0].clientY)
    }
  }

  const handleTouchEnd = () => {
    isDrawing.current = false
  }

  return (
    <div className="relative w-full max-w-sm mx-auto overflow-hidden rounded-3xl shadow-xl border-2 border-emerald-300">
      {/* Underlying Reward Card Content */}
      <div className="w-full">{children}</div>

      {/* Scratch Canvas Overlay */}
      {!isRevealed && (
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={onReveal}
          className="absolute inset-0 w-full h-full cursor-pointer touch-none z-20 transition-opacity duration-500"
        />
      )}
    </div>
  )
}

/* =======================================================================
   CONFETTI CELEBRATION EFFECT
======================================================================= */
function ConfettiCanvas() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center">
        {Array.from({ length: 36 }).map((_, i) => {
          const colors = ['#10B981', '#34D399', '#F59E0B', '#3B82F6', '#EC4899', '#6366F1']
          const color = colors[i % colors.length]
          const left = `${(i * 2.8) % 100}%`
          const delay = `${(i * 0.08).toFixed(2)}s`
          const size = `${Math.floor(Math.random() * 8) + 8}px`
          return (
            <span
              key={i}
              className="absolute animate-bounce opacity-80"
              style={{
                left,
                top: `${(i * 3) % 40}%`,
                width: size,
                height: size,
                backgroundColor: color,
                borderRadius: i % 2 === 0 ? '50%' : '3px',
                animationDuration: `${1.5 + (i % 3) * 0.5}s`,
                animationDelay: delay,
                transform: `rotate(${i * 15}deg)`,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

/* =======================================================================
   REDEEM INSTRUCTION MODAL
======================================================================= */
function RedeemInfoModal({ isOpen, onClose, code }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-emerald-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
          <Gift className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-black text-gray-900 text-center mb-1">
          How to Redeem Your Demo Reward
        </h3>
        <p className="text-xs text-gray-500 text-center mb-5">
          ReLoop Community Upcycling Discount
        </p>

        <div className="space-y-3.5 text-xs text-gray-600 bg-gray-50 p-4 rounded-2xl border border-gray-200/80 mb-5">
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
              1
            </span>
            <p>
              Browse items or services on the <strong>Explore Resources</strong> page that have a listed price or exchange fee.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
              2
            </span>
            <p>
              When chatting with the provider, mention your code{' '}
              <strong className="text-emerald-700 font-mono bg-emerald-100/60 px-1.5 py-0.5 rounded">
                {code}
              </strong>{' '}
              to apply 10% off their priced item or delivery fee!
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
              3
            </span>
            <p>
              This is an educational community demonstration reward for testing circular economy incentives.
            </p>
          </div>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 mb-5 flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Demo Reward — Valid for simulated community exchanges. Not redeemable for cash.</span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
        >
          Got It!
        </button>
      </div>
    </div>
  )
}

/* =======================================================================
   MAIN COMPONENT: MATCH THE MATERIAL GAME
======================================================================= */
export default function MatchTheMaterialGame({ setCurrentView, onNavigateToExplore }) {
  const [gameState, setGameState] = useState('start') // 'start' | 'playing' | 'results'
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [rewardCode, setRewardCode] = useState(null)
  const [isCardScratched, setIsCardScratched] = useState(false)
  const [copiedToast, setCopiedToast] = useState(false)
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false)
  const [savedRewardsCount, setSavedRewardsCount] = useState(0)

  // Sync count of existing unlocked rewards on mount
  useEffect(() => {
    const list = getSavedRewards()
    setSavedRewardsCount(list.length)
  }, [gameState])

  const currentQ = GAME_QUESTIONS[currentIndex]

  // Start fresh game session
  const handleStartGame = () => {
    setCurrentIndex(0)
    setSelectedOption(null)
    setIsAnswered(false)
    setScore(0)
    setCorrectCount(0)
    setIsCardScratched(false)
    setRewardCode(generateCouponCode())
    setGameState('playing')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Answer selection handler
  const handleSelectOption = (option) => {
    if (isAnswered) return
    setSelectedOption(option)
    setIsAnswered(true)

    const isCorrect = option === currentQ.correctAnswer
    if (isCorrect) {
      setScore((prev) => prev + 20)
      setCorrectCount((prev) => prev + 1)
    }
  }

  // Next Question / Finish Game
  const handleNextQuestion = () => {
    if (currentIndex < GAME_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedOption(null)
      setIsAnswered(false)
    } else {
      // Completed all 5 questions
      const finalScore = score + (selectedOption === currentQ.correctAnswer ? 20 : 0)
      if (finalScore >= 60 && rewardCode) {
        // Save reward to localStorage
        saveReward({
          id: `rew-${Date.now()}`,
          code: rewardCode,
          discount: '10% OFF',
          title: '10% Circular Community Discount',
          description: 'Eligible for community exchanges or priced items in ReLoop.',
          score: finalScore,
          unlockedAt: new Date().toISOString(),
          status: 'Unlocked',
        })
      }
      setGameState('results')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Copy coupon code to clipboard with toast
  const handleCopyCode = () => {
    if (!rewardCode) return
    navigator.clipboard.writeText(rewardCode)
    setCopiedToast(true)
    setTimeout(() => setCopiedToast(false), 2500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-white to-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* ================= 1. GAME START SCREEN ================= */}
        {gameState === 'start' && (
          <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-6 sm:p-10 text-center animate-fade-in">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/70 text-emerald-800 text-xs font-bold mb-4 border border-emerald-200/60 shadow-2xs">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>ReLoop Eco Gamification</span>
            </div>

            {/* Graphics & Icons */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-white flex items-center justify-center text-4xl shadow-lg shadow-emerald-600/30">
                ♻️
              </div>
              <span className="absolute -top-2 -right-2 text-2xl animate-pulse">✨</span>
              <span className="absolute -bottom-2 -left-2 text-2xl">🌱</span>
            </div>

            {/* Title & Subtitle */}
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-2">
              Match the Material
            </h1>
            <p className="text-base sm:text-lg font-bold text-emerald-700 mb-4">
              Find a new purpose for unused materials!
            </p>

            <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto leading-relaxed mb-6">
              Test your upcycling smarts in 5 quick challenges. Match everyday materials like old jeans, scrap wood, and glass jars to their best reusable creations!
            </p>

            {/* Rules Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left mb-8">
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80">
                <span className="text-base font-bold text-emerald-700">5 Questions</span>
                <p className="text-[11px] text-gray-500 mt-0.5">Quick multiple-choice upcycling challenges.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80">
                <span className="text-base font-bold text-emerald-700">+20 Pts Each</span>
                <p className="text-[11px] text-gray-500 mt-0.5">Score points for every correct second life match.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80">
                <span className="text-base font-bold text-emerald-800">10% OFF Reward</span>
                <p className="text-[11px] text-emerald-700 mt-0.5">Score 60+ points to unlock your scratch card reward!</p>
              </div>
            </div>

            {/* Note */}
            <p className="text-xs font-semibold text-emerald-800 bg-emerald-50/80 py-2 px-4 rounded-xl inline-block mb-6 border border-emerald-200/60">
              🎁 Play, learn, and unlock eco-friendly rewards!
            </p>

            {/* Start Button */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleStartGame}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-lg shadow-emerald-600/30 transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Start Game</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              {savedRewardsCount > 0 && (
                <button
                  type="button"
                  onClick={() => setCurrentView('rewards')}
                  className="w-full py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Gift className="w-4 h-4 text-emerald-600" />
                  <span>View My Unlocked Rewards ({savedRewardsCount})</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= 2. ACTIVE GAMEPLAY & QUESTIONS ================= */}
        {gameState === 'playing' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 animate-fade-in">
            {/* Top Navigation & Score Bar */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  Question {currentIndex + 1} of {GAME_QUESTIONS.length}
                </span>
                <span className="text-xs text-gray-400 hidden sm:inline">•</span>
                <span className="text-xs text-gray-500 hidden sm:inline">{currentQ.category}</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-black text-xs">
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                <span>Score: {score} pts</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / GAME_QUESTIONS.length) * 100}%` }}
              />
            </div>

            {/* Material Card Presentation */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white border border-emerald-100 text-center mb-6 relative overflow-hidden">
              <div className="w-20 h-20 rounded-2xl bg-white shadow-md mx-auto mb-3 flex items-center justify-center text-4xl border border-emerald-100">
                {currentQ.icon}
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Material to Upcycle
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 mb-2">
                {currentQ.material}
              </h2>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {currentQ.tip}
              </p>

              <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white/90 px-3 py-1.5 rounded-full border border-gray-200">
                <span>🤔 What can you transform this into?</span>
              </div>
            </div>

            {/* Options List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOption === option
                const isCorrect = option === currentQ.correctAnswer

                let btnStyles = 'bg-gray-50/80 hover:bg-emerald-50/60 border-gray-200 hover:border-emerald-300 text-gray-800'
                if (isAnswered) {
                  if (isCorrect) {
                    btnStyles = 'bg-emerald-100/90 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                  } else if (isSelected) {
                    btnStyles = 'bg-red-100/90 border-red-500 text-red-950 font-bold shadow-xs'
                  } else {
                    btnStyles = 'bg-gray-50/50 border-gray-200 text-gray-400 opacity-60'
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(option)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left flex items-center justify-between cursor-pointer ${btnStyles} ${
                      !isAnswered ? 'hover:-translate-y-0.5 active:scale-[0.98]' : 'cursor-default'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-xs font-black text-gray-600 shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-sm font-bold">{option}</span>
                    </div>

                    {isAnswered && (
                      <div>
                        {isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 animate-scale-in" />
                        )}
                        {!isCorrect && isSelected && (
                          <XCircle className="w-5 h-5 text-red-600 shrink-0 animate-scale-in" />
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Answer Feedback & Explanation Box */}
            {isAnswered && (
              <div
                className={`p-4 rounded-2xl mb-6 text-xs leading-relaxed animate-fade-in flex items-start gap-3 border ${
                  selectedOption === currentQ.correctAnswer
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                {selectedOption === currentQ.correctAnswer ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold mb-0.5">
                    {selectedOption === currentQ.correctAnswer
                      ? '✨ Correct Match! (+20 Points)'
                      : `Nice try! The best match is "${currentQ.correctAnswer}".`}
                  </p>
                  <p className="text-gray-600">{currentQ.explanation}</p>
                </div>
              </div>
            )}

            {/* Next / Submit Button */}
            {isAnswered && (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer animate-fade-in"
              >
                <span>
                  {currentIndex < GAME_QUESTIONS.length - 1 ? 'Next Question' : 'See Your Results & Rewards'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* ================= 3. RESULTS & REWARD SCREEN ================= */}
        {gameState === 'results' && (
          <div className="bg-white rounded-3xl border border-emerald-100 shadow-md p-6 sm:p-9 text-center animate-fade-in">
            {score >= 60 && <ConfettiCanvas />}

            {/* Score Trophy */}
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-4 text-4xl shadow-sm">
              {score >= 80 ? '🏆' : score >= 60 ? '🎉' : '🌱'}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-1">
              {score >= 60 ? 'Congratulations!' : 'Nice Effort!'}
            </h2>
            <p className="text-sm font-semibold text-emerald-700 mb-4">
              {score >= 60
                ? 'You unlocked your exclusive ReLoop Demo Reward Card!'
                : 'Keep practicing circular economy principles!'}
            </p>

            {/* Score Summary Box */}
            <div className="inline-flex items-center gap-6 p-4 rounded-2xl bg-gray-50 border border-gray-200/80 mb-6">
              <div>
                <span className="text-xs text-gray-500 font-semibold block">Total Score</span>
                <span className="text-2xl font-black text-gray-900">{score} / 100</span>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div>
                <span className="text-xs text-gray-500 font-semibold block">Correct Matches</span>
                <span className="text-2xl font-black text-emerald-600">{correctCount} of 5</span>
              </div>
            </div>

            {/* ---------------- A. SCORE >= 60: REWARD UNLOCKED ---------------- */}
            {score >= 60 ? (
              <div className="space-y-6">
                <p className="text-xs text-gray-600 max-w-md mx-auto">
                  Scratch or tap the card below to reveal your Google Pay / Paytm-style discount code!
                </p>

                {/* Scratch Card Component */}
                <ScratchCard
                  isRevealed={isCardScratched}
                  onReveal={() => setIsCardScratched(true)}
                >
                  <div className="p-6 bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 text-white text-left relative overflow-hidden">
                    {/* Background Sheen Elements */}
                    <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
                    <div className="absolute -left-6 -top-6 w-24 h-24 rounded-full bg-teal-400/20 pointer-events-none" />

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-sm">
                          ♻️
                        </span>
                        <span className="text-xs font-black tracking-wider uppercase">
                          ReLoop Rewards
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/30 text-emerald-100 border border-emerald-300/30">
                        Unlocked
                      </span>
                    </div>

                    <div className="my-3">
                      <span className="text-3xl sm:text-4xl font-black tracking-tight text-white block">
                        10% OFF
                      </span>
                      <span className="text-xs text-emerald-100 font-medium">
                        Circular Community Exchange Discount
                      </span>
                    </div>

                    {/* Coupon Code Container */}
                    <div className="mt-4 p-3 bg-black/25 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-emerald-200 uppercase tracking-widest block font-bold">
                          Coupon Code
                        </span>
                        <span className="font-mono text-base font-black tracking-wider text-white">
                          {rewardCode}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-emerald-900 font-black text-xs hover:bg-emerald-50 transition shadow-xs cursor-pointer shrink-0"
                      >
                        {copiedToast ? (
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

                    <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-[10px] text-emerald-200">
                      <span>Saved in My Rewards</span>
                      <span>Demo Reward • No Cash Value</span>
                    </div>
                  </div>
                </ScratchCard>

                {/* Helper buttons under scratch card */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-sm mx-auto">
                  <button
                    type="button"
                    onClick={() => setIsRedeemModalOpen(true)}
                    className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>How to Redeem Reward</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentView('rewards')}
                    className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold border border-gray-200 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Gift className="w-3.5 h-3.5 text-emerald-600" />
                    <span>View All Saved Rewards</span>
                  </button>
                </div>
              </div>
            ) : (
              /* ---------------- B. SCORE < 60: TRY AGAIN ---------------- */
              <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200 text-amber-950 mb-6 max-w-md mx-auto">
                <p className="text-xs sm:text-sm leading-relaxed mb-4">
                  Nice try! You scored <strong>{score}/100</strong>. Play again and score at least <strong>60 points</strong> to unlock your 10% OFF demo reward card!
                </p>
                <button
                  type="button"
                  onClick={handleStartGame}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 mx-auto cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Again</span>
                </button>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleStartGame}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Play Game Again</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onNavigateToExplore) {
                    onNavigateToExplore({ category: 'all' })
                  } else {
                    setCurrentView('explore')
                  }
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Explore Resources</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Redeem Information Modal */}
      <RedeemInfoModal
        isOpen={isRedeemModalOpen}
        onClose={() => setIsRedeemModalOpen(false)}
        code={rewardCode}
      />
    </div>
  )
}
