// User Types
export interface User {
  id: string
  name: string
  email: string
  role: 'organizer' | 'participant'
  college: string
  branch: string
  year: number
  cgpa: number
  profilePic?: string
  createdAt: Date
  updatedAt: Date
}

// Event Types
export type EventCategory = 'hackathon' | 'workshop' | 'tech-fest' | 'seminar' | 'competition'
export type EventStatus = 'draft' | 'published' | 'ongoing' | 'completed'

export interface RegistrationRules {
  minCGPA?: number
  maxCGPA?: number
  allowedBranches?: string[]
  allowedYears?: number[]
  teamSize: { min: number; max: number }
  autoApprove: boolean
}

export interface PaymentConfig {
  isFree: boolean
  amount?: number
  currency?: string
}

export interface EventStats {
  totalRegistrations: number
  totalRevenue: number
  checkInsCount: number
}

export interface Event {
  id: string
  organizerId: string
  title: string
  description: string
  category: EventCategory
  date: Date
  endDate?: Date
  venue: string
  bannerImage?: string
  brandingColors?: {
    primary: string
    secondary: string
  }
  registrationRules: RegistrationRules
  paymentConfig: PaymentConfig
  customFields?: CustomField[]
  stats: EventStats
  status: EventStatus
  shareableLink: string
  tags?: string[]
  maxParticipants?: number
  createdAt: Date
  updatedAt: Date
}

export interface CustomField {
  id: string
  label: string
  type: 'text' | 'number' | 'dropdown' | 'checkbox' | 'date'
  required: boolean
  options?: string[]
}

// Registration Types
export type EligibilityStatus = 'eligible' | 'pending' | 'rejected'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface Registration {
  id: string
  eventId: string
  userId: string
  teamId?: string
  eligibilityStatus: EligibilityStatus
  paymentStatus: PaymentStatus
  paymentId?: string
  customFieldResponses?: Record<string, unknown>
  qrCode: string
  checkInStatus: boolean
  checkInTime?: Date
  createdAt: Date
  updatedAt: Date
}

// Team Types
export type TeamStatus = 'forming' | 'complete'

export interface Team {
  id: string
  eventId: string
  teamName: string
  leaderId: string
  members: string[]
  inviteLink: string
  status: TeamStatus
  createdAt: Date
  updatedAt: Date
}

export interface TeamMember {
  id: string
  name: string
  email: string
  profilePic?: string
  isLeader: boolean
}

// Dashboard Types
export interface DashboardStats {
  totalRegistrations: number
  todayRegistrations: number
  totalRevenue: number
  checkInsCount: number
  pendingApprovals: number
  teamCount: number
}

export interface ChartData {
  name: string
  value: number
  fill?: string
}

export interface TimelineData {
  date: string
  registrations: number
  revenue: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Form Types
export interface LoginFormData {
  email: string
  password: string
}

export interface SignupFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: 'organizer' | 'participant'
  college: string
  branch: string
  year: number
  cgpa: number
}

export interface CreateEventFormData {
  title: string
  description: string
  category: EventCategory
  date: Date
  endDate?: Date
  venue: string
  bannerImage?: string
  registrationRules: RegistrationRules
  paymentConfig: PaymentConfig
  customFields?: CustomField[]
  tags?: string[]
  maxParticipants?: number
}

// Filter Types
export interface EventFilters {
  category?: EventCategory[]
  status?: EventStatus[]
  search?: string
  dateRange?: {
    start: Date
    end: Date
  }
  priceRange?: {
    min: number
    max: number
  }
  sortBy?: 'date' | 'popularity' | 'price' | 'newest'
  sortOrder?: 'asc' | 'desc'
}

// Notification Types
export interface Notification {
  id: string
  type: 'registration' | 'payment' | 'team' | 'event' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: Date
}
