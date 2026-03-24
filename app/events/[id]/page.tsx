'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Share2, 
  Heart,
  ArrowLeft,
  Check,
  Copy,
  Twitter,
  Facebook,
  Linkedin,
  Link2,
  IndianRupee,
  Award,
  BookOpen,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CountdownTimer } from '@/components/events/countdown-timer'
import { EventCard } from '@/components/events/event-card'
import { mockEvents, mockUsers } from '@/lib/mock-data'
import type { Event } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { use } from 'react'

const categoryColors: Record<string, string> = {
  'hackathon': 'bg-primary/20 text-primary',
  'workshop': 'bg-accent/20 text-accent',
  'tech-fest': 'bg-success/20 text-success',
  'seminar': 'bg-info/20 text-info',
  'competition': 'bg-warning/20 text-warning',
}

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [isLiked, setIsLiked] = useState(false)
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [copied, setCopied] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Find the event
  const event = mockEvents.find((e) => e.id === id)
  const organizer = mockUsers.find((u) => u.id === event?.organizerId)
  const similarEvents = mockEvents.filter((e) => e.id !== id && e.category === event?.category).slice(0, 3)

  if (!event) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Event not found</h1>
          <Button asChild>
            <Link href="/events">Browse Events</Link>
          </Button>
        </div>
      </main>
    )
  }

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const formattedTime = new Date(event.date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const spotsLeft = event.maxParticipants 
    ? event.maxParticipants - event.stats.totalRegistrations 
    : null
  const isAlmostFull = spotsLeft !== null && spotsLeft < 20

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    toast.success('Link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const shareLinks = [
    { name: 'Twitter', icon: Twitter, url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(event.title)}` },
    { name: 'Facebook', icon: Facebook, url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}` },
    { name: 'LinkedIn', icon: Linkedin, url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}` },
  ]

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Banner */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        {!imageError && event.bannerImage ? (
          <Image
            src={event.bannerImage}
            alt={event.title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30" />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-24 left-4 sm:left-8"
        >
          <Button variant="secondary" size="sm" asChild className="bg-card/80 backdrop-blur-sm">
            <Link href="/events">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Link>
          </Button>
        </motion.div>
        
        {/* Category Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="absolute bottom-32 left-4 sm:left-8"
        >
          <Badge className={cn('text-sm', categoryColors[event.category])}>
            {event.category.replace('-', ' ')}
          </Badge>
        </motion.div>
        
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute bottom-8 left-4 sm:left-8 right-4 sm:right-8"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance">
            {event.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formattedDate}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {formattedTime}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {event.venue}
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Countdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-2xl bg-card border border-border"
            >
              <h3 className="text-lg font-semibold mb-4">Event Starts In</h3>
              <CountdownTimer targetDate={event.date} />
            </motion.div>
            
            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="w-full justify-start bg-card border border-border rounded-xl p-1 mb-6">
                  <TabsTrigger value="about" className="flex-1 sm:flex-none">About</TabsTrigger>
                  <TabsTrigger value="rules" className="flex-1 sm:flex-none">Rules</TabsTrigger>
                  <TabsTrigger value="prizes" className="flex-1 sm:flex-none">Prizes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="about" className="space-y-6">
                  <div className="prose prose-invert max-w-none">
                    <p className="text-foreground leading-relaxed">{event.description}</p>
                  </div>
                  
                  {/* Tags */}
                  {event.tags && event.tags.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Topics</h4>
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="rules" className="space-y-4">
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      Eligibility Criteria
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {event.registrationRules.minCGPA && (
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-success" />
                          Minimum CGPA: {event.registrationRules.minCGPA}
                        </li>
                      )}
                      {event.registrationRules.allowedYears && (
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-success" />
                          Allowed Years: {event.registrationRules.allowedYears.join(', ')}
                        </li>
                      )}
                      {event.registrationRules.allowedBranches && (
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-success" />
                          Allowed Branches: {event.registrationRules.allowedBranches.join(', ')}
                        </li>
                      )}
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-success" />
                        Team Size: {event.registrationRules.teamSize.min} - {event.registrationRules.teamSize.max} members
                      </li>
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="prizes" className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    {['1st Place', '2nd Place', '3rd Place'].map((place, index) => (
                      <div key={place} className="p-4 rounded-xl bg-card border border-border text-center">
                        <Award className={cn(
                          'h-8 w-8 mx-auto mb-2',
                          index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-600'
                        )} />
                        <p className="font-semibold">{place}</p>
                        <p className="text-muted-foreground text-sm">Exciting Prizes</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
            
            {/* Organizer Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-6 rounded-2xl bg-card border border-border"
            >
              <h3 className="text-lg font-semibold mb-4">Organizer</h3>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={organizer?.profilePic} />
                  <AvatarFallback className="gradient-primary text-primary-foreground">
                    {organizer?.name?.charAt(0) || 'O'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{organizer?.name || 'Event Organizer'}</p>
                  <p className="text-sm text-muted-foreground">{organizer?.college || 'University'}</p>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky top-24 p-6 rounded-2xl bg-card border border-border space-y-6"
            >
              {/* Price */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Registration Fee</p>
                <p className="text-3xl font-bold gradient-text">
                  {event.paymentConfig.isFree ? 'Free' : `₹${event.paymentConfig.amount}`}
                </p>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
                <div className="text-center">
                  <p className="text-2xl font-bold">{event.stats.totalRegistrations}</p>
                  <p className="text-xs text-muted-foreground">Registered</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{spotsLeft ?? '∞'}</p>
                  <p className="text-xs text-muted-foreground">Spots Left</p>
                </div>
              </div>
              
              {/* Urgency Warning */}
              {isAlmostFull && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  Only {spotsLeft} spots remaining!
                </div>
              )}
              
              {/* Register Button */}
              <Button
                asChild
                size="lg"
                className={cn(
                  'w-full gradient-primary text-primary-foreground border-0',
                  isAlmostFull && 'animate-pulse'
                )}
              >
                <Link href={`/events/${event.id}/register`}>
                  Register Now
                </Link>
              </Button>
              
              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <Heart className={cn('h-4 w-4 mr-2', isLiked && 'fill-destructive text-destructive')} />
                  {isLiked ? 'Saved' : 'Save'}
                </Button>
                
                <Popover open={showShareOptions} onOpenChange={setShowShareOptions}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56">
                    <div className="space-y-2">
                      {shareLinks.map((link) => (
                        <a
                          key={link.name}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <link.icon className="h-4 w-4" />
                          {link.name}
                        </a>
                      ))}
                      <button
                        onClick={handleCopyLink}
                        className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        {copied ? <Check className="h-4 w-4 text-success" /> : <Link2 className="h-4 w-4" />}
                        {copied ? 'Copied!' : 'Copy Link'}
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Similar Events */}
        {similarEvents.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold mb-6">Similar Events</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          </motion.section>
        )}
      </div>
      
      <Footer />
    </main>
  )
}
