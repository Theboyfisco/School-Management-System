import BigCalendar from "./BigCalender";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

const BigCalendarContainer = async ({
  type,
  id,
}: {
  type?: "teacherId" | "classId";
  id?: string | number;
}) => {
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

  // Get events for the next 3 months (for calendar view)
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

  query.AND = [
    {
      OR: [
        { startTime: { gte: new Date() } }, // Upcoming events
        { 
          AND: [
            { startTime: { lte: new Date() } },
            { endTime: { gte: new Date() } }
          ]
        }, // Ongoing events
        { startTime: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } // Past 30 days
      ]
    }
  ];

  const events = await prisma.event.findMany({
    where: query,
    include: {
      class: true,
    },
    orderBy: { startTime: "asc" },
  });

  return (
    <BigCalendar 
      events={events} 
      role={role} 
      currentUserId={currentUserId ?? undefined}
    />
  );
};

export default BigCalendarContainer;
