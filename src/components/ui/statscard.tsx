import { cn } from "@/lib/utils";

export function StatsCard({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5",
        "bg-card/50 backdrop-blur-sm",
        "border border-primary/10 rounded-lg",
        "transition-all duration-300 hover:border-primary/20",
      )}
    >
      <Icon className="w-4 h-4 text-primary/80" />
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-medium">{value}</span>
      </div>
    </div>
  );
}
