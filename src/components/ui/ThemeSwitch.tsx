"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { SunIcon, MoonIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

export default function ThemeSwitch() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isChanging, setIsChanging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleThemeChange = useCallback(() => {
    if (!isChanging) {
      setIsChanging(true);
      setTheme(theme === "dark" ? "light" : "dark");

      // Add haptic feedback if available
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }

      setTimeout(() => setIsChanging(false), 500);
    }
  }, [isChanging, setTheme, theme]);

  if (!mounted) return null;

  return (
    <motion.button
      className={cn(
        "relative w-16 h-8 rounded-full p-1",
        "flex items-center justify-start",
        "focus:outline-none focus-visible:ring-2",
        "focus-visible:ring-primary/50",
        "shadow-lg transition-all duration-300",
        "disabled:opacity-50 disabled:cursor-not-allowed",
      )}
      style={{
        background:
          theme === "dark"
            ? "linear-gradient(to right, rgb(55, 65, 81), rgb(17, 24, 39))"
            : "linear-gradient(to right, rgb(249, 250, 251), rgb(209, 213, 219))",
      }}
      onClick={handleThemeChange}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      disabled={isChanging}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className={cn(
          "absolute inset-0 rounded-full opacity-0 transition-opacity duration-300",
          theme === "dark" ? "bg-blue-500/20" : "bg-yellow-500/20",
        )}
        animate={{ opacity: isHovered ? 1 : 0 }}
      />

      <motion.div
        className={cn(
          "w-6 h-6 rounded-full shadow-md",
          "flex items-center justify-center",
          "relative z-10",
          theme === "dark" ? "bg-gray-800" : "bg-white",
        )}
        animate={{
          x: theme === "dark" ? 32 : 0,
          rotate: theme === "dark" ? 360 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30,
        }}
      >
        <motion.div
          animate={{
            rotate: theme === "dark" ? 0 : 180,
            scale: isHovered ? 1.2 : 1,
          }}
          transition={{ duration: 0.5 }}
        >
          {theme === "dark" ? (
            <MoonIcon className="w-4 h-4 text-yellow-200" />
          ) : (
            <SunIcon className="w-4 h-4 text-yellow-500" />
          )}
        </motion.div>

        {theme === "light" && (
          <motion.div
            className="absolute inset-0"
            animate={{
              rotate: isHovered ? 360 : 0,
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-300/50 rounded-full"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: `rotate(${i * 45}deg) translateY(-10px)`,
                }}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.button>
  );
}
