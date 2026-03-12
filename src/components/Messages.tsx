"use client";

import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import React from "react";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

type Message = {
  id: number;
  title: string;
  content: string;
  date: string;
  category: string;
  priority: string;
  senderId: string;
  senderRole: string;
  recipientId?: string;
  recipientRole?: string;
  isBroadcast: boolean;
  read: boolean;
  parent?: Message;
  replies?: Message[];
  attachments?: any[];
};

const fetcher = (url: string) => fetch(url).then(res => res.json());

function MessageModal({ id, onClose }: { id: number|null, onClose: () => void }) {
  const { data: message, isLoading } = useSWR(id ? `/api/messages/${id}` : null, fetcher);
  
  if (!id) return null;
  
  const isValid = message && typeof message === 'object' && !Array.isArray(message);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full p-6 relative max-h-[80vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 dark:hover:text-white text-xl"
        >
          &times;
        </button>
        
        {isLoading || !isValid ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{message.title}</h2>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  message.priority === 'URGENT' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  message.priority === 'HIGH' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                  message.priority === 'NORMAL' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {message.priority}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  message.category === 'EMERGENCY' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  message.category === 'ACADEMIC' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  message.category === 'ADMINISTRATIVE' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {message.category}
                </span>
              </div>
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {new Date(message.date).toLocaleDateString()} at {new Date(message.date).toLocaleTimeString()}
              {message.isBroadcast && <span className="ml-2 text-blue-600 dark:text-blue-400">(Broadcast)</span>}
            </div>
            
            <div className="prose dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Attachments</h4>
                <ul className="space-y-2">
                  {message.attachments.map((file: any) => (
                    <li key={file.id} className="flex items-center gap-2">
                      <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">
                        {file.fileName}
                      </a>
                      <span className="text-xs text-gray-500 dark:text-gray-400">({(file.fileSize / 1024 / 1024).toFixed(2)} MB, {file.fileType})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Thread replies */}
            {message.replies && message.replies.length > 0 && (
              <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Replies</h3>
                <div className="space-y-3">
                  {message.replies.map((reply: Message) => (
                    <div key={reply.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {reply.senderRole} • {new Date(reply.date).toLocaleDateString()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          reply.priority === 'URGENT' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          reply.priority === 'HIGH' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {reply.priority}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {reply.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const Messages = ({ externalRefresh }: { externalRefresh?: boolean }) => {
  const { data = [], mutate } = useSWR("/api/messages", fetcher);
  const router = useRouter();
  const [modalId, setModalId] = useState<number|null>(null);

  // Optionally allow parent to trigger refresh
  useEffect(() => {
    if (externalRefresh) mutate();
  }, [externalRefresh, mutate]);

  // Get recent messages (limit to 5)
  const recentMessages = Array.isArray(data) ? data.slice(0, 5) : [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-md p-3 transition-colors duration-200">
      <MessageModal id={modalId} onClose={() => setModalId(null)} />
      
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Messages</h1>
        <button
          onClick={() => router.push("/list/messages")}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="View all messages"
        >
          <EllipsisHorizontalIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      
      <div className="mt-3 space-y-2">
        {recentMessages.length > 0 ? (
          recentMessages.map((message: Message) => (
            <div
              key={message.id}
              className={`p-3 rounded-md border-2 transition-colors duration-200 cursor-pointer ${
                message.read 
                  ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50' 
                  : 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20'
              }`}
              onClick={() => setModalId(message.id)}
            >
              <div className="flex items-center justify-between">
                <h1 className={`font-semibold text-sm ${
                  message.read 
                    ? 'text-gray-900 dark:text-gray-200' 
                    : 'text-blue-900 dark:text-blue-200'
                }`}>
                  {message.title}
                </h1>
                <div className="flex items-center gap-2">
                  {!message.read && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    {new Date(message.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  message.priority === 'URGENT' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  message.priority === 'HIGH' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  {message.priority}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  message.category === 'EMERGENCY' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  message.category === 'ACADEMIC' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  message.category === 'ADMINISTRATIVE' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {message.category}
                </span>
                {message.isBroadcast && (
                  <span className="text-blue-600 dark:text-blue-400 text-xs">Broadcast</span>
                )}
              </div>
              
              <p className="mt-1 text-gray-600 dark:text-gray-400 text-xs line-clamp-2">
                {message.content}
              </p>
            </div>
          ))
        ) : (
          <div className="text-gray-500 dark:text-gray-400 text-sm">No messages found.</div>
        )}
      </div>
    </div>
  );
};

export default Messages; 