import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType = "success" | "warning" | "error" | "info" | "neutral";

interface StatusBadgeProps {
  status: string;
  type?: StatusType;
  className?: string;
}

const statusColors: Record<StatusType, string> = {
  success: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  error: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  info: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  neutral: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
};

const statusTypeMap: Record<string, StatusType> = {
  active: "success",
  paid: "success",
  present: "success",
  approved: "success",
  resolved: "success",
  pending: "warning",
  in_progress: "info",
  new: "info",
  absent: "error",
  rejected: "error",
  overdue: "error",
  removed: "neutral",
  inactive: "neutral",
};

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const statusType = type || statusTypeMap[status.toLowerCase()] || "neutral";
  const displayStatus = status.replace(/_/g, " ");

  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize font-medium text-xs",
        statusColors[statusType],
        className
      )}
    >
      {displayStatus}
    </Badge>
  );
}
