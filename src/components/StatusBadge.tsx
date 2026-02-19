import { cn } from "@/lib/utils";

type StatusType = "urgent" | "pending" | "complete" | "warning";

const styles: Record<StatusType, string> = {
  urgent: "bg-urgent/10 text-urgent border-urgent/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  complete: "bg-complete/10 text-complete border-complete/20",
  warning: "bg-warning/10 text-warning border-warning/20",
};

export default function StatusBadge({
  status,
  children,
  className,
}: {
  status: StatusType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[status],
        className
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", {
          "bg-urgent": status === "urgent",
          "bg-warning": status === "pending" || status === "warning",
          "bg-complete": status === "complete",
        })}
      />
      {children}
    </span>
  );
}
