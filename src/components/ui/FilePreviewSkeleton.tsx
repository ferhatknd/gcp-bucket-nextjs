export function FilePreviewSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* File Details Section Skeleton */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/2 rounded-2xl blur-xl" />
        <div className="relative bg-card/50 backdrop-blur-sm rounded-2xl border border-primary/10 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-transparent border-b border-primary/10 p-6">
            <div className="h-8 bg-primary/10 rounded-lg w-36 animate-pulse" />
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="relative bg-primary/5 rounded-xl p-4 overflow-hidden"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <div className="w-5 h-5 bg-primary/20 rounded animate-pulse" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-primary/10 rounded w-20 animate-pulse" />
                      <div className="h-5 bg-primary/10 rounded w-32 animate-pulse" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent skeleton-shine" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* File Preview Section Skeleton */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/2 rounded-2xl blur-xl" />
        <div className="relative bg-card/50 backdrop-blur-sm rounded-2xl border border-primary/10 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-transparent border-b border-primary/10 p-6">
            <div className="h-8 bg-primary/10 rounded-lg w-36 animate-pulse" />
          </div>
          <div className="p-6">
            <div className="relative rounded-xl overflow-hidden">
              <div className="aspect-video bg-primary/5 animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent skeleton-shine" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
