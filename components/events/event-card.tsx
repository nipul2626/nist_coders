'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Heart, 
  Clock,
  ArrowRight,
  Sparkles,
  TrendingUp
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Event } from '@/lib/types'

interface EventCardProps {
  event: Event
  index?: number
}

const categoryColors: Record<string, string> = {
  'hackathon': 'bg-primary/20 text-primary',
  'workshop': 'bg-accent/20 text-accent',
  'tech-fest': 'bg-success/20 text-success',
  'seminar': 'bg-info/20 text-info',
  'competition': 'bg-warning/20 text-warning',
}

export function EventCard({ event, index = 0 }: EventCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  const daysUntilEvent = Math.ceil(
    (new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )
  const isEndingSoon = daysUntilEvent <= 3 && daysUntilEvent > 0
  const isTrending = event.stats.totalRegistrations > 100

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group relative bg-card rounded-2xl border border-border overflow-hidden transition-shadow hover:shadow-xl hover:shadow-primary/5"
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        {!imageError ? (
          <Image
            src={event.bannerImage || '/placeholder.jpg'}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Calendar className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className={cn('font-medium', categoryColors[event.category])}>
            {event.category.replace('-', ' ')}
          </Badge>
          {isTrending && (
            <Badge variant="secondary" className="bg-card/80 backdrop-blur-sm animate-pulse">
              <TrendingUp className="h-3 w-3 mr-1" />
              Trending
            </Badge>
          )}
          {isEndingSoon && (
            <Badge variant="destructive" className="animate-pulse">
              <Clock className="h-3 w-3 mr-1" />
              {daysUntilEvent} day{daysUntilEvent > 1 ? 's' : ''} left
            </Badge>
          )}
        </div>
        
        {/* Like Button */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={(e) => {
            e.preventDefault()
            setIsLiked(!isLiked)
          }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
        >
          <motion.div
            animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Heart 
              className={cn(
                'h-5 w-5 transition-colors',
                isLiked ? 'fill-destructive text-destructive' : 'text-muted-foreground'
              )} 
            />
          </motion.div>
        </motion.button>

        {/* Price Tag */}
        <div className="absolute bottom-3 right-3">
          <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm font-semibold">
            {event.paymentConfig.isFree ? 'Free' : `₹${event.paymentConfig.amount}`}
          </Badge>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {event.title}
        </h3>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {event.description}
        </p>
        
        {/* Meta Info */}
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2 text-primary" />
            {formattedDate}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2 text-primary" />
            <span className="line-clamp-1">{event.venue}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2 text-primary" />
            {event.stats.totalRegistrations} / {event.maxParticipants || '∞'} registered
          </div>
        </div>
        
        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {event.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
            {event.tags.length > 3 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                +{event.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* Action Button */}
        <Link href={`/events/${event.id}`}>
          <Button className="w-full group/btn gradient-primary text-primary-foreground border-0">
            View Details
            <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
      
      {/* Hover border effect */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/30 transition-colors pointer-events-none" />
    </motion.div>
  )
}
