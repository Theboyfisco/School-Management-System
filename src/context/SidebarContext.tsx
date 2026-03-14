"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
  isDesktop: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const pathname = usePathname();

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    if (!isDesktop) {
      setIsOpen(false);
    }
  }, [pathname, isDesktop]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024; // lg breakpoint
      setIsDesktop(desktop);
      if (desktop) {
        setIsOpen(true); // Always open on desktop for the side layout
      } else {
        setIsOpen(false); // Default closed on mobile
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, toggle, isDesktop }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
