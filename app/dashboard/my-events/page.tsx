"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Eye, 
  Copy,
  Plus,
  BarChart3,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockEvents } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type EventStatus = "all" | "upcoming" | "past" | "draft";

export default function MyEventsPage() {
  const [statusFilter, setStatusFilter] = useState<EventStatus>("all");

  // Get user's organized events (mock: using organizerId "user-1")
  const myEvents = mockEvents.filter((e) => e.organizerId === "user-1");
  const now = new Date();

  const filteredEvents = myEvents.filter((event) => {
    const eventDate = new Date(event.startDate);
    
    if (statusFilter === "upcoming" && eventDate <= now) return false;
    if (statusFilter === "past" && eventDate > now) return false;
    if (statusFilter === "draft" && event.status !== "draft") return false;
    
    return true;
  });

  const statusOptions: { value: EventStatus; label: string }[] = [
    { value: "all", label: "All Events" },
    { value: "upcoming", label: "Upcoming" },
    { value: "past", label: "Past" },
    { value: "draft", label: "Drafts" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Events</h1>
          <p className="text-muted-foreground mt-1">Manage events you&apos;ve created</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <GlassmorphicCard className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{myEvents.length}</p>
          <p className="text-sm text-muted-foreground">Total Events</p>
        </GlassmorphicCard>
        <GlassmorphicCard className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">
            {myEvents.filter((e) => new Date(e.startDate) > now).length}
          </p>
          <p className="text-sm text-muted-foreground">Upcoming</p>
        </GlassmorphicCard>
        <GlassmorphicCard className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">
            {myEvents.reduce((sum, e) => sum + e.currentAttendees, 0)}
          </p>
          <p className="text-sm text-muted-foreground">Total Attendees</p>
        </GlassmorphicCard>
        <GlassmorphicCard className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">
            {myEvents.filter((e) => e.status === "draft").length}
          </p>
          <p className="text-sm text-muted-foreground">Drafts</p>
        </GlassmorphicCard>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusOptions.map((option) => (
          <Button
            key={option.value}
            variant={statusFilter === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(option.value)}
            className={cn(
              "whitespace-nowrap",
              statusFilter === option.value && "bg-primary hover:bg-primary/90"
            )}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Events List */}
      {filteredEvents.length > 0 ? (
        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const eventDate = new Date(event.startDate);
            const isPast = eventDate <= now;
            const attendancePercentage = Math.round((event.currentAttendees / event.capacity) * 100);

            return (
              <GlassmorphicCard
                key={event.id}
                className={cn(
                  "p-6 transition-all duration-300 hover:scale-[1.01]",
                  isPast && "opacity-70"
                )}
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Event Image */}
                  <div className="w-full sm:w-32 h-24 sm:h-24 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <Calendar className="h-8 w-8 text-primary" />
                      </div>
                    )}
                  </div>

                  {/* Event Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/events/${event.id}`}
                            className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                          >
                            {event.title}
                          </Link>
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full font-medium",
                              event.status === "published"
                                ? "bg-green-500/10 text-green-500"
                                : event.status === "draft"
                                ? "bg-yellow-500/10 text-yellow-500"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {eventDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {eventDate.toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate max-w-[150px]">{event.location}</span>
                          </span>
                        </div>
                      </div>

                      {/* Actions Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="flex-shrink-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/events/${event.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Event
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Event
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            View Analytics
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Event
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Attendance Stats */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {event.currentAttendees} / {event.capacity} attendees
                        </span>
                        <span className="text-foreground font-medium">{attendancePercentage}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            attendancePercentage >= 90
                              ? "bg-red-500"
                              : attendancePercentage >= 70
                              ? "bg-yellow-500"
                              : "bg-primary"
                          )}
                          style={{ width: `${attendancePercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </GlassmorphicCard>
            );
          })}
        </div>
      ) : (
        <GlassmorphicCard className="p-12 text-center">
          <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No events found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {statusFilter !== "all"
              ? "No events match this filter. Try a different one."
              : "You haven't created any events yet. Start by creating your first event!"}
          </p>
          <Button asChild>
            <Link href="/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Event
            </Link>
          </Button>
        </GlassmorphicCard>
      )}
    </div>
  );
}
