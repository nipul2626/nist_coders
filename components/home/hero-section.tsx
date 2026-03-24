'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Search, Sparkles, ArrowRight } from 'lucide-react'
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card'
import { GradientBackground } from '@/components/animations/gradient-background'
import { FloatingElements } from '@/components/animations/floating-elements'

const ctaCards = [
  {
    title: 'Create Event',
    description: 'Launch your hackathon, workshop, or tech fest with AI-powered tools',
    icon: Calendar,
    href: '/create',
    gradient: 'from-primary to-accent',
  },
  {
    title: 'Browse Events',
    description: 'Discover exciting events at your university and beyond',
    icon: Search,
    href: '/events',
    gradient: 'from-accent to-primary',
  },
]

export function HeroSection() {
  return (
    <GradientBackground variant="hero" className="min-h-screen flex items-center justify-center pt-16">
      <FloatingElements count={8} />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Event Management</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance"
          >
            Event Management,{' '}
            <span className="gradient-text">Reimagined</span>{' '}
            for Students
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto text-pretty"
          >
            Create stunning events, manage registrations effortlessly, and engage your audience 
            with AI-powered tools, real-time analytics, and beautiful experiences.
          </motion.p>

          {/* CTA Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto"
          >
            {ctaCards.map((card, index) => (
              <Link key={card.title} href={card.href}>
                <GlassmorphicCard className="h-full text-left group">
                  <div className="flex flex-col h-full">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        delay: index * 0.3,
                        ease: 'easeInOut'
                      }}
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4`}
                    >
                      <card.icon className="h-6 w-6 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-1">
                      {card.description}
                    </p>
                    <div className="flex items-center text-primary text-sm font-medium">
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </GlassmorphicCard>
              </Link>
            ))}
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-8 text-muted-foreground"
          >
            <span className="text-sm">Trusted by students from</span>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {['IIT Delhi', 'NIT Trichy', 'BITS Pilani', 'VIT'].map((college) => (
                <span key={college} className="text-sm font-medium text-foreground/60">
                  {college}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </GradientBackground>
  )
}
