"use client";
import React, { useEffect } from "react";
import useMaintenance from "@/hooks/useMaintenance";
import { motion } from "framer-motion";
import { WrenchIcon } from "@/components/ui/Icons";

export function MaintenanceContent() {
  const { reasonForMaintenance } = useMaintenance();
  const reason = reasonForMaintenance || "No reason provided";

  // Prevent scrolling when maintenance mode is active
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] backdrop-blur-md">
      <div className="fixed inset-0 bg-background/90" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-2xl">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl blur-xl" />
            <div className="relative bg-card/50 backdrop-blur-sm rounded-2xl border border-primary/10 overflow-hidden">
              <div className="px-6 py-8 sm:p-10 space-y-6">
                <div className="space-y-2 text-center">
                  <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                    }}
                    className="flex justify-center"
                  >
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <WrenchIcon className="w-12 h-12 text-primary" />
                    </div>
                  </motion.div>
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Maintenance in Progress
                  </h2>
                </div>

                <div className="space-y-4">
                  <p className="text-center text-muted-foreground">
                    We&apos;re currently performing maintenance to improve our
                    services. Our team is working diligently to minimize
                    downtime.
                  </p>

                  <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                    <p className="text-sm text-center">
                      <span className="font-semibold text-primary">
                        Reason:
                      </span>{" "}
                      <span className="text-muted-foreground">{reason}</span>
                    </p>
                  </div>

                  <p className="text-sm text-center text-muted-foreground">
                    Thank you for your patience and understanding. We&apos;ll be
                    back online shortly.
                  </p>
                </div>

                <div className="pt-4 flex justify-center">
                  <div className="space-x-1">
                    <span className="w-2 h-2 rounded-full bg-primary/60 inline-block animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-primary/60 inline-block animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-primary/60 inline-block animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
