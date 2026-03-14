"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { useSidebar } from "@/context/SidebarContext";

export default function MenuLogoutButton() {
  const router = useRouter();
  const { isOpen } = useSidebar();
  
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login"); // Redirect to login after logout
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 group"
      aria-label="Logout"
    >
      <Image
        src="/logout.png"
        alt=""
        width={18}
        height={18}
        className="opacity-70 group-hover:opacity-100 transition-opacity"
      />
      <span className="sidebar-label text-sm font-medium">Logout</span>
    </button>
  );
}