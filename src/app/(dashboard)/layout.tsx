import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex bg-surface-50 dark:bg-surface-900">
      {/* Sidebar */}
      <aside className="w-[72px] lg:w-[260px] bg-white dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700/50 flex flex-col h-screen sticky top-0 transition-all duration-300">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-surface-100 dark:border-surface-700/50">
          <Link
            href="/"
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-glow flex-shrink-0 transition-transform group-hover:scale-105">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                width={24} 
                height={24}
                className="brightness-0 invert" 
              />
            </div>
            <div className="hidden lg:block">
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 scrollbar-hide">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
