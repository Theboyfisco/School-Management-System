"use client";

import { useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

/**
 * Custom hook to listen for real-time changes on a specific database table.
 * Automatically refreshes the current route on any change unless a custom handler is provided.
 * 
 * @param table - The database table to subscribe to (e.g., 'announcement', 'message')
 * @param onUpdate - Optional callback to run when a change is detected
 */
export function useRealtime(table: string, onUpdate?: (payload: any) => void) {
  const router = useRouter();
  const supabase = useRef(createClient()).current;

  useEffect(() => {
    const channel = supabase
      .channel(`realtime_${table}_${Math.random().toString(36).substring(7)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: table },
        (payload) => {
          if (onUpdate) {
            onUpdate(payload);
          } else {
            router.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, onUpdate, router, supabase]);
}
