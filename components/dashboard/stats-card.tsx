"use client";

import { LucideIcon } from "lucide-react";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { CountUp } from "@/components/animations/count-up";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  glowColor?: "primary" | "secondary" | "accent" | "none";
}

export function StatsCard({
  title,
  value,
  suffix = "",
  prefix = "",
  icon: Icon,
  trend,
  glowColor = "none",
}: StatsCardProps) {
  return (
    <GlassmorphicCard className="p-6" glowColor={glowColor}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="mt-2 flex items-baseline gap-1">
            {prefix && <span className="text-2xl font-bold text-foreground">{prefix}</span>}
            <CountUp
              end={value}
              className="text-3xl font-bold text-foreground"
            />
            {suffix && <span className="text-lg text-muted-foreground">{suffix}</span>}
          </div>
          {trend && (
            <p
              className={cn(
                "mt-2 text-sm flex items-center gap-1",
                trend.isPositive ? "text-green-500" : "text-red-500"
              )}
            >
              {trend.isPositive ? "+" : "-"}{trend.value}%
              <span className="text-muted-foreground">vs last month</span>
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </GlassmorphicCard>
  );
}
