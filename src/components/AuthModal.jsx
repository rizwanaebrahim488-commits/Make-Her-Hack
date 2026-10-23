import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  RotateCw,
  Info,
} from 'lucide-react'

export default function AuthModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authMode,
    setAuthMode,
    signIn,
    signUp,
    signInWithGoogle,
    resendVerificationEmail,
    signInAsGuest,
  } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSentTo, setEmailSentTo] = useState(null)
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  if (!isAuthModalOpen) return null

  const isValidEmail = (val) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(val)
  }

  const handleClose = () => {
    setIsAuthModalOpen(false)
    setError('')
    setEmailSentTo(null)
    setResendSuccess(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResendSuccess(false)

    if (authMode === 'signup') {
      if (!fullName.trim()) {
        setError('Please enter your full name')
        return
      }
      if (!email.trim()) {
        setError('Please enter your email')
        return
      }
      if (!isValidEmail(email.trim())) {
        setError('Please enter a valid email address')
        return
      }
      if (!password) {
        setError('Please enter a password')
        return
      }
    } else {
      if (!email.trim()) {
        setError('Please enter your email')
        return
      }
      if (!isValidEmail(email.trim())) {
        setError('Please enter a valid email address')
        return
      }
      if (!password) {
        setError('Please enter your password')
        return
      }
    }

    setLoading(true)

    try {
      if (authMode === 'signup') {
        const res = await signUp(fullName.trim(), email.trim(), password)
        if (res?.needsEmailConfirmation) {
          setEmailSentTo(email.trim())
        }
      } else {
        await signIn(email.trim(), password)
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!emailSentTo) return
    setResending(true)
    setError('')
    try {
      await resendVerificationEmail(emailSentTo)
      setResendSuccess(true)
    } catch (err) {
      setError(err.message || 'Failed to resend verification email.')
    } finally {
      setResending(false)
    }
  }

  const handleGoogleAuth = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message || 'Google sign in failed')
      setLoading(false)
    }
  }

  const handleGuestLogin = () => {
    signInAsGuest(fullName || 'ReLoop Guest')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-emerald-100 p-6 sm:p-8 overflow-y-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Back / Close Button */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold border border-gray-200 transition"
            aria-label="Back"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
            ♻️ ReLoop
          </span>
        </div>

        {/* ----------------- EMAIL CONFIRMATION SCREEN ----------------- */}
        {emailSentTo ? (
          <div className="text-center py-2 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 shadow-sm border border-emerald-200">
              <Mail className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-gray-900 mb-2">
              Check your inbox!
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-4 leading-relaxed">
              We sent a verification link to{' '}
              <strong className="text-gray-900 font-semibold">{emailSentTo}</strong>.
              Click the link to activate your account.
            </p>

            {/* Email link note / Site cannot be reached explanation */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-left text-xs text-emerald-900 mb-5">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Automatic Redirection Configured</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                    Once clicked, the email link will safely bring you back to this ReLoop website and log you in automatically.
                  </p>
                </div>
              </div>
            </div>

            {/* In case user had "site can't be reached" previously with default localhost */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-left text-[11px] text-amber-900 mb-5">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800">
                    Did your previous link say "Site can't be reached"?
                  </p>
                  <p className="text-[10.5px] text-amber-700 mt-0.5 leading-relaxed">
                    That happens when confirmation links point to <code className="bg-amber-100 px-1 rounded">localhost</code>. Our system now directs your confirmation right to this GitHub Pages site.
                  </p>
                </div>
              </div>
            </div>

            {resendSuccess && (
              <div className="mb-4 p-2.5 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-medium">
                Verification email sent again! Please check your spam folder too.
              </div>
            )}

            {error && (
              <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-700 font-bold text-xs transition"
              >
                <RotateCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                <span>{resending ? 'Resending email...' : 'Resend Verification Email'}</span>
              </button>

              <button
                type="button"
                onClick={handleGuestLogin}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
              >
                Continue into ReLoop as Guest
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmailSentTo(null)
                  setAuthMode('signin')
                }}
                className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition"
              >
                Already confirmed? Sign In
              </button>
            </div>
          </div>
        ) : (
          /* ----------------- STANDARD AUTH FORM ----------------- */
          <>
            {/* Brand Header */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2.5 border border-emerald-200/60">
                <Sparkles className="w-3.5 h-3.5" />
                Give. Reuse. Repeat. ♻️
              </div>

              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-black tracking-tight text-gray-900">
                  Re<span className="text-emerald-600">Loop</span>
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mt-1.5">
                {authMode === 'signin' ? 'Sign In to ReLoop' : 'Create your ReLoop account'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {authMode === 'signin'
                  ? 'Join ReLoop to connect with people and give things a second life.'
                  : 'Join the community and give things a second life.'}
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-2xl border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs sm:text-sm transition shadow-2xs disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Continue with Google
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-400">or continue with email</span>
              </div>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-3 flex-1">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aiswarya S."
                      className="w-full pl-10 pr-4 py-2 bg-gray-50/80 border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2 bg-gray-50/80 border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 bg-gray-50/80 border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
              >
                {loading ? 'Please wait...' : authMode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {/* Fast Guest Option */}
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={handleGuestLogin}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Or explore instantly as Guest ✨
              </button>
            </div>

            {/* Mode Switch */}
            <div className="mt-3 text-center text-xs text-gray-500 border-t border-gray-100 pt-3">
              {authMode === 'signin' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup')
                      setError('')
                    }}
                    className="font-bold text-emerald-600 hover:text-emerald-700 underline"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signin')
                      setError('')
                    }}
                    className="font-bold text-emerald-600 hover:text-emerald-700 underline"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>

            <p className="mt-2 text-center text-[10px] text-gray-400">
              By continuing, you agree to our{' '}
              <a href="#" className="text-emerald-600 hover:underline">Terms</a>{' '}
              &{' '}
              <a href="#" className="text-emerald-600 hover:underline">Privacy Policy</a>.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
