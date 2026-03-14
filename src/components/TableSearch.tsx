"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

const TableSearch = ({ placeholder }: { placeholder?: string }) => {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = (e.currentTarget.elements.namedItem("search") as HTMLInputElement).value;
    updateSearch(value);
  };

  const updateSearch = (value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.set("page", "1"); // Reset to first page on new search
    router.push(`${window.location.pathname}?${params}`);
  };

  // Debounced search for better UX
  let timeout: NodeJS.Timeout;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      updateSearch(value);
    }, 500);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full md:w-auto flex items-center gap-2 px-3.5 py-2 bg-surface-100/50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 rounded-xl focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500/50 transition-all duration-200"
    >
      <button type="submit" className="text-surface-400 dark:text-surface-500 hover:text-primary-500 transition-colors" aria-label="Search">
        <MagnifyingGlassIcon className="w-5 h-5 stroke-[2]" />
      </button>
      <input
        type="text"
        name="search"
        defaultValue={new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get("search") || ""}
        onChange={handleChange}
        placeholder={placeholder || "Search..."}
        className="bg-transparent outline-none text-sm text-surface-900 dark:text-surface-100 placeholder-surface-400 dark:placeholder-surface-500 w-full md:w-[200px] lg:w-[320px] font-medium"
      />
    </form>
  );
};

export default TableSearch;
