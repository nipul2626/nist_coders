'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CountdownTimerProps {
  targetDate: Date
  className?: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function CountdownTimer({ targetDate, className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isExpired, setIsExpired] = useState(false)
  const [prevTime, setPrevTime] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime()
      
      if (difference <= 0) {
        setIsExpired(true)
        return { days: 0, hours: 0, minutes: 0, seconds: 0 }
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }

    const timer = setInterval(() => {
      setPrevTime(timeLeft)
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    setTimeLeft(calculateTimeLeft())

    return () => clearInterval(timer)
  }, [targetDate, timeLeft])

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 24

  if (isExpired) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-success/20 text-success',
          className
        )}
      >
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span className="font-semibold">Event Started</span>
      </motion.div>
    )
  }

  const timeUnits = [
    { label: 'Days', value: timeLeft.days, prev: prevTime.days },
    { label: 'Hours', value: timeLeft.hours, prev: prevTime.hours },
    { label: 'Minutes', value: timeLeft.minutes, prev: prevTime.minutes },
    { label: 'Seconds', value: timeLeft.seconds, prev: prevTime.seconds },
  ]

  return (
    <div className={cn('flex gap-3', className)}>
      {timeUnits.map((unit) => (
        <div
          key={unit.label}
          className={cn(
            'flex flex-col items-center',
            isUrgent && 'text-destructive'
          )}
        >
          <div
            className={cn(
              'relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-card border border-border flex items-center justify-center overflow-hidden',
              isUrgent && 'border-destructive/50 animate-pulse'
            )}
          >
            <motion.span
              key={unit.value}
              initial={{ y: unit.value !== unit.prev ? -20 : 0, opacity: unit.value !== unit.prev ? 0 : 1 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-2xl sm:text-3xl font-bold tabular-nums"
            >
              {String(unit.value).padStart(2, '0')}
            </motion.span>
          </div>
          <span className="text-xs text-muted-foreground mt-2">{unit.label}</span>
        </div>
      ))}
    </div>
  )
}
