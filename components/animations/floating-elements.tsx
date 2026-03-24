'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FloatingElementsProps {
  className?: string
  count?: number
}

export function FloatingElements({ className, count = 6 }: FloatingElementsProps) {
  const elements = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 60 + 20,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 5,
    shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)],
  }))

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {elements.map((el) => (
        <motion.div
          key={el.id}
          initial={{ 
            x: `${el.x}%`, 
            y: `${el.y}%`,
            opacity: 0,
          }}
          animate={{
            y: [`${el.y}%`, `${el.y - 20}%`, `${el.y}%`],
            opacity: [0.1, 0.3, 0.1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: el.duration,
            repeat: Infinity,
            delay: el.delay,
            ease: 'linear',
          }}
          className={cn(
            'absolute opacity-10',
            el.shape === 'circle' && 'rounded-full bg-primary/30',
            el.shape === 'square' && 'rounded-lg bg-accent/30 rotate-45',
            el.shape === 'triangle' && 'border-l-[15px] border-r-[15px] border-b-[26px] border-l-transparent border-r-transparent border-b-primary/30 bg-transparent'
          )}
          style={{
            width: el.shape === 'triangle' ? 0 : el.size,
            height: el.shape === 'triangle' ? 0 : el.size,
            left: `${el.x}%`,
          }}
        />
      ))}
    </div>
  )
}
