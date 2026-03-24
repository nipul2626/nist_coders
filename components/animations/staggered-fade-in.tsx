'use client'

import { motion, Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StaggeredFadeInProps {
  children: React.ReactNode
  className?: string
  delay?: number
  staggerDelay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

export function StaggeredFadeIn({
  children,
  className,
  delay = 0,
  staggerDelay = 0.1,
  duration = 0.5,
  direction = 'up',
}: StaggeredFadeInProps) {
  const getDirectionOffset = () => {
    switch (direction) {
      case 'up': return { y: 30 }
      case 'down': return { y: -30 }
      case 'left': return { x: 30 }
      case 'right': return { x: -30 }
      default: return { y: 30 }
    }
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}

interface StaggeredItemProps {
  children: React.ReactNode
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right'
}

export function StaggeredItem({ 
  children, 
  className,
  direction = 'up'
}: StaggeredItemProps) {
  const getOffset = () => {
    switch (direction) {
      case 'up': return { y: 30 }
      case 'down': return { y: -30 }
      case 'left': return { x: 30 }
      case 'right': return { x: -30 }
      default: return { y: 30 }
    }
  }

  return (
    <motion.div
      variants={{
        hidden: { 
          opacity: 0, 
          ...getOffset()
        },
        visible: { 
          opacity: 1, 
          y: 0,
          x: 0,
          transition: {
            duration: 0.5,
            ease: 'easeOut',
          }
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
