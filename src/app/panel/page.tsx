"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/panel/LoginForm";
import { MainPanel } from "@/components/panel/MainPanel";
import { Header } from "./Header";

const PanelPage = () => {
  const router = useRouter();
  const {
    adminApiKey,
    setAdminApiKey,
    isAuthenticated,
    isAuthenticating,
    error: authError,
    authenticate,
  } = useAuth();

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center p-4">
          <Toaster position="top-right" />
          <LoginForm
            adminApiKey={adminApiKey}
            setAdminApiKey={setAdminApiKey}
            authenticate={authenticate}
            isAuthenticating={isAuthenticating}
            error={authError}
          />
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/80">
      <Toaster position="top-right" />
      <main className="flex-grow p-4">
        <MainPanel />
      </main>
    </div>
  );
};

export default PanelPage;
