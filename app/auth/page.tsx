'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Confetti from 'react-confetti'
import { Check } from 'lucide-react'
import { LoginForm } from '@/components/auth/login-form'
import { SignupForm } from '@/components/auth/signup-form'
import { GradientBackground } from '@/components/animations/gradient-background'
import { FloatingElements } from '@/components/animations/floating-elements'
import type { LoginFormData, SignupFormData } from '@/lib/types'
import { toast } from 'sonner'

function AuthContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const modeParam = searchParams.get('mode')
    if (modeParam === 'signup') {
      setMode('signup')
    } else {
      setMode('login')
    }
  }, [searchParams])

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })
  }, [])

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsLoading(false)
    toast.success('Welcome back!')
    router.push('/events')
  }

  const handleSignup = async (data: SignupFormData) => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsLoading(false)
    setShowSuccess(true)
    setShowConfetti(true)
    
    // Redirect after 2 seconds
    //this redirect to events in 2 sec
  
    setTimeout(() => {
      router.push('/events')
    }, 2500)
  }

  return (
    <GradientBackground className="min-h-screen flex items-center justify-center p-4" variant="subtle">
      <FloatingElements count={6} />
      
      {/* Confetti Effect */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.2}
        />
      )}
      
      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="bg-card p-8 rounded-2xl border border-border text-center max-w-sm"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center"
              >
                <motion.div
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <Check className="h-10 w-10 text-success" />
                </motion.div>
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl font-bold mb-2"
              > 
                Account Created!
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-muted-foreground"
              >
                Welcome to EventFlex. Redirecting you...
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center"
          >
            <span className="text-primary-foreground font-bold text-xl">E</span>
          </motion.div>
          <span className="text-2xl font-bold gradient-text">EventFlex</span>
        </Link>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-8"
        >
          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <LoginForm
                key="login"
                onSubmit={handleLogin}
                onSwitchToSignup={() => setMode('signup')}
                isLoading={isLoading}
              />
            ) : (
              <SignupForm
                key="signup"
                onSubmit={handleSignup}
                onSwitchToLogin={() => setMode('login')}
                isLoading={isLoading}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Terms */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </GradientBackground>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  )
}
