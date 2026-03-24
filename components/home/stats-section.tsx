'use client'

import { motion } from 'framer-motion'
import { Calendar, Users, Building2, TrendingUp } from 'lucide-react'
import { CountUp } from '@/components/animations/count-up'
import { platformStats } from '@/lib/mock-data'

const icons = [Calendar, Users, Building2, TrendingUp]

export function StatsSection() {
  return (
    <section className="py-20 bg-card/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Powering Events <span className="gradient-text">Across India</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of organizers who trust EventFlex for their hackathons, workshops, and tech fests
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {platformStats.map((stat, index) => {
            const Icon = icons[index]
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="relative p-6 rounded-2xl bg-card border border-border text-center group"
              >
                <motion.div
                  initial={{ rotate: 0 }}
                  whileInView={{ rotate: 360 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                  className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
                >
                  <Icon className="h-6 w-6 text-primary" />
                </motion.div>
                <div className="text-3xl sm:text-4xl font-bold mb-2 text-foreground">
                  <CountUp target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-xl" />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
