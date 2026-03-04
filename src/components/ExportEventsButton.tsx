"use client";

import React from "react";

export type ExportEvent = {
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  class?: { name: string } | null;
  classId?: number | null;
};

function getEventStatus(startTime: Date, endTime: Date) {
  const now = new Date();
  if (now < startTime) return { label: "Upcoming" };
  if (now >= startTime && now <= endTime) return { label: "Ongoing" };
  return { label: "Past" };
}

export default function ExportEventsButton({ events }: { events: ExportEvent[] }) {
  function exportEventsToCSV(events: ExportEvent[]) {
    const headers = ['Title', 'Description', 'Start Time', 'End Time', 'Type', 'Status'];
    const csvContent = [
      headers.join(','),
      ...events.map(event => {
        const eventStatus = getEventStatus(new Date(event.startTime), new Date(event.endTime));
        const isSchoolWide = !event.classId;
        return [
          `"${event.title}"`,
          `"${event.description || ''}"`,
          `"${new Date(event.startTime).toLocaleString()}"`,
          `"${new Date(event.endTime).toLocaleString()}"`,
          `"${isSchoolWide ? 'School-wide' : event.class?.name || 'Unknown Class'}"`,
          `"${eventStatus.label}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `events_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <button
      onClick={() => exportEventsToCSV(events)}
      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded border border-green-600 hover:border-green-700 transition-colors text-sm font-medium"
    >
      📊 Export CSV
    </button>
  );
} 