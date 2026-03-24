import type { Event, User, Registration, Team, DashboardStats, ChartData, TimelineData, Notification } from './types'

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Arjun Sharma',
    email: 'arjun@university.edu',
    role: 'organizer',
    college: 'Indian Institute of Technology, Delhi',
    branch: 'Computer Science',
    year: 3,
    cgpa: 8.5,
    profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-20'),
  },
  {
    id: '2',
    name: 'Priya Patel',
    email: 'priya@university.edu',
    role: 'participant',
    college: 'National Institute of Technology, Bangalore',
    branch: 'Electronics',
    year: 2,
    cgpa: 9.1,
    profilePic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-18'),
  },
  {
    id: '3',
    name: 'Rahul Verma',
    email: 'rahul@university.edu',
    role: 'participant',
    college: 'BITS Pilani',
    branch: 'Mechanical',
    year: 4,
    cgpa: 7.8,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-03-15'),
  },
]

// Mock Events
export const mockEvents: Event[] = [
  {
    id: '1',
    organizerId: '1',
    title: 'HackOverflow 2026',
    description: 'The ultimate 48-hour hackathon experience! Join 500+ developers, designers, and innovators to build groundbreaking solutions. Compete for prizes worth $50,000, network with industry leaders, and transform your ideas into reality. Whether you\'re a seasoned coder or just starting out, HackOverflow welcomes all skill levels.',
    category: 'hackathon',
    date: new Date('2026-04-15T09:00:00'),
    endDate: new Date('2026-04-17T18:00:00'),
    venue: 'Tech Hub Convention Center, Bangalore',
    bannerImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=600&fit=crop',
    registrationRules: {
      minCGPA: 6.5,
      allowedBranches: ['Computer Science', 'Electronics', 'Information Technology'],
      allowedYears: [2, 3, 4],
      teamSize: { min: 2, max: 4 },
      autoApprove: true,
    },
    paymentConfig: {
      isFree: false,
      amount: 500,
      currency: 'INR',
    },
    stats: {
      totalRegistrations: 342,
      totalRevenue: 171000,
      checkInsCount: 0,
    },
    status: 'published',
    shareableLink: 'hackoverflow-2026',
    tags: ['AI/ML', 'Web3', 'FinTech', 'Healthcare'],
    maxParticipants: 500,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-03-20'),
  },
  {
    id: '2',
    organizerId: '1',
    title: 'AI Workshop: From Zero to Hero',
    description: 'A comprehensive hands-on workshop covering everything from basic machine learning concepts to advanced deep learning techniques. Learn to build and deploy AI models with Python, TensorFlow, and PyTorch. Perfect for beginners and intermediate developers looking to upskill.',
    category: 'workshop',
    date: new Date('2026-04-08T10:00:00'),
    endDate: new Date('2026-04-08T17:00:00'),
    venue: 'Virtual Event - Zoom',
    bannerImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=600&fit=crop',
    registrationRules: {
      minCGPA: 6.0,
      teamSize: { min: 1, max: 1 },
      autoApprove: true,
    },
    paymentConfig: {
      isFree: true,
    },
    stats: {
      totalRegistrations: 856,
      totalRevenue: 0,
      checkInsCount: 0,
    },
    status: 'published',
    shareableLink: 'ai-workshop-zero-hero',
    tags: ['AI', 'Machine Learning', 'Python', 'Deep Learning'],
    maxParticipants: 1000,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-18'),
  },
  {
    id: '3',
    organizerId: '1',
    title: 'TechFusion 2026',
    description: 'The annual tech fest featuring coding competitions, robotics challenges, gaming tournaments, and tech talks from industry experts. Three days of non-stop innovation, learning, and fun. Join us for the biggest tech celebration of the year!',
    category: 'tech-fest',
    date: new Date('2026-05-10T09:00:00'),
    endDate: new Date('2026-05-12T21:00:00'),
    venue: 'University Campus, Main Auditorium',
    bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=600&fit=crop',
    registrationRules: {
      teamSize: { min: 1, max: 5 },
      autoApprove: true,
    },
    paymentConfig: {
      isFree: false,
      amount: 299,
      currency: 'INR',
    },
    stats: {
      totalRegistrations: 1250,
      totalRevenue: 373750,
      checkInsCount: 0,
    },
    status: 'published',
    shareableLink: 'techfusion-2026',
    tags: ['Coding', 'Robotics', 'Gaming', 'Tech Talks'],
    maxParticipants: 2000,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-03-20'),
  },
  {
    id: '4',
    organizerId: '1',
    title: 'Startup Pitch Competition',
    description: 'Got a brilliant startup idea? Present your pitch to a panel of VCs and industry experts. Top 3 teams get seed funding up to $100,000. Network with investors, mentors, and fellow entrepreneurs.',
    category: 'competition',
    date: new Date('2026-04-25T14:00:00'),
    endDate: new Date('2026-04-25T20:00:00'),
    venue: 'Entrepreneurship Center, Building 4',
    bannerImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=600&fit=crop',
    registrationRules: {
      minCGPA: 7.0,
      allowedYears: [3, 4],
      teamSize: { min: 2, max: 4 },
      autoApprove: false,
    },
    paymentConfig: {
      isFree: true,
    },
    stats: {
      totalRegistrations: 45,
      totalRevenue: 0,
      checkInsCount: 0,
    },
    status: 'published',
    shareableLink: 'startup-pitch-2026',
    tags: ['Startup', 'Entrepreneurship', 'Pitch', 'Funding'],
    maxParticipants: 50,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-03-19'),
  },
  {
    id: '5',
    organizerId: '1',
    title: 'Cloud Computing Seminar',
    description: 'Learn about the latest trends in cloud computing from AWS, Google Cloud, and Azure experts. Topics include serverless architecture, containerization, and multi-cloud strategies.',
    category: 'seminar',
    date: new Date('2026-04-05T11:00:00'),
    endDate: new Date('2026-04-05T16:00:00'),
    venue: 'Seminar Hall B, Engineering Block',
    bannerImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=600&fit=crop',
    registrationRules: {
      teamSize: { min: 1, max: 1 },
      autoApprove: true,
    },
    paymentConfig: {
      isFree: true,
    },
    stats: {
      totalRegistrations: 234,
      totalRevenue: 0,
      checkInsCount: 0,
    },
    status: 'published',
    shareableLink: 'cloud-seminar-2026',
    tags: ['Cloud', 'AWS', 'Azure', 'DevOps'],
    maxParticipants: 300,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-20'),
  },
  {
    id: '6',
    organizerId: '1',
    title: 'Web Development Bootcamp',
    description: 'An intensive 2-day bootcamp covering modern web development with React, Next.js, and Node.js. Build a full-stack application from scratch and deploy it live!',
    category: 'workshop',
    date: new Date('2026-04-20T09:00:00'),
    endDate: new Date('2026-04-21T18:00:00'),
    venue: 'Computer Lab 1 & 2, IT Building',
    bannerImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=600&fit=crop',
    registrationRules: {
      minCGPA: 6.0,
      allowedBranches: ['Computer Science', 'Information Technology'],
      teamSize: { min: 1, max: 1 },
      autoApprove: true,
    },
    paymentConfig: {
      isFree: false,
      amount: 199,
      currency: 'INR',
    },
    stats: {
      totalRegistrations: 78,
      totalRevenue: 15522,
      checkInsCount: 0,
    },
    status: 'published',
    shareableLink: 'webdev-bootcamp-2026',
    tags: ['React', 'Next.js', 'Node.js', 'Full Stack'],
    maxParticipants: 100,
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-20'),
  },
]

