import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import Performance from "@/components/Performance";
import StudentAttendanceCard from "@/components/StudentAttendanceCard";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import Messages from "@/components/Messages";
import QuickActionsWrapper from "@/components/QuickActionsWrapper";
import UserCard from "@/components/UserCard";

import { createClient } from "@/utils/supabase/server";

const StudentPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const currentUserId = user?.id || "student123";

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8" style={{ background: 'var(--gradient-cool)' }}>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">Welcome back, Student!</h1>
          <p className="mt-1.5 text-blue-100 text-sm sm:text-base">Here&apos;s your academic overview and learning progress</p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
      </div>

      {/* Quick Stats */}
      <div>
        <h2 className="section-header mb-3">My Overview</h2>
        <div className="grid grid-cols-1 gap-4">
          <UserCard type="student" />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Main content — 3 columns */}
        <div className="xl:col-span-3 space-y-4">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card overflow-hidden flex flex-col">
              <div className="p-4 border-b border-surface-100 dark:border-surface-700/50">
                <h3 className="section-header">Academic Performance</h3>
                <p className="section-subheader">Your grades and progress</p>
              </div>
              <div className="flex-1 p-4 min-h-[300px]">
                <div className="h-72 w-full">
                  <Performance />
                </div>
              </div>
            </div>

            <div className="card overflow-hidden flex flex-col">
              <div className="p-4 border-b border-surface-100 dark:border-surface-700/50">
                <h3 className="section-header">My Attendance</h3>
                <p className="section-subheader">Your attendance record</p>
              </div>
              <div className="flex-1 p-4 flex items-center justify-center min-h-[300px]">
                <div className="h-72 w-full flex items-center justify-center">
                   <StudentAttendanceCard id={currentUserId} />
                </div>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden flex flex-col">
            <div className="p-4 border-b border-surface-100 dark:border-surface-700/50">
              <h3 className="section-header">My Schedule</h3>
              <p className="section-subheader">Your class timetable</p>
            </div>
            <div className="flex-1 p-4 min-h-[380px]">
              <div className="h-96 w-full">
                <BigCalendarContainer />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar column */}
        <div className="xl:col-span-1 space-y-4">
          <QuickActionsWrapper role="student" />
          
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

export default StudentPage;
