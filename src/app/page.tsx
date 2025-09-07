"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { FileManager } from "@/components/file/FileManager";
import { LoginForm } from "@/components/panel/LoginForm";
import { PanelHeader } from "@/components/layout/PanelHeader";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const {
    adminApiKey,
    setAdminApiKey,
    isAuthenticated,
    isAuthenticating,
    error,
    authenticate,
  } = useAuth();

  const handleViewChange = (view: 'home' | 'admin') => {
    if (view === 'admin') {
      router.push('/panel');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <Toaster
        position="top-right"
        toastOptions={{
          className: "bg-card/50 border border-primary/10 backdrop-blur-sm",
          duration: 3000,
        }}
      />

      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen flex items-center justify-center"
          >
            <main className="container mx-auto px-4 sm:px-6">
              <LoginForm
                adminApiKey={adminApiKey}
                setAdminApiKey={setAdminApiKey}
                authenticate={authenticate}
                isAuthenticating={isAuthenticating}
                error={error}
              />
            </main>
          </motion.div>
        ) : (
          <motion.div
            key="authenticated"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen"
          >
            <PanelHeader 
              currentView="home" 
              onViewChange={handleViewChange} 
            />
            
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
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
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