// Mock Registrations
export const mockRegistrations: Registration[] = [
  {
    id: '1',
    eventId: '1',
    userId: '2',
    teamId: '1',
    eligibilityStatus: 'eligible',
    paymentStatus: 'completed',
    paymentId: 'pay_abc123',
    qrCode: 'QR_REG_001',
    checkInStatus: false,
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15'),
  },
  {
    id: '2',
    eventId: '2',
    userId: '2',
    eligibilityStatus: 'eligible',
    paymentStatus: 'completed',
    qrCode: 'QR_REG_002',
    checkInStatus: false,
    createdAt: new Date('2024-03-16'),
    updatedAt: new Date('2024-03-16'),
  },
  {
    id: '3',
    eventId: '3',
    userId: '3',
    eligibilityStatus: 'pending',
    paymentStatus: 'pending',
    qrCode: 'QR_REG_003',
    checkInStatus: false,
    createdAt: new Date('2024-03-18'),
    updatedAt: new Date('2024-03-18'),
  },
]

// Mock Teams
export const mockTeams: Team[] = [
  {
    id: '1',
    eventId: '1',
    teamName: 'Code Crusaders',
    leaderId: '2',
    members: ['2', '3'],
    inviteLink: 'team-code-crusaders-xyz123',
    status: 'forming',
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15'),
  },
]

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalRegistrations: 342,
  todayRegistrations: 15,
  totalRevenue: 171000,
  checkInsCount: 0,
  pendingApprovals: 12,
  teamCount: 86,
}

