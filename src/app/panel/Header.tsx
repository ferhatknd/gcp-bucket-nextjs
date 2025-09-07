"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ThemeSwitch from "@/components/ui/ThemeSwitch";
import { HomeIcon, AdminIcon } from "@/components/ui/Icons";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export const Header = () => {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        "sticky top-0 z-50 w-full",
        "border-b border-primary/10",
        "bg-gradient-to-b from-background/80 to-background/20",
        "backdrop-blur-xl backdrop-saturate-150",
      )}
    >
      <div className="container relative mx-auto px-6 h-16">
        <div className="flex h-full items-center justify-between">
          <div className="flex items-center gap-6">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => router.push("/")}
                variant="ghost"
                className={cn(
                  "group relative overflow-hidden",
                  "flex items-center gap-2 px-4",
                  "transition-all duration-300",
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <HomeIcon className="relative w-[18px] h-[18px] text-primary transition-all duration-300 group-hover:scale-110" />
                </div>

                <span className="relative font-medium bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Home
                </span>
              </Button>
            </motion.div>

            <div className="relative hidden sm:block">
              <div className="absolute inset-0 bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative h-6 w-px bg-gradient-to-b from-primary/20 via-primary/10 to-transparent" />
            </div>

            <div className="hidden sm:flex items-center space-x-3">
              <div className="flex items-center justify-center p-1.5 rounded-lg bg-primary/5">
                <AdminIcon className="w-5 h-5 text-primary" />
              </div>
              <h2
                className={cn(
                  "text-lg font-semibold leading-none",
                  "bg-gradient-to-r from-[hsl(var(--gradient-1))] via-[hsl(var(--gradient-2))] to-[hsl(var(--gradient-3))]",
                  "bg-clip-text text-transparent",
                  "flex items-center",
                  "pt-4",
                )}
              >
                Admin Panel
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={logout}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                Logout
              </Button>
            </motion.div>
            <div className="relative">
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-md" />
              <ThemeSwitch />
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
