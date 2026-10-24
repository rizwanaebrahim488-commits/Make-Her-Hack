/**
 * ReLoop Eco-Points & Living Eco-Tree Progression System
 * Handles transaction-based scoring, tree visual stages, milestone unlocks, and reward persistence.
 * Exclusively driven by real platform transactions (giving, exchanging, sharing). No trivia or mini-games.
 */

import { supabase } from './supabase'

// Point values awarded per real platform activity (Transactions only)
export const POINT_RULES = {
  POST_FREE_ITEM: {
    points: 50,
    label: 'Gave a Resource / Item (Free)',
    icon: '🎁',
    description: 'Shared an unused item with the local community for free'
  },
  // Backward compatibility alias for POST_FREE_ITEM
  POST_ITEM: {
    points: 50,
    label: 'Gave a Resource / Item (Free)',
    icon: '🎁',
    description: 'Shared an unused item with the local community for free'
  },
  COMPLETE_EXCHANGE_OR_RESALE: {
    points: 40,
    label: 'Exchange or Resell Item',
    icon: '🏷️',
    description: 'Listed an item for community exchange or affordable resale'
  },
  COMPLETE_EXCHANGE: {
    points: 40,
    label: 'Completed Circular Exchange',
    icon: '🤝',
    description: 'Successfully handed over or completed a resource exchange'
  },
  POST_REQUEST_OR_DISPOSAL: {
    points: 20,
    label: 'Shared Request or Disposal Info',
    icon: '♻️',
    description: 'Posted a community request or recycling center information'
  }
}

// Living Eco-Tree Growth Stages (5 Visual Levels)
export const TREE_STAGES = [
  {
    level: 1,
    min: 0,
    max: 100,
    title: 'Sprout',
    subtitle: 'Seedling Stage',
    icon: '🌱',
    theme: 'lime',
    bgGradient: 'from-lime-500/20 via-emerald-500/10 to-teal-500/20',
    accentColor: 'text-lime-600',
    barColor: 'bg-lime-500',
    description: 'Your circular journey has just begun! A tiny green shoot searching for sunlight.',
    nextStageLabel: 'Sapling 🌿',
    unlockNote: 'Reach 101 pts to grow into a Sapling'
  },
  {
    level: 2,
    min: 101,
    max: 300,
    title: 'Growing Sapling',
    subtitle: 'Sapling Stage',
    icon: '🌿',
    theme: 'emerald',
    bgGradient: 'from-emerald-500/20 via-teal-500/15 to-green-600/20',
    accentColor: 'text-emerald-600',
    barColor: 'bg-emerald-500',
    description: 'Gaining strength with every item given and exchange completed.',
    nextStageLabel: 'Healthy Tree 🌳',
    unlockNote: 'Reach 301 pts to become a Healthy Eco-Tree'
  },
  {
    level: 3,
    min: 301,
    max: 600,
    title: 'Healthy Eco-Tree',
    subtitle: 'Established Tree Stage',
    icon: '🌳',
    theme: 'teal',
    bgGradient: 'from-teal-500/20 via-emerald-600/15 to-cyan-600/20',
    accentColor: 'text-teal-600',
    barColor: 'bg-teal-500',
    description: 'Deep roots in the community! Actively reducing waste and keeping goods in circulation.',
    nextStageLabel: 'Bloom 🌸',
    unlockNote: 'Reach 601 pts to Bloom'
  },
  {
    level: 4,
    min: 601,
    max: 1000,
    title: 'Blooming Eco-Tree',
    subtitle: 'Flowering Stage',
    icon: '🌸',
    theme: 'pink',
    bgGradient: 'from-pink-500/20 via-rose-500/15 to-emerald-500/20',
    accentColor: 'text-pink-600',
    barColor: 'bg-gradient-to-r from-pink-500 to-rose-400',
    description: 'Flowering blossoms of eco impact! A beloved community champion of reuse.',
    nextStageLabel: 'Community Forest 🍎',
    unlockNote: 'Reach 1001 pts to achieve Fruitful Forest status'
  },
  {
    level: 5,
    min: 1001,
    max: Infinity,
    title: 'Fruitful Community Forest',
    subtitle: 'Golden Forest Guardian',
    icon: '🍎',
    theme: 'amber',
    bgGradient: 'from-amber-500/25 via-yellow-500/20 to-emerald-600/25',
    accentColor: 'text-amber-600',
    barColor: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-500',
    description: 'A thriving circular ecosystem! Inspiring neighbors and diverting hundreds of kilograms from landfills.',
    nextStageLabel: 'Max Level Champion 🌟',
    unlockNote: 'Golden Verified Community Badge Unlocked'
  }
]

