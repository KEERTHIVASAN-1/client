import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  } | "up" | "down" | "neutral";
  description?: string;
  className?: string;
  iconClassName?: string;
  [key: string]: any;
}

export function KPICard({ title, value, icon: Icon, trend, description, className, iconClassName, ...rest }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn("hover-elevate", className)} {...rest}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {title}
              </span>
              <span className="text-2xl font-bold text-foreground">{value}</span>
              {description && (
                <span className="text-xs text-muted-foreground">{description}</span>
              )}
              {trend && (
                <div className="flex items-center gap-1 mt-1">
                  {typeof trend === "string"
                    ? trend === "up" 
                      ? (<TrendingUp className="w-3 h-3 text-green-500" />)
                      : trend === "down"
                        ? (<TrendingDown className="w-3 h-3 text-red-500" />)
                        : null
                    : trend.isPositive ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  )}
                  <span
                    className={cn(
                      "text-xs font-medium",
                      typeof trend === "string"
                        ? (trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground")
                        : (trend.isPositive ? "text-green-500" : "text-red-500")
                    )}
                  >
                    {typeof trend === "string" ? undefined : `${trend.value}%`}
                  </span>
                </div>
              )}
            </div>
            <div
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-lg",
                iconClassName || "bg-primary/10 text-primary"
              )}
            >
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
