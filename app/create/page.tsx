'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'
import { Check, Calendar, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CreateEventWizard } from '@/components/events/create-event-wizard'
import { GradientBackground } from '@/components/animations/gradient-background'
import type { CreateEventFormData } from '@/lib/types'
import Link from 'next/link'

export default function CreateEventPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [createdEventId, setCreatedEventId] = useState<string | null>(null)

  const handleSubmit = async (data: CreateEventFormData) => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsLoading(false)
    setShowSuccess(true)
    setShowConfetti(true)
    setCreatedEventId('new-event-123')
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Confetti Effect */}
      {showConfetti && (
        <Confetti
          width={typeof window !== 'undefined' ? window.innerWidth : 1200}
          height={typeof window !== 'undefined' ? window.innerHeight : 800}
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
              className="bg-card p-8 rounded-2xl border border-border text-center max-w-md mx-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full gradient-primary flex items-center justify-center"
              >
                <Check className="h-10 w-10 text-primary-foreground" />
              </motion.div>
              
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold mb-2"
              >
                Event Created!
              </motion.h3>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground mb-6"
              >
                Your event has been created successfully. Start promoting it to get registrations!
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Button
                  asChild
                  className="flex-1 gradient-primary text-primary-foreground border-0"
                >
                  <Link href={`/events/${createdEventId}`}>
                    View Event
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSuccess(false)
                    setShowConfetti(false)
                  }}
                  className="flex-1"
                >
                  Create Another
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <GradientBackground variant="subtle" className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Create Event</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Create Your <span className="gradient-text">Amazing Event</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Set up your hackathon, workshop, or tech fest in minutes with our easy-to-use 
              event creation wizard.
            </p>
          </motion.div>
        </div>
      </GradientBackground>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 sm:p-8"
          >
            <CreateEventWizard onSubmit={handleSubmit} isLoading={isLoading} />
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
