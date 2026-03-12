import AttendanceChart from "./AttendanceChart";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

type AttendanceData = {
  date: Date;
  present: boolean;
};

const AttendanceChartContainer = async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role as string;
  const currentUserId = user?.id;

  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() - daysSinceMonday);

  // Role-based attendance query
  let attendanceQuery: any = {
    date: {
      gte: lastMonday,
    },
  };

  if (role === "teacher") {
    // Teacher: only their lessons
    const teacherLessons = await prisma.lesson.findMany({
      where: { teacherId: currentUserId! },
      select: { id: true },
    });
    attendanceQuery.lessonId = {
      in: teacherLessons.map(l => l.id),
    };
  } else if (role === "student") {
    // Student: only their own attendance
    attendanceQuery.studentId = currentUserId!;
  } else if (role === "parent") {
    // Parent: their children's attendance
    const children = await prisma.student.findMany({
      where: { parentId: currentUserId! },
      select: { id: true },
    });
    attendanceQuery.studentId = {
      in: children.map(c => c.id),
    };
  }
  // Admin: all attendance (no additional filters)

  const resData = await prisma.attendance.findMany({
    where: attendanceQuery,
    select: {
      date: true,
      present: true,
    },
  });

  // console.log(data)

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  const attendanceMap: { [key: string]: { present: number; absent: number } } =
    {
      Mon: { present: 0, absent: 0 },
      Tue: { present: 0, absent: 0 },
      Wed: { present: 0, absent: 0 },
      Thu: { present: 0, absent: 0 },
      Fri: { present: 0, absent: 0 },
    };

  resData.forEach((item: AttendanceData) => {
    const itemDate = new Date(item.date);
    const dayOfWeek = itemDate.getDay();
    
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      const dayName = daysOfWeek[dayOfWeek - 1];

      if (item.present) {
        attendanceMap[dayName].present += 1;
      } else {
        attendanceMap[dayName].absent += 1;
      }
    }
  });

  const data = daysOfWeek.map((day) => ({
    name: day,
    present: attendanceMap[day].present,
    absent: attendanceMap[day].absent,
  }));

  // Role-specific title
  const getTitle = () => {
    switch (role) {
      case "admin":
        return "Overall Attendance";
      case "teacher":
        return "My Classes Attendance";
      case "student":
        return "My Attendance";
      case "parent":
        return "Children's Attendance";
      default:
        return "Attendance";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 h-full transition-colors duration-200">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold my-4 text-gray-900 dark:text-white">{getTitle()}</h1>
        <button aria-label="More attendance options" className="hover:bg-gray-100 dark:hover:bg-gray-700/50 p-1 rounded-full transition-colors text-gray-500">
          <EllipsisHorizontalIcon className="w-5 h-5" />
        </button>
      </div>
      <AttendanceChart data={data}/>
    </div>
  );
};

export default AttendanceChartContainer;
