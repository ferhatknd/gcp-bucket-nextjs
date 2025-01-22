"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageLoadingProps {
  message?: string;
}

export function PageLoading({ message = "Loading" }: PageLoadingProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80">
      <div className="flex-grow container mx-auto px-4 py-12 sm:px-6 lg:px-8 max-w-4xl flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative w-full max-w-md"
        >
          {/* Background gradient and blur effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/20 via-foreground/20 to-foreground/20 rounded-3xl blur-3xl" />

          <div className="relative bg-card/50 backdrop-blur-sm rounded-2xl border border-foreground/10 p-8">
            <div className="flex flex-col items-center gap-6">
              {/* Loading animation */}
              <div className="relative w-20 h-20">
                {/* Spinner rings */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={cn(
                      "absolute inset-0 rounded-full border-2 border-transparent",
                      "border-t-foreground/80",
                      "border-r-foreground/80",
                    )}
                    style={{
                      scale: 1 - i * 0.15,
                    }}
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 2 - i * 0.2,
                      ease: "linear",
                      repeat: Infinity,
                    }}
                  />
                ))}

                {/* Center pulse */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
                >
                  <div className="w-6 h-6 rounded-full bg-foreground/80" />
                </motion.div>
              </div>

              {/* Loading text */}
              <motion.div
                className="space-y-2 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-lg font-medium text-foreground">
                  {message}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Please wait a moment
                </p>
              </motion.div>

              {/* Loading dots */}
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-foreground/50"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="absolute inset-0 -z-10 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-20 h-20 rounded-full bg-foreground/10 blur-xl"
                animate={{
                  x: [
                    Math.random() * 200 - 100,
                    Math.random() * 200 - 100,
                    Math.random() * 200 - 100,
                  ],
                  y: [
                    Math.random() * 200 - 100,
                    Math.random() * 200 - 100,
                    Math.random() * 200 - 100,
                  ],
                }}
                transition={{
                  duration: 10 + Math.random() * 10,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
