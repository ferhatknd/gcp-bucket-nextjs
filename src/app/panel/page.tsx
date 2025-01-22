"use client";
import React from "react";
import { Toaster } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/panel/LoginForm";
import { MainPanel } from "@/components/panel/MainPanel";
import { Header } from "./Header";
import { motion, AnimatePresence } from "framer-motion";

const PanelPage = () => {
  const {
    adminApiKey,
    setAdminApiKey,
    isAuthenticated,
    isAuthenticating,
    error: authError,
    authenticate,
  } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-background to-background/80"
    >
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
          >
            <Header />
            <main className="container mx-auto px-4 sm:px-6 min-h-[calc(100vh-4rem)] flex items-center justify-center">
              <LoginForm
                adminApiKey={adminApiKey}
                setAdminApiKey={setAdminApiKey}
                authenticate={authenticate}
                isAuthenticating={isAuthenticating}
                error={authError}
              />
            </main>
          </motion.div>
        ) : (
          <motion.main
            key="panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--gradient-1))/0.1] to-[hsl(var(--gradient-2))/0.1] rounded-2xl sm:rounded-3xl" />
              <div className="relative bg-card/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-primary/10 shadow-lg overflow-hidden">
                <MainPanel />
              </div>
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PanelPage;
