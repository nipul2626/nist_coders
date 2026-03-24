"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  Calendar,
  Heart,
  Settings,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  PlusCircle,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Tickets",
    href: "/dashboard/tickets",
    icon: Ticket,
  },
  {
    label: "My Events",
    href: "/dashboard/my-events",
    icon: Calendar,
  },
  {
    label: "Saved Events",
    href: "/dashboard/saved",
    icon: Heart,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    label: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 bottom-0 z-40 flex flex-col border-r border-border/50 bg-background/80 backdrop-blur-xl transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* User Profile */}
      <div className={cn(
        "p-4 border-b border-border/50",
        isCollapsed && "px-2"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 text-primary" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">john@university.edu</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Event Button */}
      <div className={cn("p-4", isCollapsed && "px-2")}>
        <Button
          asChild
          className={cn(
            "w-full bg-primary hover:bg-primary/90",
            isCollapsed && "px-0"
          )}
        >
          <Link href="/create">
            <PlusCircle className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
            {!isCollapsed && "Create Event"}
          </Link>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    isCollapsed && "justify-center px-2"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-border/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "w-full justify-center text-muted-foreground hover:text-foreground",
            isCollapsed && "px-0"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Collapse
            </>
          )}
        </Button>
      </div>

      {/* Logout */}
      <div className={cn("p-4 border-t border-border/50", isCollapsed && "px-2")}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
          {!isCollapsed && "Log Out"}
        </Button>
      </div>
    </aside>
  );
}
