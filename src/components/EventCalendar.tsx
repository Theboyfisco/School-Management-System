"use client";

import { Event, Class } from "@prisma/client";
import { useState, useEffect } from "react";

type EventWithClass = Event & { class: Class | null };

type EventCalendarProps = {
  events: EventWithClass[];
  role?: string;
  currentUserId?: string;
};

// Helper function to get event status
const getEventStatus = (startTime: Date, endTime: Date) => {
  const now = new Date();
  if (now < startTime) return { status: 'upcoming', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-700', label: 'Upcoming' };
  if (now >= startTime && now <= endTime) return { status: 'ongoing', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-700', label: 'Ongoing' };
  return { status: 'past', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600', label: 'Past' };
};

// Helper function to get relative time
const getRelativeTime = (date: Date) => {
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  if (diffInDays > 0) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} from now`;
  if (diffInDays < 0) return `${Math.abs(diffInDays)} day${Math.abs(diffInDays) > 1 ? 's' : ''} ago`;
  if (diffInHours > 0) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} from now`;
  if (diffInHours < 0) return `${Math.abs(diffInHours)} hour${Math.abs(diffInHours) > 1 ? 's' : ''} ago`;
  return 'Now';
};

const EventCalendar = ({ events, role, currentUserId }: EventCalendarProps) => {
  const [filteredEvents, setFilteredEvents] = useState<EventWithClass[]>(events);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  // Filter events based on status and type
  useEffect(() => {
    let filtered = events;

    // Filter by status
    if (selectedStatus !== "all") {
      const now = new Date();
      filtered = filtered.filter(event => {
        const status = getEventStatus(event.startTime, event.endTime);
        return status.status === selectedStatus;
      });
    }

    // Filter by type (school-wide vs class-specific)
    if (selectedType !== "all") {
      filtered = filtered.filter(event => {
        if (selectedType === "school-wide") return !event.classId;
        if (selectedType === "class-specific") return !!event.classId;
        return true;
      });
    }

    setFilteredEvents(filtered);
  }, [events, selectedStatus, selectedType]);

  // Group events by date
  const groupEventsByDate = (events: EventWithClass[]) => {
    const grouped: { [key: string]: EventWithClass[] } = {};
    
    events.forEach(event => {
      const dateKey = new Date(event.startTime).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return grouped;
  };

  const groupedEvents = groupEventsByDate(filteredEvents);
  const sortedDates = Object.keys(groupedEvents).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Upcoming Events
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span>School-wide</span>
            <span className="w-3 h-3 rounded-full bg-purple-500 ml-2"></span>
            <span>Class-specific</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-lamaSky"
          >
            <option value="all">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="past">Past</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-lamaSky"
          >
            <option value="all">All Types</option>
            <option value="school-wide">School-wide</option>
            <option value="class-specific">Class-specific</option>
          </select>
        </div>
      </div>

      {/* Events List */}
      <div className="max-h-96 overflow-y-auto">
        {sortedDates.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">📅</div>
            <p>No events found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          sortedDates.map((dateKey) => {
            const dateEvents = groupedEvents[dateKey];
            const date = new Date(dateKey);
            
            return (
              <div key={dateKey} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {date.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h4>
                </div>
                
                {dateEvents.map((event) => {
                  const eventStatus = getEventStatus(event.startTime, event.endTime);
                  const isSchoolWide = !event.classId;
                  
                  return (
                    <div
                      key={event.id}
                      className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {/* Event Icon */}
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isSchoolWide 
                              ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200'
                              : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {isSchoolWide ? '🏫' : '🎓'}
                          </div>
                        </div>

                        {/* Event Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium text-gray-900 dark:text-white truncate">
                              {event.title}
                            </h5>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${eventStatus.color}`}>
                              {eventStatus.label}
                            </span>
                          </div>
                          
                          {event.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>
                              {new Date(event.startTime).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })} - {new Date(event.endTime).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            <span>•</span>
                            <span className={`font-medium ${
                              isSchoolWide 
                                ? 'text-purple-600 dark:text-purple-400'
                                : 'text-blue-600 dark:text-blue-400'
                            }`}>
                              {isSchoolWide ? 'School-wide' : event.class?.name || 'Unknown Class'}
                            </span>
                            <span>•</span>
                            <span>{getRelativeTime(event.startTime)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {filteredEvents.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default EventCalendar;
