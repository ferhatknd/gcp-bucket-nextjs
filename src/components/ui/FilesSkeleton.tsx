export function FilesSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-card rounded-lg p-4 animate-pulse space-y-3">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-primary/10 rounded w-3/4" />
              <div className="h-3 bg-primary/5 rounded w-1/2" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-primary/10 rounded" />
            <div className="h-8 w-24 bg-primary/10 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
