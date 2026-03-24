'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Plus, Search, Frown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  type?: 'no-results' | 'no-events' | 'no-registrations'
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  className?: string
}

const defaultContent = {
  'no-results': {
    title: 'No events found',
    description: 'Try adjusting your filters or search terms to find what you are looking for.',
    actionLabel: 'Clear filters',
    icon: Search,
  },
  'no-events': {
    title: 'No events yet',
    description: 'Be the first to create an event and start gathering your community!',
    actionLabel: 'Create Event',
    icon: Calendar,
  },
  'no-registrations': {
    title: 'No registrations yet',
    description: 'Discover amazing events and register to participate.',
    actionLabel: 'Browse Events',
    icon: Calendar,
  },
}

export function EmptyState({
  type = 'no-results',
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: EmptyStateProps) {
  const content = defaultContent[type]
  const Icon = content.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6"
      >
        <Frown className="h-10 w-10 text-muted-foreground" />
      </motion.div>
      
      <h3 className="text-xl font-semibold mb-2">
        {title || content.title}
      </h3>
      
      <p className="text-muted-foreground max-w-md mb-6">
        {description || content.description}
      </p>
      
      {actionHref && (
        <Button asChild className="gradient-primary text-primary-foreground border-0">
          <Link href={actionHref}>
            <Plus className="h-4 w-4 mr-2" />
            {actionLabel || content.actionLabel}
          </Link>
        </Button>
      )}
    </motion.div>
  )
}
