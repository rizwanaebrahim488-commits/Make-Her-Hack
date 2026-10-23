import React from 'react'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, HelpCircle, Sparkles, Package, MessageCircle, Clock, Mail } from 'lucide-react'
import AccountLayout from '../components/AccountLayout'

const FAQS = [
  {
    q: 'What is ReLoop?',
    a: 'ReLoop is a community platform for giving unused items a second life. You can list items you no longer need, request items from neighbors, and reuse instead of throwing away.',
  },
  {
    q: 'How do I give an item?',
    a: 'Sign in, then tap "Give an Item" to upload a photo and details. Your listing will appear in the Explore feed for the community to see.',
  },
  {
    q: 'How do I request a resource?',
    a: 'Open an item listing, tap Contact Giver, and send a message. The giver can accept your request and you can coordinate pickup through chat.',
  },
  {
    q: 'Is ReLoop free?',
    a: 'Yes. ReLoop is a free giving and reuse community. There is no buying or selling.',
  },
  {
    q: 'How does the wishlist work?',
    a: 'Save items you are interested in by tapping the heart on a listing. Your saved items appear in your Wishlist under My ReLoop.',
  },
  {
    q: 'How do I contact support?',
    a: 'Use the Help & Support section or reach out through the Contact option below.',
  },
]

export default function HelpSupportPage({ setCurrentView }) {
  return (
    <AccountLayout currentView="help" setCurrentView={setCurrentView} unreadCount={0}>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setCurrentView('settings')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-gray-100 text-gray-700 font-semibold text-sm border border-gray-200 shadow-xs transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Settings</span>
        </button>

        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-900">Help & Support</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Frequently asked questions about using ReLoop.
          </p>

          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <div className="px-4 py-3 cursor-pointer flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition">
                  <p className="text-sm font-semibold text-gray-800">{faq.q}</p>
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold flex items-center justify-center">
                    +
                  </span>
                </div>
                <div className="px-4 pb-3">
                  <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-gray-200 rounded-3xl bg-emerald-50 p-6 sm:p-8 border border-emerald-100">
            <div className="flex items-center gap-3 mb-3">
              <Mail className="w-4 h-4 text-emerald-600" />
              <p className="font-semibold text-gray-800">Need more help?</p>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Still have questions? We are here to help you navigate ReLoop.
            </p>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition inline-flex"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Support</span>
            </button>
          </div>
        </div>
      </div>
    </AccountLayout>
  )
}

