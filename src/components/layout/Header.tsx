"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CloudIcon,
  FileIcon,
  AdminIcon,
  InfoIcon,
} from "@/components/ui/Icons";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const NavLink = ({
    href,
    icon: Icon,
    children,
  }: {
    href: string;
    icon: any;
    children: React.ReactNode;
  }) => (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-2 rounded-lg",
        "transition-all duration-300",
        "text-muted-foreground hover:text-primary",
        "hover:bg-primary/5 hover:scale-105",
        "font-medium relative overflow-hidden",
        "px-2 py-1.5 sm:px-4 sm:py-2",
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Icon className="w-4 h-4 relative transition-transform duration-300 group-hover:scale-110" />
      </div>
      <span className="relative text-sm sm:text-base">{children}</span>
    </Link>
  );

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        "border-b border-primary/10",
        "bg-gradient-to-b from-background/80 to-background/20",
        isScrolled
          ? "backdrop-blur-sm backdrop-saturate-150 shadow-lg"
          : "backdrop-blur-sm backdrop-saturate-100",
      )}
    >
      <div className="container mx-auto px-2 sm:px-4 h-16">
        <div className="flex h-full items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-1.5 sm:gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-xl transition-all duration-300"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--gradient-1))] to-[hsl(var(--gradient-2))] opacity-10 rounded-full blur-[1px] group-hover:opacity-20 group-hover:blur-[2px] transition-all duration-300" />
              <CloudIcon className="relative w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-primary transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-10deg]" />
            </div>
            <span className="font-bold text-sm sm:text-lg md:text-xl lg:text-2xl bg-gradient-to-r from-[hsl(var(--gradient-1))] via-[hsl(var(--gradient-2))] to-[hsl(var(--gradient-3))] bg-clip-text text-transparent truncate">
              Cloud Storage
            </span>
          </Link>

          <nav className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
            <NavLink href="/files" icon={FileIcon}>
              Files
            </NavLink>
            <NavLink href="/panel" icon={AdminIcon}>
              Admin
            </NavLink>
            <NavLink href="/info" icon={InfoIcon}>
              Info
            </NavLink>
          </nav>
        </div>
      </div>
    </motion.header>
  );
}
