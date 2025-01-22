import React from "react";
import { Header } from "@/app/panel/Header";
import AdminFileManager from "@/components/panel/AdminFileManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MainPanelProps {}

export const MainPanel: React.FC<MainPanelProps> = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Card className="border border-primary/10 shadow-xl rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/10 p-6">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-center sm:text-left text-primary">
              Admin Panel
            </CardTitle>
          </CardHeader>
        </Card>

        <div className="mt-8">
          <Card className="border border-primary/10 shadow-xl rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/10 p-6">
              <CardTitle className="text-2xl font-semibold text-primary">
                File Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <AdminFileManager />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
