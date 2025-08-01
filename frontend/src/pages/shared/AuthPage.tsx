import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { DemoCredentials } from '../../components/DemoCredentials'
import { DemoSignIn } from '../../components/DemoSignIn'
import { SimpleClerkAuth } from '../../components/SimpleClerkAuth'
import { LoadingSpinner } from '../../components/shared/LoadingSpinner'
import { useAuthModeFallback } from '../../components/AuthModeFallback'
import { ClerkSetupGuide } from '../../components/ClerkSetupGuide'
import { ClerkKeyValidator } from '../../components/ClerkKeyValidator'
import { DemoModeSelector } from '../../components/DemoModeSelector'

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const { isSignedIn, isLoaded } = useAuth()
  const navigate = useNavigate()
  const shouldFallbackToDemo = useAuthModeFallback()
  
  // Check if Clerk key exists (let Clerk validate it)
  const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || ''
  const hasClerkKey = !!clerkKey
  
  // Check URL params for demo mode override
  const urlParams = new URLSearchParams(window.location.search)
  const forceDemoMode = urlParams.get('demo') === 'true'
  
  // Check if we're in demo mode
  const isDemoMode = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true' || shouldFallbackToDemo || forceDemoMode
  
  // For real deployment, force OAuth mode when we have a key
  const [showDemoLogin, setShowDemoLogin] = useState(false)
  const [showDemoSelector, setShowDemoSelector] = useState(false)
  
  // Debug logging (moved after all variables are defined)
  useEffect(() => {
    console.log('Auth Page Debug:', {
      clerkKey: clerkKey ? clerkKey.substring(0, 40) + '...' : 'No key',
      hasClerkKey,
      isDemoMode,
      showDemoLogin,
      VITE_ENABLE_MOCK_DATA: import.meta.env.VITE_ENABLE_MOCK_DATA,
      forceDemoMode,
      shouldFallbackToDemo
    })
  }, [clerkKey, hasClerkKey, isDemoMode, showDemoLogin])
  
  // Redirect if already signed in with Clerk
  useEffect(() => {
    if (isLoaded && isSignedIn && !isDemoMode) {
      navigate('/', { replace: true })
    }
  }, [isLoaded, isSignedIn, isDemoMode, navigate])
  
  // Show loading while Clerk is initializing
  if (!isDemoMode && !isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading authentication..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className={`${isDemoMode && showDemoLogin ? 'max-w-5xl' : 'max-w-md'} w-full`}>
        <div className={`${isDemoMode && showDemoLogin ? 'grid grid-cols-1 lg:grid-cols-2 gap-8 items-start' : 'space-y-8'}`}>
          <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">R</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Employee Rewards
          </h2>
          <p className="mt-2 text-gray-600">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        {/* Key Validator (only show in dev mode or when debugging) */}
        {(import.meta.env.DEV || !hasClerkKey) && (
          <ClerkKeyValidator />
        )}

        {/* Auth Component - Prioritize OAuth when key exists */}
        {showDemoSelector ? (
          <DemoModeSelector />
        ) : hasClerkKey && !showDemoLogin ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <SimpleClerkAuth mode={isSignUp ? 'signup' : 'signin'} />
          </div>
        ) : showDemoLogin ? (
          <DemoSignIn />
        ) : (
          <>
            <ClerkSetupGuide />
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Are you seeing this in production?</strong> You need to set the VITE_CLERK_PUBLISHABLE_KEY 
                environment variable in Netlify. See NETLIFY_ENV_SETUP.md for instructions.
              </p>
            </div>
          </>
        )}
        
        {/* Demo Mode Options - Show demo selector for easy access */}
        {!showDemoSelector && hasClerkKey && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowDemoSelector(true)}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              View demo mode →
            </button>
          </div>
        )}
        
        {/* Back button when in demo selector */}
        {showDemoSelector && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowDemoSelector(false)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium underline"
            >
              ← Back to sign in
            </button>
          </div>
        )}
        
        {/* Demo Mode Options - Only show if no Clerk key or explicitly in demo mode */}
        {!showDemoSelector && (!hasClerkKey || isDemoMode) && (
          <div className="mt-4 space-y-3">
            <div className="text-center">
              <button
                onClick={() => setShowDemoLogin(!showDemoLogin)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium underline"
              >
                {showDemoLogin ? 'Use regular sign in' : 'Use demo accounts'}
              </button>
            </div>
          </div>
        )}
        
        {!isDemoMode && showDemoLogin && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-700 text-center">
              🔐 Regular authentication is available. Click "Use regular sign in" above.
            </p>
          </div>
        )}
        
        {shouldFallbackToDemo && (
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <p className="text-sm text-yellow-700 text-center">
              ⚠️ Authentication service is experiencing issues. Using demo mode as fallback.
            </p>
          </div>
        )}

        {/* Toggle - Only show when not using demo login or selector */}
        {!showDemoLogin && !showDemoSelector && (
          <div className="text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        )}
        
        {/* Setup Guide for invalid Clerk configuration */}
        {!showDemoLogin && !hasClerkKey && (
          <ClerkSetupGuide />
        )}
          </div>
          
          {/* Demo Credentials (only shown in demo mode) */}
          {isDemoMode && showDemoLogin && (
            <div className="lg:mt-0">
              <DemoCredentials />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}