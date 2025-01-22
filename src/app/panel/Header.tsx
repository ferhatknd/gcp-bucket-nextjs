"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ThemeSwitch from "@/components/ui/ThemeSwitch";
import { HomeIcon } from "@/components/ui/Icons";

export const Header = () => {
  const router = useRouter();
  const buttonClasses =
    "transition duration-300 ease-in-out transform hover:scale-105 hover:bg-primary hover:text-primary-foreground";

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
        <Button
          onClick={() => router.push("/")}
          variant="ghost"
          className={buttonClasses}
        >
          <HomeIcon className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Home</span>
        </Button>
        <ThemeSwitch />
      </div>
    </header>
  );
};
