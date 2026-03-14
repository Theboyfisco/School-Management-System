import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import CountChart from "@/components/CountChart";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import FinanceChart from "@/components/FinanceChart";
import Messages from "@/components/Messages";
import QuickActionsWrapper from "@/components/QuickActionsWrapper";
import UserCard from "@/components/UserCard";
import prisma from "@/lib/prisma";

import { Suspense } from "react";
import { ChartSkeleton } from "@/components/Skeleton";

const AdminPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const [adminCount, teacherCount, studentCount, parentCount, classCount, eventCount] = await prisma.$transaction([
    prisma.admin.count(),
    prisma.teacher.count(),
    prisma.student.count(),
    prisma.parent.count(),
    prisma.class.count(),
    prisma.event.count(),
  ]);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8" style={{ background: 'var(--gradient-primary)' }}>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">Welcome back, Administrator!</h1>
          <p className="mt-1.5 text-primary-200 text-sm sm:text-base">Here&apos;s your school overview for today</p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
      </div>

      {/* Quick Stats */}
      <div>
        <h2 className="section-header mb-3">School Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <UserCard type="admin" count={adminCount} />
          <UserCard type="teacher" count={teacherCount} />
          <UserCard type="student" count={studentCount} />
          <UserCard type="parent" count={parentCount} />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Main content — 3 columns */}
        <div className="xl:col-span-3 space-y-4">
          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card overflow-hidden flex flex-col">
              <div className="p-4 border-b border-surface-100 dark:border-surface-700/50">
                <h3 className="section-header">School Statistics</h3>
                <p className="section-subheader">Key metrics and trends</p>
              </div>
              <div className="flex-1 p-4 flex items-center justify-center min-h-[300px]">
                <CountChart data={[
                  { name: 'Teachers', value: teacherCount, color: 'bg-accent-500', href: '/list/teachers' },
                  { name: 'Students', value: studentCount, color: 'bg-success-500', href: '/list/students' },
                  { name: 'Classes', value: classCount, color: 'bg-primary-500', href: '/list/classes' },
                  { name: 'Parents', value: parentCount, color: 'bg-warning-500', href: '/list/parents' },
                  { name: 'Events', value: eventCount, color: 'bg-danger-500', href: '/list/events' },
                ]} />
              </div>
            </div>

            <div className="card overflow-hidden flex flex-col">
              <div className="p-4 border-b border-surface-100 dark:border-surface-700/50">
                <h3 className="section-header">Attendance Overview</h3>
                <p className="section-subheader">Student attendance patterns</p>
              </div>
              <div className="flex-1 p-4 min-h-[300px]">
                <Suspense fallback={<ChartSkeleton />}>
                  <AttendanceChartContainer />
                </Suspense>
              </div>
            </div>
          </div>

          {/* Finance & Calendar Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card overflow-hidden flex flex-col">
              <div className="p-4 border-b border-surface-100 dark:border-surface-700/50">
                <h3 className="section-header">Financial Overview</h3>
                <p className="section-subheader">Revenue, expenses, and budget</p>
              </div>
              <div className="flex-1 p-4 min-h-[380px]">
                <Suspense fallback={<ChartSkeleton />}>
                  <FinanceChart />
                </Suspense>
              </div>
            </div>

            <div className="card overflow-hidden flex flex-col">
              <div className="p-4 border-b border-surface-100 dark:border-surface-700/50">
                <h3 className="section-header">School Calendar</h3>
                <p className="section-subheader">Academic events and schedules</p>
              </div>
              <div className="flex-1 p-4 min-h-[380px]">
                <Suspense fallback={<ChartSkeleton />}>
                  <BigCalendarContainer />
                </Suspense>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar column */}
        <div className="xl:col-span-1 space-y-4">
          <QuickActionsWrapper role="admin" />
          
          <div className="card overflow-hidden flex flex-col max-h-72">
            <div className="p-4 border-b border-surface-100 dark:border-surface-700/50">
              <h3 className="section-header text-base">Announcements</h3>
              <p className="section-subheader">Important updates</p>
            </div>
            <div className="flex-1 p-3 overflow-auto">
              <Announcements />
            </div>
          </div>

          <div className="card overflow-hidden flex flex-col max-h-72">
            <div className="p-4 border-b border-surface-100 dark:border-surface-700/50">
              <h3 className="section-header text-base">Upcoming Events</h3>
              <p className="section-subheader">Next 7 days</p>
            </div>
            <div className="flex-1 p-3 overflow-auto">
              <EventCalendarContainer searchParams={searchParams} />
            </div>
          </div>

          <div className="card overflow-hidden flex flex-col max-h-72">
            <div className="p-4 border-b border-surface-100 dark:border-surface-700/50">
              <h3 className="section-header text-base">Messages</h3>
              <p className="section-subheader">Latest communications</p>
            </div>
            <div className="flex-1 p-3 overflow-auto">
              <Messages />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
