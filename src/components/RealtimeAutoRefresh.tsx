"use client";

import { useRealtime } from "@/hooks/useRealtime";

/**
 * A lightweight client component that enables Supabase Realtime 
 * for the current page. when a change is detected in the specified 
 * table, it triggers a router.refresh() to pull new data from the server.
 */
export default function RealtimeAutoRefresh({ table }: { table: string }) {
  useRealtime(table);
  return null;
}
