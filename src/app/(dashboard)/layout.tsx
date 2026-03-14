"use client";

import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import CommandBar from "@/components/CommandBar";
import PageTransition from "@/components/PageTransition";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { AnimatePresence, motion } from "framer-motion";

function DashboardInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, toggle, isDesktop } = useSidebar();

  return (
    <div className="min-h-screen flex bg-surface-50 dark:bg-surface-900 overflow-hidden relative">
      {/* Sidebar - Desktop */}
      <aside className={`
        hidden lg:flex flex-col bg-white dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700/50 h-screen sticky top-0 transition-all duration-300
        ${isOpen ? 'w-[260px]' : 'w-[72px]'}
      `}>
        {/* Logo */}
        <div className="px-4 py-5 border-b border-surface-100 dark:border-surface-700/50">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-glow flex-shrink-0 transition-transform group-hover:scale-105">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                width={24} 
                height={24}
                className="brightness-0 invert" 
              />
            </div>
            <div className="sidebar-label overflow-hidden whitespace-nowrap transition-all duration-300">
              <h1 className="text-base font-bold text-surface-900 dark:text-white font-display leading-tight">Academia</h1>
              <p className="text-[10px] text-surface-400 font-medium uppercase tracking-wider">Connect</p>
            </div>
          </Link>
        </div>
        {/* Menu */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <Menu />
        </div>
      </aside>

      {/* Sidebar - Mobile Overlay */}
      <AnimatePresence>
        {isOpen && !isDesktop && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggle}
              className="fixed inset-0 bg-surface-950/40 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85vw] max-w-[300px] bg-white dark:bg-surface-800 shadow-2xl z-[70] flex flex-col lg:hidden"
            >
              <div className="px-6 py-5 border-b border-surface-100 dark:border-surface-700/50 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3" onClick={toggle}>
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center shadow-glow">
                    <Image src="/logo.png" alt="Logo" width={20} height={20} className="brightness-0 invert" />
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-surface-900 dark:text-white font-display leading-tight">Academia</h1>
                  </div>
                </Link>
                <button onClick={toggle} className="p-2 text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pt-2">
                <Menu />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 scrollbar-hide">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
      <CommandBar />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <DashboardInner>{children}</DashboardInner>
    </SidebarProvider>
  );
}
