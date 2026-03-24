'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  Check,
  Calendar,
  IndianRupee,
  Grid3X3,
  List
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { EventCategory, EventFilters as Filters } from '@/lib/types'

interface EventFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  totalResults: number
}

const categories: { value: EventCategory; label: string }[] = [
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'tech-fest', label: 'Tech Fest' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'competition', label: 'Competition' },
]

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'date', label: 'Event Date' },
  { value: 'popularity', label: 'Most Popular' },
  { value: 'price', label: 'Price' },
]

export function EventFilters({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
  totalResults,
}: EventFiltersProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const selectedCategories = filters.category || []
  const hasActiveFilters = selectedCategories.length > 0 || filters.search

  const toggleCategory = (category: EventCategory) => {
    const current = filters.category || []
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category]
    onFiltersChange({ ...filters, category: updated })
  }

  const clearFilters = () => {
    onFiltersChange({ sortBy: 'newest', sortOrder: 'desc' })
  }

  return (
    <div className="space-y-4">
      {/* Search and Main Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <motion.div 
          className="relative flex-1"
          animate={{ scale: isSearchFocused ? 1.01 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={cn(
              'pl-10 transition-all',
              isSearchFocused && 'ring-2 ring-primary/50'
            )}
          />
          {filters.search && (
            <button
              onClick={() => onFiltersChange({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </motion.div>

        {/* Filter Toggle Button */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'gap-2',
            hasActiveFilters && 'border-primary text-primary'
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
              {selectedCategories.length + (filters.search ? 1 : 0)}
            </Badge>
          )}
        </Button>

        {/* Sort Dropdown */}
        <Select
          value={filters.sortBy || 'newest'}
          onValueChange={(value) => 
            onFiltersChange({ ...filters, sortBy: value as Filters['sortBy'] })
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View Mode Toggle */}
        <div className="flex border border-border rounded-lg p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'h-8 px-3',
              viewMode === 'grid' && 'bg-primary/10 text-primary'
            )}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange('list')}
            className={cn(
              'h-8 px-3',
              viewMode === 'list' && 'bg-primary/10 text-primary'
            )}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Expandable Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-card rounded-xl border border-border space-y-4">
              {/* Category Filters */}
              <div>
                <h4 className="text-sm font-medium mb-3">Category</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category, index) => {
                    const isSelected = selectedCategories.includes(category.value)
                    return (
                      <motion.button
                        key={category.value}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => toggleCategory(category.value)}
                        className={cn(
                          'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3 inline mr-1" />}
                        {category.label}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between pt-2 border-t border-border"
                >
                  <span className="text-sm text-muted-foreground">
                    {totalResults} event{totalResults !== 1 ? 's' : ''} found
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear all filters
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Tags */}
      <AnimatePresence>
        {selectedCategories.length > 0 && !showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-wrap gap-2"
          >
            {selectedCategories.map((category) => (
              <Badge
                key={category}
                variant="secondary"
                className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
                onClick={() => toggleCategory(category)}
              >
                {category.replace('-', ' ')}
                <X className="h-3 w-3" />
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 px-2 text-xs text-muted-foreground"
            >
              Clear all
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
