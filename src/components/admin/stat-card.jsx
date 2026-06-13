"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  loading = false,
  className,
  onClick,
  active = false,
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-muted-foreground";

  if (loading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
          <Skeleton className="mt-4 h-8 w-20" />
          <Skeleton className="mt-2 h-4 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all",
        onClick && "cursor-pointer hover:shadow-md hover:border-primary/50",
        active && "border-primary bg-primary/5 shadow-md",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {Icon && (
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {(description || trendValue) && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              {trendValue && (
                <span className={cn("flex items-center gap-1 font-medium", trendColor)}>
                  <TrendIcon className="h-4 w-4" />
                  {trendValue}
                </span>
              )}
              {description && (
                <span className="text-muted-foreground">{description}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatCardGrid({ children, className }) {
  return (
    <div className={cn(
      "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      className
    )}>
      {children}
    </div>
  );
}

export default StatCard;
