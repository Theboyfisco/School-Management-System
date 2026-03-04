import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import CountChart from "@/components/CountChart";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import FinanceChart from "@/components/FinanceChart";
import Messages from "@/components/Messages";
import QuickActionsWrapper from "@/components/QuickActionsWrapper";
import UserCard from "@/components/UserCard";

const ParentPage = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8" style={{ background: 'var(--gradient-warm)' }}>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">Welcome back, Parent!</h1>
          <p className="mt-1.5 text-orange-100 text-sm sm:text-base">Here&apos;s your child&apos;s academic overview and progress</p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
      </div>

      {/* Quick Stats */}
      <div>
        <h2 className="section-header mb-3">Family Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UserCard type="parent" />
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
                <h3 className="section-header">Child&apos;s Statistics</h3>
                <p className="section-subheader">Academic performance metrics</p>
              </div>
              <div className="flex-1 p-4 flex items-center justify-center min-h-[300px]">
                <CountChart data={[
                  { name: 'Teachers', value: 2, color: 'bg-accent-500' },
                  { name: 'Students', value: 2, color: 'bg-success-500' },
                  { name: 'Classes', value: 1, color: 'bg-primary-500' },
                  { name: 'Parents', value: 1, color: 'bg-warning-500' },
                  { name: 'Events', value: 0, color: 'bg-danger-500' },
                  { name: 'Ongoing', value: 0, color: 'bg-warning-400' },
                ]} />
              </div>
            </div>

            <div className="card overflow-hidden flex flex-col">
              <div className="p-4 border-b border-surface-100 dark:border-surface-700/50">
                <h3 className="section-header">Child&apos;s Attendance</h3>
                <p className="section-subheader">School attendance record</p>
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
              <h3 className="section-header">Child&apos;s Performance</h3>
              <p className="section-subheader">Grades and academic progress</p>
            </div>
            <div className="flex-1 p-4 min-h-[380px]">
              <div className="h-96 w-full">
                <FinanceChart />
              </div>
            </div>
          </div>

          <div className="card overflow-hidden flex flex-col">
            <div className="p-4 border-b border-surface-100 dark:border-surface-700/50">
              <h3 className="section-header">Child&apos;s Schedule</h3>
              <p className="section-subheader">Class timetable and activities</p>
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
          <QuickActionsWrapper role="parent" />
          
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

export default ParentPage;
