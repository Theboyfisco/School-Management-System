"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";

const MenuLogoutButton = dynamic(() => import("./MenuLogoutButton"), { ssr: false });

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface MenuClientProps {
  sections: MenuSection[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30
    }
  },
};

const MenuClient = ({ sections }: MenuClientProps) => {
  return (
    <nav className="h-full flex flex-col px-3 py-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="hidden lg:block px-3 mb-2 text-[10px] font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-[0.12em]">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                if (item.label === "Logout") {
                  return (
                    <motion.div key={item.label} variants={itemVariants}>
                      <MenuLogoutButton />
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={item.label}
                    variants={itemVariants}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2.5 text-surface-500 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-xl transition-all duration-200 group"
                      aria-label={item.label}
                    >
                      <span className="text-surface-400 dark:text-surface-500 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
                        {item.icon}
                      </span>
                      <span className="hidden lg:block text-sm font-medium">
                        {item.label}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </motion.div>
    </nav>
  );
};

export default MenuClient;
