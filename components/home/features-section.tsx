'use client'

import { motion } from 'framer-motion'
import { 
  Sparkles, 
  Settings, 
  BarChart3, 
  Users, 
  QrCode, 
  CreditCard,
  ArrowRight
} from 'lucide-react'
import { features } from '@/lib/mock-data'
import { StaggeredFadeIn, StaggeredItem } from '@/components/animations/staggered-fade-in'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Settings,
  BarChart3,
  Users,
  QrCode,
  CreditCard,
}

export function FeaturesSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need to{' '}
            <span className="gradient-text">Run Amazing Events</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From AI-powered creation to real-time analytics, we have got all the tools 
            to make your event a success
          </p>
        </motion.div>

        <StaggeredFadeIn className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon] || Sparkles
            return (
              <StaggeredItem key={feature.title}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
                  >
                    <Icon className="h-6 w-6 text-primary" />
                  </motion.div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {feature.description}
                  </p>
                  <motion.div 
                    className="flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ x: -10 }}
                    whileHover={{ x: 0 }}
                  >
                    Learn more
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </motion.div>
                </motion.div>
              </StaggeredItem>
            )
          })}
        </StaggeredFadeIn>
      </div>
    </section>
  )
}
