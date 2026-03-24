"use client";

import { Calendar, Ticket, Users, TrendingUp, Clock, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { StaggeredFadeIn } from "@/components/animations/staggered-fade-in";
import { mockEvents, mockRegistrations } from "@/lib/mock-data";

export default function DashboardPage() {
  // Get upcoming registered events
  const upcomingRegistrations = mockRegistrations
    .filter((r) => {
      const event = mockEvents.find((e) => e.id === r.eventId);
      return event && new Date(event.startDate) > new Date();
    })
    .slice(0, 3);

  // Get events user has organized
  const myOrganizedEvents = mockEvents
    .filter((e) => e.organizerId === "user-1")
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, John!</h1>
        <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening with your events</p>
      </div>

      {/* Stats Grid */}
      <StaggeredFadeIn className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Upcoming Events"
          value={5}
          icon={Calendar}
          trend={{ value: 12, isPositive: true }}
          glowColor="primary"
        />
        <StatsCard
          title="Total Tickets"
          value={12}
          icon={Ticket}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Events Attended"
          value={28}
          icon={Users}
          trend={{ value: 15, isPositive: true }}
        />
        <StatsCard
          title="Events Created"
          value={4}
          icon={TrendingUp}
          trend={{ value: 25, isPositive: true }}
        />
      </StaggeredFadeIn>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Events */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Upcoming Events</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/tickets" className="text-primary">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {upcomingRegistrations.length > 0 ? (
              upcomingRegistrations.map((registration) => {
                const event = mockEvents.find((e) => e.id === registration.eventId);
                if (!event) return null;
                return (
                  <UpcomingEventCard key={registration.id} event={event} ticketCount={registration.ticketCount} />
                );
              })
            ) : (
              <GlassmorphicCard className="p-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium text-foreground mb-1">No upcoming events</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start exploring events and register for ones you like!
                </p>
                <Button asChild>
                  <Link href="/events">Browse Events</Link>
                </Button>
              </GlassmorphicCard>
            )}
          </div>
        </div>

        {/* Quick Actions & My Events */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <GlassmorphicCard className="p-6" glowColor="primary">
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/create">
                  <Calendar className="mr-2 h-4 w-4" />
                  Create New Event
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/events">
                  <Ticket className="mr-2 h-4 w-4" />
                  Browse Events
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/my-events">
                  <Users className="mr-2 h-4 w-4" />
                  Manage My Events
                </Link>
              </Button>
            </div>
          </GlassmorphicCard>

          {/* My Organized Events */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">My Events</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/my-events" className="text-primary text-sm">
                  View All
                </Link>
              </Button>
            </div>

            <div className="space-y-3">
              {myOrganizedEvents.length > 0 ? (
                myOrganizedEvents.map((event) => (
                  <GlassmorphicCard key={event.id} className="p-4">
                    <Link href={`/events/${event.id}`} className="block group">
                      <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {event.currentAttendees}/{event.capacity}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(event.startDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </Link>
                  </GlassmorphicCard>
                ))
              ) : (
                <GlassmorphicCard className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">No events created yet</p>
                </GlassmorphicCard>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
        <GlassmorphicCard className="divide-y divide-border/50">
          {[
            { action: "Registered for", event: "Tech Innovation Summit 2026", time: "2 hours ago" },
            { action: "Created event", event: "Design Workshop Series", time: "1 day ago" },
            { action: "Saved", event: "Campus Music Festival", time: "2 days ago" },
            { action: "Received ticket for", event: "AI & Machine Learning Conference", time: "3 days ago" },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-foreground">
                  <span className="text-muted-foreground">{activity.action}</span>{" "}
                  <span className="font-medium">{activity.event}</span>
                </p>
              </div>
              <span className="text-xs text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </GlassmorphicCard>
      </div>
    </div>
  );
}

function UpcomingEventCard({ event, ticketCount }: { event: typeof mockEvents[0]; ticketCount: number }) {
  const eventDate = new Date(event.startDate);
  const daysUntil = Math.ceil((eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <GlassmorphicCard className="p-4 group hover:scale-[1.01] transition-transform">
      <Link href={`/events/${event.id}`} className="flex gap-4">
        <div className="w-20 h-20 rounded-lg bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
          <span className="text-2xl font-bold text-primary">
            {eventDate.getDate()}
          </span>
          <span className="text-xs text-muted-foreground uppercase">
            {eventDate.toLocaleDateString("en-US", { month: "short" })}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {event.title}
          </h3>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {eventDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate max-w-[150px]">{event.location}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {ticketCount} ticket{ticketCount !== 1 ? "s" : ""}
            </span>
            {daysUntil <= 7 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`}
              </span>
            )}
          </div>
        </div>
      </Link>
    </GlassmorphicCard>
  );
}
