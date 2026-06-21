"use client";

import * as React from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  side?: "left" | "right";
  direction?: "left" | "right" | "top";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  side = "right",
  direction,
  title,
  children,
  className,
}: DrawerProps) {
  const dir = direction ?? side;

  // Prevent body scroll when drawer is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const panelVariants: Variants =
    dir === "top"
      ? {
          hidden: { y: "-100%", opacity: 0 },
          visible: {
            y: 0,
            opacity: 1,
            transition: { type: "tween", duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
          },
          exit: {
            y: "-100%",
            opacity: 0,
            transition: { type: "tween", duration: 0.2, ease: [0.4, 0, 0.6, 1] },
          },
        }
      : {
          hidden: { x: dir === "right" ? "100%" : "-100%" },
          visible: {
            x: 0,
            transition: { type: "tween", duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
          },
          exit: {
            x: dir === "right" ? "100%" : "-100%",
            transition: { type: "tween", duration: 0.25, ease: [0.4, 0, 0.6, 1] },
          },
        };

  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  };

  const positionClass =
    dir === "top"
      ? "top-0 left-0 right-0 w-full h-auto max-h-[85vh]"
      : cn("top-0 h-full w-[70%] sm:w-[60%] md:w-full md:max-w-sm", dir === "right" ? "right-0" : "left-0");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Drawer Content Panel */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={panelVariants}
            className={cn(
              "absolute bg-white shadow-2xl flex flex-col focus:outline-none dark:bg-zinc-950",
              positionClass,
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
              {title ? (
                <h2 className="text-lg font-serif font-semibold tracking-wide text-zinc-900 dark:text-zinc-50">
                  {title}
                </h2>
              ) : (
                <div />
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
                aria-label="Close drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
