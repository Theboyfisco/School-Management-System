"use client";

import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/hooks/useUser";
import { useTheme } from "@/context/ThemeContext";
import Image from "next/image";
import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "./Announcements";
import { useRouter } from "next/navigation";
import Messages from "@/components/Messages";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChatBubbleLeftRightIcon, 
  MegaphoneIcon, 
  SunIcon, 
  MoonIcon,
  Bars3Icon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { useSidebar } from "@/context/SidebarContext";
import { useRealtime } from "@/hooks/useRealtime";

const unreadFetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (json && json.error) throw new Error(json.error);
  return json;
};

const dropdownVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 25 } },
  exit: { opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.15 } }
};

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();
  const { toggle, isOpen } = useSidebar();
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const { data: announcements = [] } = useSWR("/api/announcements", fetcher, { refreshInterval: 60000, revalidateOnFocus: false });
  const { data: unreadData, mutate: mutateUnread } = useSWR("/api/announcements/unread-count", unreadFetcher, { refreshInterval: 60000, revalidateOnFocus: false });
  const unreadCount = unreadData?.count || 0;
  const [readIds, setReadIds] = useState<Set<number>>(new Set());
  const { data: messages = [] } = useSWR("/api/messages", fetcher, { refreshInterval: 60000, revalidateOnFocus: false });
  const { data: unreadMessagesData, mutate: mutateUnreadMessages } = useSWR("/api/messages/unread-count", unreadFetcher, { refreshInterval: 60000, revalidateOnFocus: false });
  const unreadMessagesCount = unreadMessagesData?.count || 0;
  const [showMessages, setShowMessages] = useState(false);

  // Realtime updates for notifications
  useRealtime("announcement", () => {
    mutateUnread();
  });

  useRealtime("message", () => {
    mutateUnreadMessages();
  });

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  const handleMarkAsRead = async (id: number) => {
    await fetch("/api/announcements/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ announcementId: id }),
    });
    mutateUnread();
    setReadIds(prev => new Set(prev).add(id));
  };

  const role = user?.user_metadata?.role as string;
  const fullName = user?.user_metadata?.firstName 
    ? `${user.user_metadata.firstName} ${user.user_metadata.lastName || ''}`
    : user?.email?.split('@')[0] || 'User';

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button - Now toggles global sidebar */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggle}
            className="lg:hidden p-2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors mr-2"
            aria-label="Toggle mobile menu"
          >
            {isOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </motion.button>
          
          {/* Desktop Toggle Sidebar - Visual indicator if needed or just use for width toggle */}
          <motion.button
             whileTap={{ scale: 0.9 }}
             onClick={toggle}
             className="hidden lg:flex p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg mr-4 transition-colors"
          >
            <Bars3Icon className="w-5 h-5" />
          </motion.button>

          {/* Search Bar / Command Palette Trigger */}
          <div className="flex-1">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => window.dispatchEvent(new CustomEvent("open-command-bar"))}
              className="flex items-center gap-3 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700/50 rounded-xl px-4 py-2 text-surface-400 hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all duration-300 w-full md:w-[350px] group"
            >
              <MagnifyingGlassIcon className="w-4 h-4 text-surface-400 group-hover:text-primary-500 transition-colors" />
              <span className="text-sm font-medium flex-1 text-left">Search anything...</span>
              <kbd className="hidden md:flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-white dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded text-surface-500">
                <span className="text-[12px]">⌘</span>K
              </kbd>
            </motion.button>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2.5 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition-all duration-300"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </motion.button>

            {/* Messages */}
            <div className="relative">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative p-2.5 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition-all duration-300"
                aria-label="Open messages"
                onClick={() => setShowMessages((v) => !v)}
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                {unreadMessagesCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-blue-500 text-white rounded-full text-[10px] font-bold"
                  >
                    {unreadMessagesCount}
                  </motion.span>
                )}
              </motion.button>
              <AnimatePresence>
                {showMessages && (
                  <motion.div 
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute right-0 mt-2 w-[calc(100vw-32px)] sm:w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden"
                  >
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-900 dark:text-white">Recent Messages</div>
                    <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                      {messages.slice(0, 5).map((m: any) => (
                        <li key={m.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                          onClick={() => { router.push(`/list/messages`); setShowMessages(false); }}>
                          <div className={`flex justify-between items-center ${!m.read ? 'font-bold' : ''}`}>
                            <span className="text-gray-800 dark:text-gray-200 text-sm truncate pr-2">{m.title}</span>
                            <span className="text-[10px] text-gray-500 whitespace-nowrap">{new Date(m.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{m.content}</p>
                        </li>
                      ))}
                      {messages.length === 0 && (
                        <li className="p-3 text-gray-500 dark:text-gray-400 text-sm">No messages</li>
                      )}
                    </ul>
                    <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-center">
                      <button className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline" onClick={() => { router.push("/list/messages"); setShowMessages(false); }}>View all messages</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Announcements */}
            <div className="relative">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative p-2.5 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition-all duration-300"
                aria-label="View announcements"
                onClick={() => setShowAnnouncements((v) => !v)}
              >
                <MegaphoneIcon className="w-5 h-5" />
                {unreadCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-[10px] font-bold"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </motion.button>
              <AnimatePresence>
                {showAnnouncements && (
                  <motion.div 
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute right-0 mt-2 w-[calc(100vw-32px)] sm:w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden"
                  >
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-900 dark:text-white">Recent Announcements</div>
                    <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                      {announcements.slice(0, 5).map((a: any) => (
                        <li key={a.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                          onClick={async () => { await handleMarkAsRead(a.id); router.push(`/announcements/${a.id}`); setShowAnnouncements(false); }}>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-800 dark:text-gray-200 text-sm font-bold truncate pr-2">{a.title}</span>
                            <span className="text-[10px] text-gray-500 whitespace-nowrap">{new Date(a.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 truncate">{a.content || a.description}</p>
                        </li>
                      ))}
                      {announcements.length === 0 && (
                        <li className="p-3 text-gray-500 dark:text-gray-400 text-sm">No announcements</li>
                      )}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Info & Menu */}
            <div className="relative flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{fullName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{role}</p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-10 h-10 rounded-xl overflow-hidden border-2 border-surface-200 dark:border-surface-700 shadow-sm"
              >
                <Image 
                  src={user?.user_metadata?.avatar_url || "/noAvatar.png"} 
                  alt="Avatar" 
                  width={40} 
                  height={40}
                  className="object-cover"
                />
              </motion.button>
              
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div 
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-2 z-50"
                  >
                    <div className="md:hidden px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{fullName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{role}</p>
                    </div>
                    <button 
                      onClick={() => { router.push("/profile"); setShowUserMenu(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <UserCircleIcon className="w-4 h-4" />
                      Profile
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 border-t border-gray-100 dark:border-gray-700 mt-1"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Navbar;
