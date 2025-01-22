import { LoadingIndicator } from "./LoadingIndicator";

export function PageLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80">
      <div className="flex-grow container mx-auto px-4 py-12 sm:px-6 lg:px-8 max-w-4xl flex items-center justify-center">
        <div className="w-full max-w-md text-center">
          <LoadingIndicator loading="page" iconSize="lg" className="mx-auto" />
        </div>
      </div>
    </div>
  );
}
