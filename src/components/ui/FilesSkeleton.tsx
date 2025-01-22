"use client";
import { motion } from "framer-motion";

export function FilesSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
          className="relative bg-card/50 backdrop-blur-sm rounded-xl p-5 border border-primary/10 overflow-hidden"
        >
          <div className="animate-pulse space-y-4">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-lg blur-sm" />
                <div className="relative w-12 h-12 bg-primary/10 rounded-lg" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-primary/10 rounded-full w-3/4" />
                <div className="flex flex-wrap gap-4">
                  <div className="h-4 bg-primary/5 rounded-full w-24" />
                  <div className="h-4 bg-primary/5 rounded-full w-32" />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-28 bg-primary/10 rounded-lg" />
              <div className="h-9 w-32 bg-primary/10 rounded-lg" />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent skeleton-shine" />
        </motion.div>
      ))}
    </div>
  );
}
