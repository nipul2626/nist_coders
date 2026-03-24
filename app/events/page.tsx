'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { EventCard } from '@/components/events/event-card'
import { EventFilters } from '@/components/events/event-filters'
import { EmptyState } from '@/components/shared/empty-state'
import { GradientBackground } from '@/components/animations/gradient-background'
import { mockEvents } from '@/lib/mock-data'
import type { EventFilters as Filters } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const ITEMS_PER_PAGE = 6

export default function BrowseEventsPage() {
  const [filters, setFilters] = useState<Filters>({
    sortBy: 'newest',
    sortOrder: 'desc',
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let events = [...mockEvents]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      events = events.filter(
        (event) =>
          event.title.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower) ||
          event.venue.toLowerCase().includes(searchLower) ||
          event.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
      )
    }

    // Category filter
    if (filters.category && filters.category.length > 0) {
      events = events.filter((event) =>
        filters.category!.includes(event.category)
      )
    }

    // Sort
    events.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date':
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case 'popularity':
          return b.stats.totalRegistrations - a.stats.totalRegistrations
        case 'price':
          const priceA = a.paymentConfig.isFree ? 0 : a.paymentConfig.amount || 0
          const priceB = b.paymentConfig.isFree ? 0 : b.paymentConfig.amount || 0
          return priceA - priceB
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    if (filters.sortOrder === 'desc' && filters.sortBy !== 'popularity') {
      events.reverse()
    }

    return events
  }, [filters])

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE)
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <GradientBackground variant="subtle" className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Discover <span className="gradient-text">Events</span>
            </h1>
            <p className="text-muted-foreground">
              Find and join hackathons, workshops, and tech events near you
            </p>
          </motion.div>

          <EventFilters
            filters={filters}
            onFiltersChange={(newFilters) => {
              setFilters(newFilters)
              setCurrentPage(1)
            }}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            totalResults={filteredEvents.length}
          />
        </div>
      </GradientBackground>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <AnimatePresence mode="wait">
            {paginatedEvents.length > 0 ? (
              <motion.div
                key="events-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={
                  viewMode === 'grid'
                    ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'flex flex-col gap-4'
                }
              >
                {paginatedEvents.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))}
              </motion.div>
            ) : (
              <EmptyState
                key="empty-state"
                type="no-results"
                actionHref="/create"
                actionLabel="Create Event"
              />
            )}
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 mt-12"
            >
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setCurrentPage(page)}
                  className={
                    currentPage === page
                      ? 'gradient-primary text-primary-foreground border-0'
                      : ''
                  }
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
