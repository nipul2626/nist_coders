'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useInView, animate } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CountUpProps {
  target: number
  duration?: number
  suffix?: string
  prefix?: string
  className?: string
  decimals?: number
}

export function CountUp({ 
  target, 
  duration = 2, 
  suffix = '', 
  prefix = '',
  className,
  decimals = 0
}: CountUpProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true
      const controls = animate(0, target, {
        duration,
        ease: 'easeOut',
        onUpdate: (value) => {
          setCount(decimals > 0 ? parseFloat(value.toFixed(decimals)) : Math.floor(value))
        },
      })
      return () => controls.stop()
    }
  }, [isInView, target, duration, decimals])

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + 'K'
    }
    return num.toLocaleString()
  }

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className={cn('tabular-nums', className)}
    >
      {prefix}{formatNumber(count)}{suffix}
    </motion.span>
  )
}
