import React from "react";
import { SearchIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { XIcon } from "@/components/ui/Icons";

interface SearchBarProps {
  searchTerm: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export function SearchBar({ searchTerm, onChange, placeholder = "Search files..." }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
        <SearchIcon className="w-5 h-5 text-muted-foreground transition-colors duration-200" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        className={cn(
          "w-full h-12 pl-11 pr-4 rounded-xl",
          "bg-background/50 backdrop-blur-sm",
          "border-2 border-primary/20",
          "text-foreground placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
          "transition-all duration-300",
          "shadow-sm hover:shadow-md",
        )}
        value={searchTerm}
        onChange={onChange}
      />
      {searchTerm && (
        <button
          onClick={() => onChange({ target: { value: "" } } as any)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <XIcon className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors duration-200" />
        </button>
      )}
    </div>
  );
}
