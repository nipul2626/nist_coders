'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GradientBackgroundProps {
  className?: string
  children?: React.ReactNode
  variant?: 'default' | 'subtle' | 'hero'
}

export function GradientBackground({ 
  className, 
  children,
  variant = 'default'
}: GradientBackgroundProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Animated gradient mesh */}
      <div className="absolute inset-0 -z-10">
        {/* Primary gradient orb */}
        <motion.div
          animate={{
            x: [0, 100, 50, 0],
            y: [0, 50, 100, 0],
            scale: [1, 1.2, 1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className={cn(
            'absolute rounded-full blur-3xl',
            variant === 'hero' 
              ? 'w-[600px] h-[600px] -top-40 -left-40 bg-primary/30' 
              : variant === 'subtle'
              ? 'w-[400px] h-[400px] -top-20 -left-20 bg-primary/20'
              : 'w-[500px] h-[500px] -top-32 -left-32 bg-primary/25'
          )}
        />
        
        {/* Secondary gradient orb */}
        <motion.div
          animate={{
            x: [0, -50, -100, 0],
            y: [0, 100, 50, 0],
            scale: [1, 1.1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
          className={cn(
            'absolute rounded-full blur-3xl',
            variant === 'hero'
              ? 'w-[500px] h-[500px] top-1/2 -right-40 bg-accent/30'
              : variant === 'subtle'
              ? 'w-[300px] h-[300px] top-1/2 -right-20 bg-accent/20'
              : 'w-[400px] h-[400px] top-1/3 -right-32 bg-accent/25'
          )}
        />
        
        {/* Tertiary gradient orb */}
        <motion.div
          animate={{
            x: [0, 80, 0, -80, 0],
            y: [0, -50, -100, -50, 0],
            scale: [1, 1.3, 1, 1.3, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
          className={cn(
            'absolute rounded-full blur-3xl',
            variant === 'hero'
              ? 'w-[400px] h-[400px] -bottom-40 left-1/3 bg-primary/20'
              : variant === 'subtle'
              ? 'w-[250px] h-[250px] -bottom-20 left-1/3 bg-primary/15'
              : 'w-[350px] h-[350px] -bottom-32 left-1/4 bg-primary/20'
          )}
        />

        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>
      
      {children}
    </div>
  )
}
