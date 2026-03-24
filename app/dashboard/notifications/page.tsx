"use client";

import { useState } from "react";
import { Bell, Calendar, Ticket, Heart, Check, Trash2, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "reminder" | "registration" | "update" | "saved";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}
//dashboard
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "reminder",
    title: "Event Starting Soon",
    message: "Tech Innovation Summit 2026 starts in 2 hours. Don't forget to attend!",
    timestamp: "2 hours ago",
    read: false,
    link: "/events/event-1",
  },
  {
    id: "2",
    type: "registration",
    title: "Registration Confirmed",
    message: "Your registration for Campus Music Festival has been confirmed. Check your tickets!",
    timestamp: "1 day ago",
    read: false,
    link: "/dashboard/tickets",
  },
  {
    id: "3",
    type: "update",
    title: "Event Updated",
    message: "AI & Machine Learning Conference venue has been changed. Please check the new location.",
    timestamp: "2 days ago",
    read: true,
    link: "/events/event-2",
  },
  {
    id: "4",
    type: "saved",
    title: "Saved Event Reminder",
    message: "Design Workshop Series you saved is happening next week. Register now!",
    timestamp: "3 days ago",
    read: true,
    link: "/events/event-3",
  },
  {
    id: "5",
    type: "registration",
    title: "Ticket Ready",
    message: "Your ticket for Startup Pitch Competition is ready. Download it now!",
    timestamp: "5 days ago",
    read: true,
    link: "/dashboard/tickets",
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "reminder":
        return <Bell className="h-5 w-5" />;
      case "registration":
        return <Ticket className="h-5 w-5" />;
      case "update":
        return <Calendar className="h-5 w-5" />;
      case "saved":
        return <Heart className="h-5 w-5" />;
    }
  };

  const getIconColor = (type: Notification["type"]) => {
    switch (type) {
      case "reminder":
        return "text-yellow-500 bg-yellow-500/10";
      case "registration":
        return "text-green-500 bg-green-500/10";
      case "update":
        return "text-blue-500 bg-blue-500/10";
      case "saved":
        return "text-red-500 bg-red-500/10";
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "You're all caught up!"}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </Button>
      </div>

      {/* Actions */}
      {notifications.length > 0 && (
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check className="mr-2 h-4 w-4" />
              Mark All as Read
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>
      )}

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <GlassmorphicCard
              key={notification.id}
              className={cn(
                "p-4 transition-all duration-300 hover:scale-[1.01]",
                !notification.read && "ring-1 ring-primary/50"
              )}
            >
              <div className="flex gap-4">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                    getIconColor(notification.type)
                  )}
                >
                  {getIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {notification.timestamp}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {notification.link && (
                    <Link
                      href={notification.link}
                      className="inline-block mt-3 text-sm text-primary hover:underline"
                      onClick={() => markAsRead(notification.id)}
                    >
                      View Details
                    </Link>
                  )}
                </div>
              </div>
            </GlassmorphicCard>
          ))}
        </div>
      ) : (
        <GlassmorphicCard className="p-12 text-center">
          <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No notifications</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            You don&apos;t have any notifications yet. When something important happens,
            we&apos;ll let you know here!
          </p>
        </GlassmorphicCard>
      )}
    </div>
  );
}
