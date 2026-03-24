"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Calendar, MapPin, Users, Clock, Search, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { EventCard } from "@/components/events/event-card";
import { mockEvents } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function SavedEventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Mock saved events (first 4 events for demo)
  const savedEventIds = ["event-1", "event-2", "event-3", "event-4"];
  const savedEvents = mockEvents.filter((e) => savedEventIds.includes(e.id));

  const filteredEvents = savedEvents.filter((event) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        event.title.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.category.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Saved Events</h1>
        <p className="text-muted-foreground mt-1">Events you&apos;ve bookmarked for later</p>
      </div>

      {/* Search and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search saved events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
            className={cn(viewMode === "grid" && "bg-primary hover:bg-primary/90")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
            className={cn(viewMode === "list" && "bg-primary hover:bg-primary/90")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Events */}
      {filteredEvents.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => {
              const eventDate = new Date(event.startDate);
              return (
                <GlassmorphicCard key={event.id} className="p-4 hover:scale-[1.01] transition-transform">
                  <Link href={`/events/${event.id}`} className="flex gap-4">
                    <div className="w-24 h-24 rounded-lg bg-muted overflow-hidden flex-shrink-0">
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

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
                          {event.title}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          onClick={(e) => {
                            e.preventDefault();
                            // Handle unsave
                          }}
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {eventDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
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
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {event.currentAttendees}/{event.capacity}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {event.category}
                        </span>
                        {event.isFeatured && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </GlassmorphicCard>
              );
            })}
          </div>
        )
      ) : (
        <GlassmorphicCard className="p-12 text-center">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No saved events</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {searchQuery
              ? "No saved events match your search. Try a different query."
              : "You haven't saved any events yet. Browse events and click the heart icon to save them for later!"}
          </p>
          <Button asChild>
            <Link href="/events">Browse Events</Link>
          </Button>
        </GlassmorphicCard>
      )}
    </div>
  );
}
