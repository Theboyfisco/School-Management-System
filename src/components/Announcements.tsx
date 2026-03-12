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
  // Type guard: ensure announcement is a non-null object and not an array
  const isValid = announcement && typeof announcement === 'object' && !Array.isArray(announcement);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 dark:hover:text-white text-xl">&times;</button>
        {isLoading || !isValid ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          (() => {
            const a = announcement as { title: string; date: string; classId?: number; description?: string };
            return (
              <>
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{a.title}</h2>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {new Date(a.date).toLocaleDateString()} {a.classId && <span> | Class: {a.classId}</span>}
                </div>
                <div className="prose dark:prose-invert">
                  {a.description}
                </div>
              </>
            );
          })()
        )}
      </div>
    </div>
  );
}

const Announcements = ({ externalRefresh }: { externalRefresh?: boolean }) => {
  const { data = [], mutate } = useSWR("/api/announcements", fetcher);
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
