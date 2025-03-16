"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Toaster } from "react-hot-toast";
import { FileManager } from "@/components/file/FileManager";
import ThemeSwitch from "@/components/ui/ThemeSwitch";
import { GithubIcon, FileManagerIcon } from "@/components/ui/Icons";
import { Header } from "@/components/layout/Header";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80">
      <Toaster
        position="top-right"
        toastOptions={{
          className: "bg-card/50 border border-primary/10 backdrop-blur-sm",
          duration: 3000,
        }}
      />
      <Header />

      <main className="flex-grow container mx-auto px-4 py-6 sm:py-8 md:py-12">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className="relative flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 sm:gap-6"
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/20 to-black/10 dark:from-white/30 dark:via-white/20 dark:to-white/10 rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative p-2 sm:p-3 bg-card/50 rounded-2xl border border-primary/10">
                    <FileManagerIcon className="w-10 h-10 sm:w-14 sm:h-14 text-primary transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </div>

                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl sm:text-3xl md:text-4xl font-bold pt-4"
                >
                  <span className="bg-gradient-to-r from-[hsl(var(--gradient-1))] via-[hsl(var(--gradient-2))] to-[hsl(var(--gradient-3))] bg-clip-text text-transparent">
                    File Manager
                  </span>
                </motion.h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3 sm:gap-4"
              >
                <ThemeSwitch />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    className={cn(
                      "relative group border-primary/10 text-sm sm:text-base",
                      "hover:border-primary/30 hover:bg-primary/10",
                    )}
                  >
                    <a
                      href="https://github.com/MrErenK/gcp-bucket-nextjs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 sm:gap-2 text-foreground hover:text-foreground dark:text-foreground dark:hover:text-foreground"
                    >
                      <GithubIcon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:rotate-12" />
                      <span className="font-medium">GitHub</span>
                    </a>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--glow-1))/0.1] to-[hsl(var(--glow-2))/0.1] rounded-2xl sm:rounded-3xl blur-md" />
            <div className="relative bg-card/50 rounded-2xl sm:rounded-3xl border border-primary/10 shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
              <div className="relative p-4 sm:p-6 md:p-8 lg:p-10">
                <h2 className="sr-only">File Management Interface</h2>
                <FileManager />
              </div>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
