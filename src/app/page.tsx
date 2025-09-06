"use client";
import React from "react";
import { Toaster } from "react-hot-toast";
import { FileManager } from "@/components/file/FileManager";
import { motion } from "framer-motion";

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

      <main className="flex-grow container mx-auto px-4 py-6 sm:py-8 md:py-12">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">

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
