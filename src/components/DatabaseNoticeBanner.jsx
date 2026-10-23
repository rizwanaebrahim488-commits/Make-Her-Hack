import React, { useState, useEffect } from 'react'
import { checkDatabaseStatus } from '../lib/supabase'
import { Database, Copy, Check, ExternalLink, X, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react'

// Schema script import as text
import schemaText from '../../supabase_schema.sql?raw'

export default function DatabaseNoticeBanner() {
  const [status, setStatus] = useState({ checked: false, isReady: true, reason: '' })
  const [modalOpen, setModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [checking, setChecking] = useState(false)

  const verify = async () => {
    setChecking(true)
    const res = await checkDatabaseStatus()
    setStatus({ checked: true, isReady: res.isReady, reason: res.reason })
    setChecking(false)
  }

  useEffect(() => {
    verify()
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(schemaText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  // If database is already ready or hasn't finished checking, don't show the warning banner
  if (!status.checked || status.isReady) return null

  // Extract project ref from environment
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
  const projectRefMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)
  const projectRef = projectRefMatch ? projectRefMatch[1] : 'txxgrkcqqrkfxksfyddt'
  const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectRef}/sql/new`

  return (
    <>
      {/* Top Notice Banner */}
      <div className="bg-amber-500 text-amber-950 px-4 py-2 text-xs font-medium flex items-center justify-between border-b border-amber-600/20 shadow-xs z-50">
        <div className="flex items-center gap-2 max-w-4xl mx-auto overflow-hidden">
          <AlertTriangle className="w-4 h-4 text-amber-950 shrink-0" />
          <span className="truncate">
            <strong>Database Notice:</strong> Supabase tables (<code>profiles</code>, <code>resources</code>) need to be created. The app is saving your items locally so nothing is lost!
          </span>
          <button
            onClick={() => setModalOpen(true)}
            className="ml-2 underline font-bold hover:text-black shrink-0 cursor-pointer"
          >
            Fix in 1 Minute →
          </button>
        </div>
        <button
          onClick={() => setStatus((p) => ({ ...p, isReady: true }))}
          className="text-amber-950/70 hover:text-amber-950 p-1"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Migration Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Run Database Schema Migration</h3>
                  <p className="text-xs text-gray-500">Project: <span className="font-mono text-emerald-600">{projectRef}</span></p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 mb-5 leading-relaxed">
              Your Supabase project is connected, but the PostgreSQL tables (<code>profiles</code>, <code>resources</code>, <code>wishlists</code>, <code>messages</code>, <code>requests</code>) need to be created in your database.
            </p>

            <div className="space-y-3 mb-6">
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-900">Copy the Schema Script</p>
                  <p className="text-[11px] text-gray-500 mb-2">We generated the complete script for ReLoop tables, RLS security policies, and triggers.</p>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-gray-800 text-xs font-semibold border border-gray-300 shadow-xs transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-900">Paste in Supabase SQL Editor</p>
                  <p className="text-[11px] text-gray-500 mb-2">Open your project's SQL Editor, paste the copied script, and click "Run".</p>
                  <a
                    href={sqlEditorUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
                  >
                    <span>Open Supabase SQL Editor</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-900">Verify Connection</p>
                  <p className="text-[11px] text-gray-500 mb-2">Click verify once executed in Supabase to confirm tables are active.</p>
                  <button
                    onClick={verify}
                    disabled={checking}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-black text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
                    <span>{checking ? 'Checking tables...' : 'Verify Database Now'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-emerald-800 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>While waiting, all items, photos, and profiles you save in the app are stored safely in local resilient storage!</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
