"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/panel/LoginForm";
import { PanelHeader } from "@/components/layout/PanelHeader";
import AdminFileManager from "@/components/panel/AdminFileManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileManagerIcon } from "@/components/ui/Icons";
import { motion, AnimatePresence } from "framer-motion";

const PanelPage = () => {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<'home' | 'admin'>('admin');

  const {
    adminApiKey,
    setAdminApiKey,
    isAuthenticated,
    isAuthenticating,
    error: authError,
    authenticate,
  } = useAuth();

  // Panel page always shows admin view
  useEffect(() => {
    setCurrentView('admin');
  }, []);

  const handleViewChange = (view: 'home' | 'admin') => {
    if (view === 'home') {
      router.push('/');
    } else {
      setCurrentView(view);
      router.push('/panel', { scroll: false });
    }
  };

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
            className="min-h-screen flex items-center justify-center"
          >
            <main className="container mx-auto px-4 sm:px-6">
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
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen"
          >
            <PanelHeader 
              currentView={currentView} 
              onViewChange={handleViewChange} 
            />
            
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
              <motion.section
                key="admin"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--gradient-1))/0.1] to-[hsl(var(--gradient-2))/0.1] rounded-2xl sm:rounded-3xl" />
                <div className="relative bg-card/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-primary/10 shadow-lg overflow-hidden">
                  <Card className="relative bg-transparent border-0 rounded-2xl sm:rounded-3xl overflow-hidden shadow-none">
                    <CardHeader className="space-y-2 sm:space-y-3 border-b border-primary/10 bg-primary/[0.03] p-4 sm:p-8">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 bg-primary/10 rounded-lg sm:rounded-xl">
                          <FileManagerIcon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                        </div>
                        <CardTitle className="text-2xl sm:text-3xl font-bold text-primary/90 pt-2 sm:pt-4">
                          File Management
                        </CardTitle>
                      </div>
                      <p className="text-sm sm:text-base text-muted-foreground/90">
                        View and manage your uploaded files
                      </p>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-8">
                      <AdminFileManager />
                    </CardContent>
                  </Card>
                </div>
              </motion.section>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PanelPage;
