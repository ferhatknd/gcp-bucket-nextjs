import React from "react";
import { Header } from "@/app/panel/Header";
import AdminFileManager from "@/components/panel/AdminFileManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileManagerIcon } from "@/components/ui/Icons";
import { motion } from "framer-motion";

interface MainPanelProps {}

export const MainPanel: React.FC<MainPanelProps> = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-6xl dark:bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative"
        >
          <Card className="relative bg-card/95 border-primary/20 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
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
        </motion.div>
      </main>
    </div>
  );
};