// Milestone definitions for Google Pay / Paytm style digital reward cards
export const MILESTONES = [
  {
    points: 200,
    title: '🌿 Growing Sapling Milestone Reward',
    discount: '10% OFF',
    desc: 'Special reward for nurturing your Eco-Tree to 200 pts with circular exchanges!',
    codePrefix: 'ECO-TREE'
  },
  {
    points: 500,
    title: '🌳 Healthy Eco-Tree Milestone Reward',
    discount: '15% OFF',
    desc: 'Generous community discount for reaching Healthy Tree stage (500 pts)!',
    codePrefix: 'ECO-TREE'
  },
  {
    points: 1000,
    title: '🍎 Fruitful Community Forest Milestone Reward',
    discount: '25% OFF',
    desc: 'Top-tier sustainable patron reward & Golden Community Verified Status!',
    codePrefix: 'ECO-FOREST'
  }
]

const LOCAL_POINTS_KEY = 'reloop_eco_points'
const LOCAL_HISTORY_KEY = 'reloop_eco_history'
const LOCAL_CLAIMED_MILESTONES_KEY = 'reloop_claimed_milestones'
const LOCAL_REWARDS_KEY = 'reloop_rewards'

/**
 * Generate a realistic unique coupon code like ECO-TREE-9X2P
 */
