export function FilePreviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-primary/10 rounded w-1/4 mb-4" />
        <div className="h-[200px] bg-primary/5 rounded w-full mb-4" />
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-primary/10 rounded" />
          <div className="h-8 w-24 bg-primary/10 rounded" />
        </div>
      </div>
    </div>
  );
}