// Mock Chart Data
export const mockCategoryData: ChartData[] = [
  { name: 'Hackathon', value: 342 },
  { name: 'Workshop', value: 934 },
  { name: 'Tech Fest', value: 1250 },
  { name: 'Seminar', value: 234 },
  { name: 'Competition', value: 45 },
]

export const mockBranchData: ChartData[] = [
  { name: 'CS', value: 450 },
  { name: 'ECE', value: 280 },
  { name: 'IT', value: 320 },
  { name: 'Mech', value: 150 },
  { name: 'Civil', value: 80 },
]

export const mockYearData: ChartData[] = [
  { name: '1st Year', value: 180 },
  { name: '2nd Year', value: 420 },
  { name: '3rd Year', value: 580 },
  { name: '4th Year', value: 340 },
]

export const mockTimelineData: TimelineData[] = [
  { date: 'Mar 1', registrations: 12, revenue: 6000 },
  { date: 'Mar 5', registrations: 28, revenue: 14000 },
  { date: 'Mar 10', registrations: 45, revenue: 22500 },
  { date: 'Mar 15', registrations: 78, revenue: 39000 },
  { date: 'Mar 20', registrations: 95, revenue: 47500 },
  { date: 'Mar 25', registrations: 84, revenue: 42000 },
]

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'registration',
    title: 'New Registration',
    message: 'Priya Patel registered for HackOverflow 2026',
    read: false,
    createdAt: new Date('2024-03-20T10:30:00'),
  },
  {
    id: '2',
    type: 'payment',
    title: 'Payment Received',
    message: 'Payment of ₹500 received for HackOverflow 2026',
    read: false,
    createdAt: new Date('2024-03-20T10:31:00'),
  },
  {
    id: '3',
    type: 'team',
    title: 'Team Formed',
    message: 'Code Crusaders team has been created',
    read: true,
    createdAt: new Date('2024-03-19T15:00:00'),
  },
]

// Testimonials
export const testimonials = [
  {
    id: '1',
    name: 'Aditya Kumar',
    role: 'Event Organizer, IIT Delhi',
    content: 'EventFlex transformed how we manage our annual tech fest. The AI-powered features saved us countless hours, and the real-time analytics helped us make data-driven decisions.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: '2',
    name: 'Sneha Reddy',
    role: 'Student Coordinator, NIT Trichy',
    content: 'The team formation and QR check-in features are game changers! No more spreadsheets and manual verification. Everything just works seamlessly.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: '3',
    name: 'Vikram Singh',
    role: 'Tech Club President, BITS Pilani',
    content: 'We hosted our hackathon with 500+ participants using EventFlex. The custom eligibility rules and payment integration made registrations smooth and hassle-free.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
  },
]

// Platform Stats
export const platformStats = [
  { label: 'Events Hosted', value: 2500, suffix: '+' },
  { label: 'Registrations', value: 150000, suffix: '+' },
  { label: 'Universities', value: 200, suffix: '+' },
  { label: 'Active Users', value: 50000, suffix: '+' },
]

// Features List
export const features = [
  {
    title: 'AI-Powered Event Creation',
    description: 'Generate compelling event descriptions, auto-tag categories, and get smart scheduling suggestions powered by AI.',
    icon: 'Sparkles',
  },
  {
    title: 'Flexible Registration Rules',
    description: 'Set custom eligibility criteria based on CGPA, branch, year, and more. Full control over who can register.',
    icon: 'Settings',
  },
  {
    title: 'Real-Time Analytics',
    description: 'Track registrations, revenue, and engagement with beautiful charts and live updates.',
    icon: 'BarChart3',
  },
  {
    title: 'Team Formation',
    description: 'Let participants form teams, invite members, and collaborate seamlessly with shareable invite links.',
    icon: 'Users',
  },
  {
    title: 'QR Code Check-In',
    description: 'Generate unique QR codes for each registration and scan for instant check-in at the venue.',
    icon: 'QrCode',
  },
  {
    title: 'Secure Payments',
    description: 'Integrated payment gateway supporting UPI, cards, and net banking with automatic receipts.',
    icon: 'CreditCard',
  },
]

// Branches List
export const branches = [
  'Computer Science',
  'Electronics',
  'Information Technology',
  'Mechanical',
  'Civil',
  'Electrical',
  'Chemical',
  'Aerospace',
  'Biotechnology',
  'Data Science',
]

// Years List
export const years = [1, 2, 3, 4, 5]

// Colleges List (Sample)
export const colleges = [
  'Indian Institute of Technology, Delhi',
  'Indian Institute of Technology, Bombay',
  'Indian Institute of Technology, Madras',
  'National Institute of Technology, Karnataka',
  'BITS Pilani',
  'VIT Vellore',
  'Delhi Technological University',
  'Other',
]
