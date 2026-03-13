"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Dialog, Transition, Combobox } from "@headlessui/react";
import { 
  MagnifyingGlassIcon,
  UserIcon,
  AcademicCapIcon,
  HomeIcon,
  CalendarIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  MegaphoneIcon,
  BuildingLibraryIcon
} from "@heroicons/react/24/outline";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type SearchResult = {
  id: string | number;
  title: string;
  subtitle: string;
  href: string;
  type: "teacher" | "student" | "class" | "page" | "action";
};

const STATIC_PAGES: SearchResult[] = [
  { id: "p1", title: "Home Dashboard", subtitle: "Main overview", href: "/", type: "page" },
  { id: "p2", title: "Teachers List", subtitle: "Manage faculty", href: "/list/teachers", type: "page" },
  { id: "p3", title: "Students List", subtitle: "Manage students", href: "/list/students", type: "page" },
  { id: "p4", title: "Parents List", subtitle: "Manage parents", href: "/list/parents", type: "page" },
  { id: "p5", title: "Subjects List", subtitle: "Manage curriculum", href: "/list/subjects", type: "page" },
  { id: "p6", title: "Classes List", subtitle: "Manage sections", href: "/list/classes", type: "page" },
  { id: "p7", title: "Announcements", subtitle: "School news", href: "/list/announcements", type: "page" },
  { id: "p8", title: "Messages", subtitle: "Communication center", href: "/list/messages", type: "page" },
];

export default function CommandBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-command-bar", handleOpen);
    return () => window.removeEventListener("open-command-bar", handleOpen);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchResults, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const filteredPages = query === "" 
    ? STATIC_PAGES 
    : STATIC_PAGES.filter(page => 
        page.title.toLowerCase().includes(query.toLowerCase()) || 
        page.subtitle.toLowerCase().includes(query.toLowerCase())
      );

  const allResults = [...results, ...filteredPages];

  return (
    <Transition.Root show={isOpen} as={Fragment} afterLeave={() => setQuery("")} appear>
      <Dialog as="div" className="relative z-50" onClose={setIsOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-surface-500/75 transition-opacity dark:bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-2xl transform divide-y divide-surface-100 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all dark:bg-surface-900 dark:divide-surface-800 dark:ring-white/10">
              <Combobox onChange={(item: SearchResult | null) => {
                if (item) router.push(item.href);
                setIsOpen(false);
              }}>
                <div className="relative">
                  <MagnifyingGlassIcon
                    className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-surface-400"
                    aria-hidden="true"
                  />
                  <Combobox.Input
                    className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-surface-900 placeholder:text-surface-400 focus:ring-0 sm:text-sm dark:text-white"
                    placeholder="Search for students, teachers, classes or pages..."
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>

                {allResults.length > 0 && (
                  <Combobox.Options static className="max-h-96 scroll-py-3 overflow-y-auto p-3">
                    {allResults.map((item) => (
                      <Combobox.Option
                        key={`${item.type}-${item.id}`}
                        value={item}
                        className={({ active }) =>
                          cn(
                            "flex cursor-default select-none rounded-xl p-3 items-center transition-colors",
                            active && "bg-primary-50 dark:bg-primary-900/20"
                          )
                        }
                      >
                        {({ active }) => (
                          <>
                            <div
                              className={cn(
                                "flex h-10 w-10 flex-none items-center justify-center rounded-lg border border-surface-200 bg-white dark:bg-surface-800 dark:border-surface-700",
                                active && "border-primary-200 dark:border-primary-500/50"
                              )}
                            >
                              {item.type === "teacher" && <AcademicCapIcon className="h-5 w-5 text-accent-500" />}
                              {item.type === "student" && <AcademicCapIcon className="h-5 w-5 text-primary-500" />}
                              {item.type === "class" && <BuildingLibraryIcon className="h-5 w-5 text-purple-500" />}
                              {item.type === "page" && <HomeIcon className="h-5 w-5 text-surface-500" />}
                            </div>
                            <div className="ml-4 flex-auto">
                              <p
                                className={cn(
                                  "text-sm font-semibold text-surface-900 dark:text-white",
                                  active && "text-primary-600 dark:text-primary-400"
                                )}
                              >
                                {item.title}
                              </p>
                              <p className="text-xs text-surface-500">{item.subtitle}</p>
                            </div>
                            {active && (
                              <div className="ml-3 flex-none text-xs font-semibold text-primary-600 dark:text-primary-400">
                                Press Enter
                              </div>
                            )}
                          </>
                        )}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                )}

                {query !== "" && allResults.length === 0 && !isLoading && (
                  <div className="py-14 px-6 text-center sm:px-14">
                    <MagnifyingGlassIcon className="mx-auto h-6 w-6 text-surface-400" />
                    <p className="mt-4 text-sm text-surface-900 dark:text-white">
                      No results found for <span className="font-semibold underline decoration-accent-500">&quot;{query}&quot;</span>
                    </p>
                  </div>
                )}
                
                <div className="bg-surface-50 px-4 py-2.5 text-xs text-surface-500 dark:bg-surface-800/50 flex justify-between items-center">
                   <div>
                     <kbd className="font-sans font-semibold text-surface-900 dark:text-surface-300">Esc</kbd> to close
                   </div>
                   <div className="flex gap-4">
                     <span>Teachers</span>
                     <span>Students</span>
                     <span>Pages</span>
                   </div>
                </div>
              </Combobox>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
