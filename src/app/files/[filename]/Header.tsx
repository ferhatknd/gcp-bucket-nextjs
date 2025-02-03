"use client";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  HomeIcon,
  CopyIcon,
  DownloadIcon,
  MenuIcon,
  XIcon,
  ArrowLeftIcon,
} from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import ThemeSwitch from "@/components/ui/ThemeSwitch";

const Header = ({
  handleCopy,
  handleDownload,
  copied,
}: {
  handleCopy: () => void;
  handleDownload: () => void;
  copied: boolean;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const HeaderButton = ({
    onClick,
    icon: Icon,
    label,
    disabled = false,
    tooltipContent,
  }: {
    onClick: () => void;
    icon: any;
    label: string;
    disabled?: boolean;
    tooltipContent: string;
  }) => (
    <Tooltip text={tooltipContent}>
      <Button
        onClick={onClick}
        variant="ghost"
        disabled={disabled}
        className={cn(
          "relative group transition-all duration-300",
          "hover:bg-primary/10 active:scale-95",
          "rounded-full p-2 sm:p-2.5",
          "bg-background/50 backdrop-blur-sm",
        )}
      >
        <div className="absolute inset-0 rounded-full bg-primary/5 scale-0 group-hover:scale-100 transition-transform duration-300" />
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 relative transition-transform duration-300 group-hover:scale-110" />
        <span className="sr-only">{label}</span>
      </Button>
    </Tooltip>
  );

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        "border-b border-primary/10",
        "bg-gradient-to-b from-background/80 to-background/20",
        isScrolled
          ? "backdrop-blur-sm backdrop-saturate-125"
          : "backdrop-blur-[2px] backdrop-saturate-75",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeaderButton
              onClick={() => router.push("/")}
              icon={HomeIcon}
              label="Home"
              tooltipContent="Go to Home"
            />
            <HeaderButton
              onClick={() => router.push("/files")}
              icon={ArrowLeftIcon}
              label="Back"
              tooltipContent="Go Back"
            />
          </div>

          <div className="hidden md:flex items-center gap-3">
            <HeaderButton
              onClick={handleCopy}
              icon={CopyIcon}
              label="Copy Link"
              disabled={copied}
              tooltipContent={copied ? "Copied!" : "Copy Link"}
            />
            <HeaderButton
              onClick={handleDownload}
              icon={DownloadIcon}
              label="Download"
              tooltipContent="Download File"
            />
            <ThemeSwitch />
          </div>

          <div className="md:hidden">
            <Button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              variant="ghost"
              className="relative group rounded-full p-2 transition-all duration-300 hover:bg-primary/10 bg-background/50 backdrop-blur-[2px]"
            >
              <div className="absolute inset-0 rounded-full bg-primary/5 scale-0 group-hover:scale-100 transition-transform duration-300" />
              <motion.div
                animate={{ rotate: isMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                {isMenuOpen ? (
                  <XIcon className="w-5 h-5" />
                ) : (
                  <MenuIcon className="w-5 h-5" />
                )}
              </motion.div>
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-primary/10 bg-background/50 backdrop-blur-[2px]"
          >
            <div className="container mx-auto px-4 py-3 space-y-2">
              {[
                {
                  icon: CopyIcon,
                  label: "Copy Link",
                  onClick: () => {
                    handleCopy();
                    setIsMenuOpen(false);
                  },
                  disabled: copied,
                },
                {
                  icon: DownloadIcon,
                  label: "Download File",
                  onClick: () => {
                    handleDownload();
                    setIsMenuOpen(false);
                  },
                },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    onClick={item.onClick}
                    variant="ghost"
                    disabled={item.disabled}
                    className={cn(
                      "w-full justify-start gap-3",
                      "transition-all duration-300",
                      "hover:bg-primary/10 active:scale-98",
                      "rounded-lg px-4 py-3",
                      "bg-background/50 backdrop-blur-[2px]",
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Button>
                </motion.div>
              ))}
              <div className="flex justify-end">
                <ThemeSwitch />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
