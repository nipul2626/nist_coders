"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin, Download, QrCode, ChevronDown, Ticket, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { mockEvents, mockRegistrations } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type TicketFilter = "all" | "upcoming" | "past";

export default function TicketsPage() {
  const [filter, setFilter] = useState<TicketFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

  const now = new Date();

  const tickets = mockRegistrations
    .map((registration) => {
      const event = mockEvents.find((e) => e.id === registration.eventId);
      if (!event) return null;
      return { registration, event };
    })
    .filter(Boolean)
    .filter((ticket) => {
      if (!ticket) return false;
      const eventDate = new Date(ticket.event.startDate);
      
      if (filter === "upcoming" && eventDate <= now) return false;
      if (filter === "past" && eventDate > now) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          ticket.event.title.toLowerCase().includes(query) ||
          ticket.event.location.toLowerCase().includes(query)
        );
      }
      
      return true;
    }) as { registration: typeof mockRegistrations[0]; event: typeof mockEvents[0] }[];

  const filterOptions: { value: TicketFilter; label: string }[] = [
    { value: "all", label: "All Tickets" },
    { value: "upcoming", label: "Upcoming" },
    { value: "past", label: "Past" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Tickets</h1>
        <p className="text-muted-foreground mt-1">Manage your event registrations and tickets</p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>
        <div className="flex gap-2">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={filter === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(option.value)}
              className={cn(
                filter === option.value && "bg-primary hover:bg-primary/90"
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      {tickets.length > 0 ? (
        <div className="space-y-4">
          {tickets.map(({ registration, event }) => {
            const eventDate = new Date(event.startDate);
            const isPast = eventDate <= now;
            const isExpanded = expandedTicket === registration.id;

            return (
              <GlassmorphicCard
                key={registration.id}
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  isPast && "opacity-70"
                )}
              >
                {/* Main Ticket Content */}
                <div className="p-6">
                  <div className="flex gap-4">
                    {/* Date Badge */}
                    <div className="w-16 h-16 rounded-lg bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-primary">
                        {eventDate.getDate()}
                      </span>
                      <span className="text-xs text-muted-foreground uppercase">
                        {eventDate.toLocaleDateString("en-US", { month: "short" })}
                      </span>
                    </div>

                    {/* Event Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link
                            href={`/events/${event.id}`}
                            className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                          >
                            {event.title}
                          </Link>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {eventDate.toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              <span className="truncate max-w-[200px]">{event.location}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-xs px-2.5 py-1 rounded-full font-medium",
                              isPast
                                ? "bg-muted text-muted-foreground"
                                : registration.status === "confirmed"
                                ? "bg-green-500/10 text-green-500"
                                : "bg-yellow-500/10 text-yellow-500"
                            )}
                          >
                            {isPast ? "Attended" : registration.status === "confirmed" ? "Confirmed" : "Pending"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-primary" />
                          <span className="text-sm text-foreground">
                            {registration.ticketCount} ticket{registration.ticketCount !== 1 ? "s" : ""}
                          </span>
                          {registration.totalAmount > 0 && (
                            <span className="text-sm text-muted-foreground">
                              · ${registration.totalAmount.toFixed(2)}
                            </span>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedTicket(isExpanded ? null : registration.id)}
                          className="text-muted-foreground"
                        >
                          Details
                          <ChevronDown
                            className={cn(
                              "ml-1 h-4 w-4 transition-transform",
                              isExpanded && "rotate-180"
                            )}
                          />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-border/50 bg-muted/30 p-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      {/* QR Code Placeholder */}
                      <div className="flex flex-col items-center justify-center p-6 bg-background/50 rounded-lg">
                        <div className="w-32 h-32 bg-foreground/10 rounded-lg flex items-center justify-center mb-3">
                          <QrCode className="h-16 w-16 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                          Scan this code at the event entrance
                        </p>
                      </div>

                      {/* Ticket Details */}
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Confirmation Number</p>
                          <p className="font-mono text-foreground mt-1">{registration.id.toUpperCase()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Registered On</p>
                          <p className="text-foreground mt-1">
                            {new Date(registration.registeredAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Tickets</p>
                          <p className="text-foreground mt-1">
                            {registration.ticketCount} x {event.ticketTypes?.[0]?.name || "General Admission"}
                          </p>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Calendar className="mr-2 h-4 w-4" />
                            Add to Calendar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </GlassmorphicCard>
            );
          })}
        </div>
      ) : (
        <GlassmorphicCard className="p-12 text-center">
          <Ticket className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No tickets found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {searchQuery
              ? "No tickets match your search. Try a different query."
              : "You haven't registered for any events yet. Start exploring!"}
          </p>
          <Button asChild>
            <Link href="/events">Browse Events</Link>
          </Button>
        </GlassmorphicCard>
      )}
    </div>
  );
}
