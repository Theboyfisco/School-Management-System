import EventCalendar from "./EventCalendar";
import EventList from "./EventList";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

const EventCalendarContainer = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { date } = searchParams;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role as string;
  const currentUserId = user?.id;

  // Build query based on role
  const query: any = {};

  if (role === "teacher") {
    // Teacher: their classes + school-wide events
    const teacherClasses = await prisma.class.findMany({
      where: {
        lessons: {
          some: {
            teacherId: currentUserId!,
          },
        },
      },
      select: { id: true },
    });
    const teacherClassIds = teacherClasses.map(c => c.id);
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

  // Get upcoming and ongoing events (next 30 days + ongoing)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  query.OR = query.OR || [];
  query.AND = [
    {
      OR: [
        { startTime: { gte: new Date() } }, // Upcoming events
        { 
          AND: [
            { startTime: { lte: new Date() } },
            { endTime: { gte: new Date() } }
          ]
        } // Ongoing events
      ]
    }
  ];

  const events = await prisma.event.findMany({
    where: query,
    include: {
      class: true,
    },
    orderBy: { startTime: "asc" },
    take: 20, // Limit to 20 events for dashboard
  });

  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-md transition-colors duration-200">
      <EventCalendar 
        events={events} 
        role={role} 
        currentUserId={currentUserId ?? undefined}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold my-2 text-gray-900 dark:text-white">Events</h1>
        <button aria-label="More event options" className="hover:bg-gray-100 dark:hover:bg-gray-700/50 p-1 rounded-full transition-colors text-gray-500">
          <EllipsisHorizontalIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <EventList dateParam={new Date().toISOString().split('T')[0]} />
      </div>
    </div>
  );
};

export default EventCalendarContainer;
