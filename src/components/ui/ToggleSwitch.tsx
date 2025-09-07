"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function ToggleSwitch({ 
  checked, 
  onChange, 
  disabled = false, 
  size = "md",
  className,
  onClick 
}: ToggleSwitchProps) {
  const sizeClasses = {
    sm: "w-8 h-4",
    md: "w-10 h-5", 
    lg: "w-12 h-6"
  };

  const knobSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        if (onClick) onClick(e);
        if (!disabled) onChange(!checked);
      }}
      disabled={disabled}
      className={cn(
        "relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        sizeClasses[size],
        checked 
          ? "bg-green-500 hover:bg-green-600" 
          : "bg-gray-200 hover:bg-gray-300",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      aria-checked={checked}
      role="switch"
    >
      <motion.span
        className={cn(
          "inline-block rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
          knobSizeClasses[size]
        )}
        animate={{
          x: checked 
            ? size === "sm" ? 16 : size === "md" ? 20 : 24
            : 2
        }}
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30
        }}
        style={{
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)"
        }}
      />
    </button>
  );
}