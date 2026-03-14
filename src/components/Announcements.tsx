"use client";

import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import React from "react";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

type Announcement = {
  id: number;
  title: string;
  content: string;
  date: string;
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (Array.isArray(json)) return json;
  if (json && json.error) throw new Error(json.error);
  return [];
};

function AnnouncementModal({ id, onClose }: { id: number|null, onClose: () => void }) {
  const { data: announcement, isLoading } = useSWR(id ? `/api/announcements/${id}` : null, fetcher);
  if (!id) return null;
  const isValid = announcement && typeof announcement === 'object' && !Array.isArray(announcement);
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto max-h-[85vh] scrollbar-thin">
          {isLoading || !isValid ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500 animate-pulse">Loading announcement...</p>
            </div>
          ) : (
            (() => {
              const a = announcement as { title: string; date: string; classId?: number; description?: string };
              return (
                <article className="space-y-4">
                  <header>
                    <span className="inline-block px-2 py-1 rounded-md bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                      New Update
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                      {a.title}
                    </h2>
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400">
                      <time dateTime={a.date} className="flex items-center gap-1">
                         <span className="opacity-60 text-base">📅</span> {new Date(a.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                      </time>
                      {a.classId && (
                        <span className="flex items-center gap-1">
                          <span className="opacity-60 text-base">🏫</span> Class: {a.classId}
                        </span>
                      )}
                    </div>
                  </header>
                  <div className="prose dark:prose-invert prose-sm sm:prose-base max-w-none text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 pt-4 leading-relaxed">
                    {a.description}
                  </div>
                </article>
              );
            })()
          )}
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const Announcements = ({ externalRefresh }: { externalRefresh?: boolean }) => {
  const { data = [], mutate } = useSWR("/api/announcements", fetcher, { refreshInterval: 60000, revalidateOnFocus: false });
  const router = useRouter();
  const [modalId, setModalId] = useState<number|null>(null);

  // Optionally allow parent to trigger refresh
  useEffect(() => {
    if (externalRefresh) mutate();
  }, [externalRefresh, mutate]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-md p-3 transition-colors duration-200">
      <AnnouncementModal id={modalId} onClose={() => setModalId(null)} />
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Announcements</h1>
        <button
          onClick={() => router.push("/list/announcements")}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="View all announcements"
        >
          <EllipsisHorizontalIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      <div className="mt-3 space-y-2">
        {Array.isArray(data) && data.length > 0 ? (
          data.map((announcement: any) => (
            <div
              key={announcement.id}
              className="p-3 rounded-md border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 transition-colors duration-200 cursor-pointer"
              onClick={() => setModalId(announcement.id)}
            >
              <div className="flex items-center justify-between">
                <h1 className="font-semibold text-gray-900 dark:text-gray-200 text-sm">{announcement.title}</h1>
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  {new Date(announcement.date).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-1 text-gray-600 dark:text-gray-400 text-xs">{announcement.content || announcement.description}</p>
            </div>
          ))
        ) : (
          <div className="text-gray-500 dark:text-gray-400 text-sm">No announcements found.</div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
export { fetcher };
