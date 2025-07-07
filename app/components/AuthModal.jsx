'use client'

import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

export default function AuthModal({ isOpen, onClose, mode = 'signin' }) {
  const [authMode, setAuthMode] = useState(mode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otpToken, setOtpToken] = useState('')
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const { signIn, signInWithOtp, verifyOtp, signUp, signUpWithOtp, resetPassword } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (authMode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) throw error
        onClose()
      } else if (authMode === 'signup') {
        if (showOtpInput) {
          // Verify OTP for signup
          const { error } = await verifyOtp(email, otpToken)
          if (error) throw error
          setMessage('Account created successfully! You can now sign in.')
          setAuthMode('signin')
          setShowOtpInput(false)
          setOtpToken('')
        } else {
          // Send OTP for signup
          const { error } = await signUpWithOtp(email, password)
          if (error) throw error
          setShowOtpInput(true)
          setMessage('Check your email for the OTP code to complete registration!')
        }
      } else if (authMode === 'reset') {
        const { error } = await resetPassword(email)
        if (error) throw error
        setMessage('Password reset email sent!')
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="neuro-card p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            {authMode === 'signin' && 'Sign In'}
            {authMode === 'signup' && 'Sign Up'}
            {authMode === 'reset' && 'Reset Password'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-900/50 border border-green-500 rounded-lg">
            <p className="text-green-200 text-sm">{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="neuro-input w-full"
              required
              disabled={showOtpInput}
            />
          </div>

          {authMode === 'signin' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="neuro-input w-full"
                required
              />
            </div>
          )}

          {authMode === 'signup' && !showOtpInput && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="neuro-input w-full"
                required
                minLength={6}
              />
            </div>
          )}

          {authMode === 'signup' && showOtpInput && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                OTP Code
              </label>
              <input
                type="text"
                value={otpToken}
                onChange={(e) => setOtpToken(e.target.value)}
                className="neuro-input w-full"
                placeholder="Enter the 6-digit code from your email"
                required
                maxLength={6}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="neuro-btn neuro-btn-primary w-full"
          >
            {loading ? 'Loading...' : 
              authMode === 'signin' ? 'Sign In' :
              authMode === 'signup' ? (showOtpInput ? 'Verify OTP' : 'Send OTP') :
              'Send Reset Email'
            }
          </button>
        </form>

        <div className="mt-4 text-center space-y-2">
          {authMode === 'signin' && (
            <>
              <button
                onClick={() => setAuthMode('signup')}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Don't have an account? Sign up
              </button>
              <br />
              <button
                onClick={() => setAuthMode('reset')}
                className="text-gray-400 hover:text-gray-300 text-sm"
              >
                Forgot your password?
              </button>
            </>
          )}

          {authMode === 'signup' && showOtpInput && (
            <>
              <button
                onClick={() => {
                  setShowOtpInput(false)
                  setOtpToken('')
                  setMessage('')
                }}
                className="text-gray-400 hover:text-gray-300 text-sm"
              >
                Use different email
              </button>
              <br />
              <button
                onClick={async () => {
                  setLoading(true)
                  setError('')
                  try {
                    const { error } = await signUpWithOtp(email, password)
                    if (error) throw error
                    setMessage('New OTP code sent!')
                  } catch (error) {
                    setError(error.message)
                  } finally {
                    setLoading(false)
                  }
                }}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Resend OTP code
              </button>
            </>
          )}

          {authMode === 'signup' && (
            <button
              onClick={() => setAuthMode('signin')}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Already have an account? Sign in
            </button>
          )}

          {authMode === 'reset' && (
            <button
              onClick={() => setAuthMode('signin')}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 