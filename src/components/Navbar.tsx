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
import SearchBar from "@/components/SearchBar";
import { 
  ChatBubbleLeftRightIcon, 
  MegaphoneIcon, 
  SunIcon, 
  MoonIcon,
  Bars3Icon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";

// Separate fetcher for unread count that handles object responses
const unreadFetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (json && json.error) throw new Error(json.error);
  return json;
};

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const { data: announcements = [] } = useSWR("/api/announcements", fetcher, { refreshInterval: 10000 });
  const { data: unreadData, mutate: mutateUnread } = useSWR("/api/announcements/unread-count", unreadFetcher, { refreshInterval: 10000 });
  const unreadCount = unreadData?.count || 0;
  const [readIds, setReadIds] = useState<Set<number>>(new Set());
  const { data: messages = [] } = useSWR("/api/messages", fetcher, { refreshInterval: 10000 });
  const { data: unreadMessagesData, mutate: mutateUnreadMessages } = useSWR("/api/messages/unread-count", unreadFetcher, { refreshInterval: 10000 });
  const unreadMessagesCount = unreadMessagesData?.count || 0;
  const [showMessages, setShowMessages] = useState(false);

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
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Toggle mobile menu"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          {/* Search Bar */}
          <div className={`${isMobileMenuOpen ? 'hidden' : 'flex'}`}>
            <SearchBar />
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>

            {/* Messages */}
            <div className="relative">
              <button 
                className="relative p-2.5 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
                aria-label="Open messages"
                onClick={() => setShowMessages((v) => !v)}
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-blue-500 text-white rounded-full text-xs font-medium animate-bounce">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>
              {showMessages && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-900 dark:text-white">Recent Messages</div>
                  <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                    {messages.slice(0, 5).map((m: any) => (
                      <li key={m.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                        onClick={() => { router.push(`/list/messages`); setShowMessages(false); }}>
                        {!m.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        )}
                        <div className="flex-1">
                          <div className={`flex justify-between items-center ${!m.read ? 'font-bold' : ''}`}>
                            <span className="text-gray-800 dark:text-gray-200 text-sm">{m.title}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(m.date).toLocaleDateString()}</span>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">{m.content}</div>
                        </div>
                      </li>
                    ))}
                    {messages.length === 0 && (
                      <li className="p-3 text-gray-500 dark:text-gray-400 text-sm">No messages</li>
                    )}
                  </ul>
                  <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-center">
                    <button className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline" onClick={() => { router.push("/list/messages"); setShowMessages(false); }}>View all messages</button>
                  </div>
                </div>
              )}
            </div>

            {/* Announcements */}
            <div className="relative">
            <button 
              className="relative p-2.5 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label="View announcements"
                onClick={() => setShowAnnouncements((v) => !v)}
            >
              <MegaphoneIcon className="w-5 h-5" />
                {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs font-medium animate-bounce">
                    {unreadCount}
              </span>
                )}
            </button>
              {showAnnouncements && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-900 dark:text-white">Recent Announcements</div>
                  <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                    {announcements.slice(0, 5).map((a: any) => (
                      <li key={a.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                        onClick={async () => { await handleMarkAsRead(a.id); router.push(`/announcements/${a.id}`); setShowAnnouncements(false); }}>
                        {((!a.read && !readIds.has(a.id)) || unreadCount > 0) && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        )}
                        <div className="flex-1">
                          <div className={`flex justify-between items-center ${((!a.read && !readIds.has(a.id)) || unreadCount > 0) ? 'font-bold' : ''}`}>
                            <span className="text-gray-800 dark:text-gray-200 text-sm">{a.title}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(a.date).toLocaleDateString()}</span>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">{a.content || a.description}</div>
                        </div>
                      </li>
                    ))}
                    {announcements.length === 0 && (
                      <li className="p-3 text-gray-500 dark:text-gray-400 text-sm">No announcements</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* User Info & Menu */}
            <div className="relative flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{fullName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{role}</p>
              </div>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform duration-300"
              >
                <Image 
                  src={user?.user_metadata?.avatar_url || "/noAvatar.png"} 
                  alt="User Avatar" 
                  width={40} 
                  height={40}
                  className="object-cover"
                />
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-50">
                  <div className="md:hidden px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{fullName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{role}</p>
                  </div>
                  <button 
                    onClick={() => { router.push("/profile"); setShowUserMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <UserCircleIcon className="w-4 h-4" />
                    Profile
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 border-t border-gray-100 dark:border-gray-700 mt-1"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 px-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                  <Image 
                    src={user?.user_metadata?.avatar_url || "/noAvatar.png"} 
                    alt="User Avatar" 
                    width={40} 
                    height={40}
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {fullName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {role}
                  </p>
                </div>
              </div>
              <SearchBar />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
