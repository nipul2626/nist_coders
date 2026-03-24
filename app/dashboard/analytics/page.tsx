"use client";

import { BarChart3, TrendingUp, Users, Calendar, Ticket, Eye, ArrowUp, ArrowDown } from "lucide-react";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { mockEvents } from "@/lib/mock-data";

export default function AnalyticsPage() {
  const myEvents = mockEvents.filter((e) => e.organizerId === "user-1");
  const totalAttendees = myEvents.reduce((sum, e) => sum + e.currentAttendees, 0);
  const avgAttendance = myEvents.length > 0 
    ? Math.round(totalAttendees / myEvents.length) 
    : 0;

  // Mock analytics data
  const monthlyData = [
    { month: "Jan", events: 2, attendees: 145 },
    { month: "Feb", events: 3, attendees: 230 },
    { month: "Mar", events: 1, attendees: 85 },
    { month: "Apr", events: 4, attendees: 320 },
    { month: "May", events: 2, attendees: 175 },
    { month: "Jun", events: 3, attendees: 250 },
  ];

  const topEvents = myEvents
    .sort((a, b) => b.currentAttendees - a.currentAttendees)
    .slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your event performance and engagement</p>
      </div>

      {/* Stats Overview */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Events"
          value={myEvents.length}
          icon={Calendar}
          trend={{ value: 25, isPositive: true }}
          glowColor="primary"
        />
        <StatsCard
          title="Total Attendees"
          value={totalAttendees}
          icon={Users}
          trend={{ value: 18, isPositive: true }}
        />
        <StatsCard
          title="Avg. Attendance"
          value={avgAttendance}
          icon={TrendingUp}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Total Views"
          value={1247}
          icon={Eye}
          trend={{ value: 32, isPositive: true }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Events Chart */}
        <GlassmorphicCard className="p-6">
          <h3 className="font-semibold text-foreground mb-6">Monthly Overview</h3>
          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={data.month} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{data.month}</span>
                  <span className="text-foreground">{data.events} events</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(data.events / Math.max(...monthlyData.map((d) => d.events))) * 100}%`,
                      animationDelay: `${index * 100}ms`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassmorphicCard>

        {/* Attendees Chart */}
        <GlassmorphicCard className="p-6">
          <h3 className="font-semibold text-foreground mb-6">Attendees by Month</h3>
          <div className="flex items-end justify-between gap-2 h-48">
            {monthlyData.map((data, index) => {
              const maxAttendees = Math.max(...monthlyData.map((d) => d.attendees));
              const height = (data.attendees / maxAttendees) * 100;
              
              return (
                <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full bg-primary/80 rounded-t-lg transition-all duration-500 hover:bg-primary"
                      style={{ 
                        height: `${height}%`,
                        animationDelay: `${index * 100}ms`
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{data.month}</span>
                </div>
              );
            })}
          </div>
        </GlassmorphicCard>
      </div>

      {/* Top Events */}
      <GlassmorphicCard className="p-6">
        <h3 className="font-semibold text-foreground mb-6">Top Performing Events</h3>
        <div className="space-y-4">
          {topEvents.length > 0 ? (
            topEvents.map((event, index) => {
              const percentage = Math.round((event.currentAttendees / event.capacity) * 100);
              const prevEvent = topEvents[index - 1];
              const trend = prevEvent 
                ? event.currentAttendees > prevEvent.currentAttendees 
                  ? "up" 
                  : "down"
                : "up";

              return (
                <div
                  key={event.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">{event.title}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {event.currentAttendees} attendees
                      </span>
                      <span className="flex items-center gap-1">
                        <Ticket className="h-3.5 w-3.5" />
                        {percentage}% capacity
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {trend === "up" ? (
                      <ArrowUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-500" />
                    )}
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No events to display. Create your first event to see analytics!
            </div>
          )}
        </div>
      </GlassmorphicCard>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <GlassmorphicCard className="p-6 text-center">
          <BarChart3 className="h-8 w-8 text-primary mx-auto mb-3" />
          <p className="text-2xl font-bold text-foreground">87%</p>
          <p className="text-sm text-muted-foreground">Average Fill Rate</p>
        </GlassmorphicCard>
        <GlassmorphicCard className="p-6 text-center">
          <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-foreground">+34%</p>
          <p className="text-sm text-muted-foreground">Growth This Quarter</p>
        </GlassmorphicCard>
        <GlassmorphicCard className="p-6 text-center">
          <Users className="h-8 w-8 text-blue-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-foreground">156</p>
          <p className="text-sm text-muted-foreground">Repeat Attendees</p>
        </GlassmorphicCard>
      </div>
    </div>
  );
}
