import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableRow from "@/components/TableRow";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Event, Prisma } from "@prisma/client";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import React from "react";
import ExportEventsButton from "@/components/ExportEventsButton";
import { 
  PlusIcon, 
  FunnelIcon, 
  ArrowUpIcon, 
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarDaysIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import Link from "next/link";

// Helper for role display
const roleDisplay = {
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
  parent: "Parent",
};

type EventList = Event & { class: Class | null };

type FilterOptions = {
  classes?: Class[];
};

// Helper function to get event status
const getEventStatus = (startTime: Date, endTime: Date) => {
  const now = new Date();
  if (now < startTime) return { status: 'upcoming', label: 'Upcoming', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' };
  if (now >= startTime && now <= endTime) return { status: 'ongoing', label: 'Ongoing', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
  return { status: 'past', label: 'Past', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' };
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

const EventListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role as string;
  const currentUserId = user?.id;

  // --- FILTER OPTIONS BASED ON ROLE ---
  let filterOptions: FilterOptions = {};

  if (role === "admin") {
    // Admin: all classes
    const classes = await prisma.class.findMany();
    filterOptions = { classes };
  } else if (role === "teacher") {
    // Teacher: only their classes
    const teacherClasses = await prisma.class.findMany({
      where: {
        lessons: {
          some: {
            teacherId: currentUserId!,
          },
        },
      },
    });
    filterOptions = { classes: teacherClasses };
  }

  // --- QUERY LOGIC BASED ON ROLE ---
  const { page, sortBy, sortOrder, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;
  const query: Prisma.EventWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            if (value === "school-wide") {
              query.classId = null;
            } else {
              query.classId = parseInt(value);
            }
            break;
          case "status":
            const now = new Date();
            switch (value) {
              case "upcoming":
                query.startTime = { gt: now };
                break;
              case "ongoing":
                query.AND = [
                  { startTime: { lte: now } },
                  { endTime: { gte: now } },
                ];
                break;
              case "past":
                query.endTime = { lt: now };
                break;
            }
            break;
          case "dateFrom":
            query.startTime = { gte: new Date(value) };
            break;
          case "dateTo":
            query.endTime = { lte: new Date(value) };
            break;
          case "search":
            query.OR = [
              { title: { contains: value, mode: "insensitive" } },
              { description: { contains: value, mode: "insensitive" } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // Role-based data restriction
  if (role === "teacher") {
    // Teacher: their classes + school-wide events
    const teacherClassIds = filterOptions.classes?.map(c => c.id) || [];
    query.OR = [
      { classId: null }, // School-wide events
      { classId: { in: teacherClassIds } }, // Their classes
    ];
  } else if (role === "student") {
    // Student: their class + school-wide events
    const studentClass = await prisma.student.findUnique({
      where: { id: currentUserId! },
      select: { classId: true },
    });
    query.OR = [
      { classId: null }, // School-wide events
      { classId: studentClass?.classId }, // Their class
    ];
  } else if (role === "parent") {
    // Parent: their children's classes + school-wide events
    const children = await prisma.student.findMany({
      where: { parentId: currentUserId! },
      select: { classId: true },
    });
    const childClassIds = children.map(c => c.classId);
    query.OR = [
      { classId: null }, // School-wide events
      { classId: { in: childClassIds } }, // Their children's classes
    ];
  }

  // Sorting
  let orderBy: Prisma.EventOrderByWithRelationInput = {};
  if (sortBy) {
    switch (sortBy) {
      case 'event':
        orderBy.title = sortOrder === 'desc' ? 'desc' : 'asc';
        break;
      case 'date':
        orderBy.startTime = sortOrder === 'desc' ? 'desc' : 'asc';
        break;
      default:
        orderBy.startTime = 'asc';
    }
  } else {
    orderBy.startTime = 'asc';
  }

  // --- FETCH DATA ---
  const [data, count] = await prisma.$transaction([
    prisma.event.findMany({
      where: query,
      include: {
        class: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy,
    }),
    prisma.event.count({ where: query }),
  ]);

  // --- COLUMNS BASED ON ROLE ---
  const columns = [
    {
      header: "Event",
      accessor: "event",
      sortable: true,
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell",
      sortable: true,
    },
    {
      header: "Time",
      accessor: "time",
      className: "hidden lg:table-cell",
    },
    ...((role === "admin" || role === "teacher")
      ? [{ header: "Actions", accessor: "actions" }]
      : []),
  ];

  // --- FILTERS UI ---
  function Filters() {
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Class filter (admin, teacher) */}
        {(role === "admin" || role === "teacher") && filterOptions.classes && (
          <select
            name="classId"
            defaultValue={searchParams.classId || ""}
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            <option value="">All Events</option>
            <option value="school-wide">School-wide Events</option>
            {filterOptions.classes.map(c => (
              <option key={c.id} value={c.id}>{c.name} Events</option>
            ))}
          </select>
        )}
        {/* Status filter (all roles) */}
        <select
          name="status"
          defaultValue={searchParams.status || ""}
          className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
        >
          <option value="">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="past">Past</option>
        </select>
        {/* Date range filters (all roles) */}
        <input
          type="date"
          name="dateFrom"
          defaultValue={searchParams.dateFrom || ""}
          className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          placeholder="From date"
        />
        <input
          type="date"
          name="dateTo"
          defaultValue={searchParams.dateTo || ""}
          className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          placeholder="To date"
        />
        {/* Search bar (all roles) */}
        <TableSearch />
        {/* Export button (admin, teacher) */}
        {(role === "admin" || role === "teacher") && (
          <ExportEventsButton events={data} />
        )}
      </div>
    );
  }

  // Export function
  function exportEventsToCSV(events: EventList[]) {
    const headers = ['Title', 'Description', 'Start Time', 'End Time', 'Type', 'Status'];
    const csvContent = [
      headers.join(','),
      ...events.map(event => {
        const eventStatus = getEventStatus(event.startTime, event.endTime);
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

  // --- MAIN RENDER ---
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white font-display">Events</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1 uppercase tracking-wider text-[11px] font-bold">
            Viewing as: {roleDisplay[role as keyof typeof roleDisplay] || "User"}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {(role === "admin" || role === "teacher") && (
            <FormContainer table="event" type="create">
              <button className="btn btn-primary gap-2 shadow-glow shadow-primary-500/20">
                <PlusIcon className="w-5 h-5" />
                <span>New Event</span>
              </button>
            </FormContainer>
          )}
        </div>
      </div>

      {/* Stats Summary Card */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-8 md:gap-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-600 dark:text-primary-400">
              <CalendarDaysIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Total Events</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">{count}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-success-50 dark:bg-success-500/10 flex items-center justify-center text-success-600 dark:text-success-400">
              <ClockIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Upcoming</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">
                {data.filter(event => new Date(event.startTime) > new Date()).length}
              </p>
            </div>
          </div>

          <div className="h-10 w-px bg-surface-100 dark:bg-surface-700/50 hidden md:block" />

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center text-accent-600 dark:text-accent-400">
              <UserGroupIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Classes Involved</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">
                {new Set(data.map(event => event.classId).filter(Boolean)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <TableSearch placeholder="Search events..." />
          
          <select
            name="status"
            defaultValue={searchParams.status || ""}
            className="select max-w-[140px]"
          >
            <option value="">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="past">Past</option>
          </select>

          {(role === "admin" || role === "teacher") && filterOptions.classes && (
            <select
              name="classId"
              defaultValue={searchParams.classId || ""}
              className="select max-w-[160px]"
            >
              <option value="">All Events</option>
              <option value="school-wide">School-wide</option>
              {filterOptions.classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          {(role === "admin" || role === "teacher") && (
            <ExportEventsButton events={data} />
          )}
          <div className="h-8 w-px bg-surface-100 dark:bg-surface-700 mx-1 hidden sm:block" />
          <button className="btn btn-secondary btn-icon" title="Sort Order">
            <ArrowUpIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <Table 
        columns={columns}
        emptyMessage="No events scheduled matching your criteria."
      >
        {data.map((item, index) => {
          const { label, color, status } = getEventStatus(item.startTime, item.endTime);
          return (
            <TableRow key={item.id} index={index}>
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-11 h-11 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-glow shadow-orange-500/10 transition-transform hover:scale-105`}>
                    <CalendarDaysIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-surface-900 dark:text-white font-display">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${status === 'ongoing' ? 'bg-success-500 animate-pulse' : status === 'upcoming' ? 'bg-primary-500' : 'bg-surface-400'}`} />
                      <span className="text-[11px] font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                        {label} • {item.classId ? item.class?.name : 'School-wide'}
                      </span>
                    </div>
                  </div>
                </div>
              </td>
              
              <td className="hidden md:table-cell px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-surface-900 dark:text-white">
                    {new Date(item.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="text-[11px] font-medium text-surface-500 dark:text-surface-400 italic">
                    {getRelativeTime(item.startTime)}
                  </span>
                </div>
              </td>

              <td className="hidden lg:table-cell px-6 py-4">
                <div className="flex items-center gap-2.5 text-surface-600 dark:text-surface-400">
                  <div className="p-1.5 rounded-lg bg-surface-50 dark:bg-surface-800">
                    <ClockIcon className="w-4 h-4 text-primary-500" />
                  </div>
                  <div className="text-[13px] font-medium">
                    {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    <span className="mx-1 opacity-50">-</span>
                    {new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </td>

              {(role === "admin" || role === "teacher") && (
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 justify-end">
                    <Link href={`/list/events/${item.id}`}>
                      <button className="btn btn-secondary btn-icon btn-sm group" title="View Details">
                        <EyeIcon className="w-4 h-4 text-surface-400 group-hover:text-primary-500" />
                      </button>
                    </Link>
                    <FormContainer table="event" type="update" data={item}>
                      <button className="btn btn-secondary btn-icon btn-sm group" title="Edit Event">
                        <PencilIcon className="w-4 h-4 text-surface-400 group-hover:text-amber-500" />
                      </button>
                    </FormContainer>
                    <FormContainer table="event" type="delete" id={item.id}>
                      <button className="btn btn-secondary btn-icon btn-sm group" title="Delete Event">
                        <TrashIcon className="w-4 h-4 text-surface-400 group-hover:text-danger-500" />
                      </button>
                    </FormContainer>
                  </div>
                </td>
              )}
            </TableRow>
          );
        })}
      </Table>

      <Pagination page={p} count={count} />
    </div>
  );
};

export default EventListPage;
