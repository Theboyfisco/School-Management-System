import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import CountChart from "@/components/CountChart";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import FinanceChart from "@/components/FinanceChart";
import Messages from "@/components/Messages";
import QuickActionsWrapper from "@/components/QuickActionsWrapper";
import UserCard from "@/components/UserCard";

const StudentPage = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
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
                <h3 className="section-header">My Statistics</h3>
                <p className="section-subheader">Your academic metrics</p>
              </div>
              <div className="flex-1 p-4 flex items-center justify-center min-h-[300px]">
                <CountChart data={[
                  { name: 'Teachers', value: 5, color: 'bg-accent-500' },
                  { name: 'Students', value: 20, color: 'bg-success-500' },
                  { name: 'Classes', value: 1, color: 'bg-primary-500' },
                  { name: 'Parents', value: 10, color: 'bg-warning-500' },
                  { name: 'Events', value: 1, color: 'bg-danger-500' },
                  { name: 'Ongoing', value: 0, color: 'bg-warning-400' },
                ]} />
              </div>
            </div>

            <div className="card overflow-hidden flex flex-col">
              <div className="p-4 border-b border-surface-100 dark:border-surface-700/50">
                <h3 className="section-header">My Attendance</h3>
                <p className="section-subheader">Your attendance record</p>
              </div>
              <div className="flex-1 p-4 flex items-center justify-center min-h-[300px]">
                <div className="h-72 w-full">
                  <AttendanceChartContainer />
                </div>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden flex flex-col">
            <div className="p-4 border-b border-surface-100 dark:border-surface-700/50">
              <h3 className="section-header">Academic Performance</h3>
              <p className="section-subheader">Grades and progress tracking</p>
            </div>
            <div className="flex-1 p-4 min-h-[380px]">
              <div className="h-96 w-full">
                <FinanceChart />
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