export function generateMilestoneCode(prefix = 'ECO-TREE') {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  let part = ''
  for (let i = 0; i < 4; i++) {
    part += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `${prefix}-${part}`
}

/**
 * Retrieve current user's Eco-Points
 */
export function getEcoPoints() {
  try {
    const raw = localStorage.getItem(LOCAL_POINTS_KEY)
    if (raw !== null) {
      return Math.max(0, parseInt(raw, 10) || 0)
    }
    // Baseline starter points for a warm first-time experience
    const initialStarter = 50
    localStorage.setItem(LOCAL_POINTS_KEY, String(initialStarter))
    return initialStarter
  } catch (e) {
    return 50
  }
}

/**
 * Calculate the tree growth stage and progress based on score
 */
export function getTreeStage(points = 0) {
  const pts = Math.max(0, Number(points) || 0)
  const currentStage =
    TREE_STAGES.find((s) => pts >= s.min && pts <= s.max) || TREE_STAGES[0]

  const nextStage =
    TREE_STAGES.find((s) => s.level === currentStage.level + 1) || null

  let progressPercent = 100
  let pointsNeeded = 0
  let progressText = ''

  if (nextStage) {
    const rangeSpan = currentStage.max - currentStage.min + 1
    const pointsIntoStage = pts - currentStage.min
    progressPercent = Math.min(
      100,
      Math.max(0, Math.round((pointsIntoStage / rangeSpan) * 100))
    )
    pointsNeeded = currentStage.max + 1 - pts
    progressText = `${pts} / ${currentStage.max} pts to ${currentStage.nextStageLabel}`
  } else {
    progressPercent = 100
    pointsNeeded = 0
    progressText = `${pts} pts • Max Level Fruitful Community Forest 🍎 (Golden Verified 🌟)`
  }

  const isGoldenVerified = pts >= 1000

  return {
    ...currentStage,
    currentPoints: pts,
    nextStage,
    progressPercent,
    pointsNeeded,
    progressText,
    isGoldenVerified
  }
}

/**
 * Retrieve point activity history
 */
export function getEcoPointHistory() {
  try {
    const raw = localStorage.getItem(LOCAL_HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

/**
 * Retrieve saved rewards from localStorage
 */
export function getSavedRewards() {
  try {
    const raw = localStorage.getItem(LOCAL_REWARDS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

/**
 * Award Eco-Points for a transaction or circular platform activity
 */
export function awardEcoPoints(actionKey, customPoints = null, metadata = {}) {
  const rule = POINT_RULES[actionKey] || {
    points: customPoints || 20,
    label: metadata.label || 'Eco Community Action',
    icon: metadata.icon || '🌱',
    description: metadata.description || 'Contributed to circular sustainability'
  }

  const earned = customPoints !== null ? Number(customPoints) : rule.points
  if (earned <= 0) return { newTotal: getEcoPoints(), earned: 0 }

  const oldTotal = getEcoPoints()
  const oldStage = getTreeStage(oldTotal)

  const newTotal = oldTotal + earned
  localStorage.setItem(LOCAL_POINTS_KEY, String(newTotal))

  // Append to activity history
  const historyItem = {
    id: `eco-log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    action: actionKey,
    points: earned,
    label: rule.label,
    icon: rule.icon,
    details: metadata.details || rule.description,
    timestamp: new Date().toISOString()
  }

  try {
    const history = getEcoPointHistory()
    localStorage.setItem(
      LOCAL_HISTORY_KEY,
      JSON.stringify([historyItem, ...history.slice(0, 49)])
    )
  } catch (e) {
    console.warn('Failed to save history log:', e)
  }

  // Check for tree stage level-up
  const newStage = getTreeStage(newTotal)
  const leveledUp = newStage.level > oldStage.level

  // Check for newly unlocked milestone rewards (e.g. 200, 500, 1000 pts)
  let unlockedRewards = []
  try {
    const rawClaimed = localStorage.getItem(LOCAL_CLAIMED_MILESTONES_KEY)
    const claimedList = rawClaimed ? JSON.parse(rawClaimed) : []

    for (const ms of MILESTONES) {
      if (newTotal >= ms.points && !claimedList.includes(ms.points)) {
        // Unlock this milestone reward card
        const newReward = {
          id: `reward-ms-${ms.points}-${Date.now()}`,
          code: generateMilestoneCode(ms.codePrefix || 'ECO-TREE'),
          discount: ms.discount,
          title: ms.title,
          description: ms.desc,
          milestonePoints: ms.points,
          source: 'Living Eco-Tree Growth Milestone',
          label: 'Demo Reward — Not Valid for Real Purchases',
          date: new Date().toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          unlockedAt: new Date().toISOString(),
          timestamp: Date.now(),
          badge: 'Milestone Reward',
          isMilestone: true
        }

        // Save to rewards list
        const existingRewards = getSavedRewards()
        localStorage.setItem(
          LOCAL_REWARDS_KEY,
          JSON.stringify([newReward, ...existingRewards])
        )

        claimedList.push(ms.points)
        localStorage.setItem(
          LOCAL_CLAIMED_MILESTONES_KEY,
          JSON.stringify(claimedList)
        )

        unlockedRewards.push(newReward)
      }
    }
  } catch (e) {
    console.warn('Milestone processing error:', e)
  }

  // Sync with Supabase profiles if user is signed in
  if (supabase && metadata.userId) {
    try {
      supabase
        .from('profiles')
        .update({ eco_points: newTotal })
        .eq('id', metadata.userId)
        .then(() => {})
        .catch((err) => console.warn('Supabase points sync notice:', err))
    } catch (e) {
      // ignore
    }
  }

  // Global event dispatch for instantaneous UI updates
  try {
    window.dispatchEvent(
      new CustomEvent('reloop-points-awarded', {
        detail: {
          earned,
          newTotal,
          actionKey,
          label: rule.label,
          leveledUp,
          oldStage,
          newStage,
          unlockedRewards
        }
      })
    )

    if (unlockedRewards.length > 0) {
      window.dispatchEvent(
        new CustomEvent('reloop-milestone-unlocked', {
          detail: {
            reward: unlockedRewards[0],
            newTotal,
            newStage
          }
        })
      )
    }
  } catch (e) {
    // ignore
  }

  return {
    newTotal,
    earned,
    leveledUp,
    newStage,
    unlockedRewards
  }
}
