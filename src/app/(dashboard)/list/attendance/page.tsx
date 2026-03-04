import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableRow from "@/components/TableRow";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Attendance, Class, Lesson, Prisma, Student, Subject } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { 
  PlusIcon, 
  FunnelIcon, 
  ArrowUpIcon, 
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

type AttendanceList = Attendance & {
  student: Student & { class: Class };
  lesson: Lesson & { subject: Subject; class: Class };
};

type FilterOptions = {
  students?: Student[];
  classes?: Class[];
  lessons?: (Lesson & { subject?: Subject })[];
  subjects?: Subject[];
  children?: Student[];
};

const AttendanceListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role as string;
  const currentUserId = user?.id;

  // Role display mapping
  const roleDisplay = {
    admin: "Administrator",
    teacher: "Teacher",
    student: "Student",
    parent: "Parent",
  };

  // --- FILTER OPTIONS BASED ON ROLE ---
  const filterOptions: FilterOptions = {};

  if (role === "admin") {
    // Admin can see everything
    const [students, classes, lessons, subjects] = await prisma.$transaction([
      prisma.student.findMany({ orderBy: { name: "asc" } }),
      prisma.class.findMany({ orderBy: { name: "asc" } }),
      prisma.lesson.findMany({
        include: { subject: true },
        orderBy: { name: "asc" },
      }),
      prisma.subject.findMany({ orderBy: { name: "asc" } }),
    ]);
    filterOptions.students = students;
    filterOptions.classes = classes;
    filterOptions.lessons = lessons;
    filterOptions.subjects = subjects;
  } else if (role === "teacher") {
    // Teacher can only see their classes and students
    const teacherLessons = await prisma.lesson.findMany({
      where: { teacherId: currentUserId! },
      include: { subject: true },
      orderBy: { name: "asc" },
    });
    const teacherClasses = await prisma.class.findMany({
      where: {
        lessons: { some: { teacherId: currentUserId! } },
      },
      orderBy: { name: "asc" },
    });
    const teacherStudents = await prisma.student.findMany({
      where: {
        class: {
          lessons: { some: { teacherId: currentUserId! } },
        },
      },
      orderBy: { name: "asc" },
    });
    filterOptions.lessons = teacherLessons;
    filterOptions.classes = teacherClasses;
    filterOptions.students = teacherStudents;
  } else if (role === "parent") {
    // Parent can only see their children
    const children = await prisma.student.findMany({
      where: { parentId: currentUserId! },
      orderBy: { name: "asc" },
    });
    filterOptions.children = children;
  }

  // --- QUERY LOGIC BASED ON ROLE ---
  const { page, sortBy, sortOrder, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;
  const query: Prisma.AttendanceWhereInput = {};

  // Apply filters
  if (queryParams.studentId) {
    query.studentId = queryParams.studentId;
  }
  if (queryParams.classId) {
    query.lesson = { classId: parseInt(queryParams.classId) };
  }
  if (queryParams.lessonId) {
    query.lessonId = parseInt(queryParams.lessonId);
  }
  if (queryParams.date) {
    query.date = new Date(queryParams.date);
  }
  if (queryParams.present !== undefined) {
    query.present = queryParams.present === "true";
  }
  if (queryParams.search) {
    query.OR = [
      { student: { name: { contains: queryParams.search, mode: "insensitive" } } },
      { student: { surname: { contains: queryParams.search, mode: "insensitive" } } },
      { lesson: { name: { contains: queryParams.search, mode: "insensitive" } } },
      { lesson: { subject: { name: { contains: queryParams.search, mode: "insensitive" } } } },
    ];
  }

  // Role-based restrictions
  if (role === "teacher") {
    const teacherLessons = await prisma.lesson.findMany({
      where: { teacherId: currentUserId! },
      select: { id: true },
    });
    query.lessonId = { in: teacherLessons.map(l => l.id) };
  } else if (role === "student") {
    // Only their own attendance
    query.studentId = currentUserId!;
  } else if (role === "parent") {
    // Only their children's attendance
    const childIds = filterOptions.children?.map(c => c.id) || [];
    query.studentId = { in: childIds };
  }

  // Sorting
  let orderBy: Prisma.AttendanceOrderByWithRelationInput = {};
  if (sortBy) {
    switch (sortBy) {
      case 'student':
        orderBy.student = { name: sortOrder === 'desc' ? 'desc' : 'asc' };
        break;
      case 'date':
        orderBy.date = sortOrder === 'desc' ? 'desc' : 'asc';
        break;
      default:
        orderBy.date = 'desc';
    }
  } else {
    orderBy.date = 'desc';
  }

  // --- FETCH DATA ---
  const [data, count] = await prisma.$transaction([
    prisma.attendance.findMany({
      where: query,
      include: {
        student: { include: { class: true } },
        lesson: { include: { subject: true, class: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy,
    }),
    prisma.attendance.count({ where: query }),
  ]);

  // --- COLUMNS BASED ON ROLE ---
  const columns = [
    ...(role !== "student"
      ? [{ header: "Student", accessor: "student", sortable: true }]
      : []),
    { header: "Lesson", accessor: "lesson", className: "hidden md:table-cell" },
    { header: "Subject", accessor: "subject", className: "hidden lg:table-cell" },
    { header: "Class", accessor: "class", className: "hidden xl:table-cell" },
    { header: "Date", accessor: "date", className: "hidden 2xl:table-cell", sortable: true },
    { header: "Status", accessor: "status" },
    ...((role === "admin" || role === "teacher")
      ? [{ header: "Actions", accessor: "actions" }]
      : []),
  ];

  // --- FILTERS UI ---
  function Filters() {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Student filter (admin, teacher, parent) */}
          {(role === "admin" || role === "teacher") && filterOptions.students && (
            <select
              name="studentId"
              defaultValue={searchParams.studentId || ""}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm"
            >
              <option value="">All Students</option>
              {filterOptions.students.map(s => (
                <option key={s.id} value={s.id}>{s.name} {s.surname}</option>
              ))}
            </select>
          )}
          {/* Child filter (parent) */}
          {role === "parent" && filterOptions.children && (
            <select
              name="studentId"
              defaultValue={searchParams.studentId || ""}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm"
            >
              <option value="">All Children</option>
              {filterOptions.children.map(c => (
                <option key={c.id} value={c.id}>{c.name} {c.surname}</option>
              ))}
            </select>
          )}
          {/* Class filter (admin, teacher, parent) */}
          {(role === "admin" || role === "teacher") && filterOptions.classes && (
            <select
              name="classId"
              defaultValue={searchParams.classId || ""}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm"
            >
              <option value="">All Classes</option>
              {filterOptions.classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
          {/* Lesson filter (admin, teacher) */}
          {(role === "admin" || role === "teacher") && filterOptions.lessons && (
            <select
              name="lessonId"
              defaultValue={searchParams.lessonId || ""}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm"
            >
              <option value="">All Lessons</option>
              {filterOptions.lessons.map(l => (
                <option key={l.id} value={l.id}>{l.name} ({l.subject?.name || 'No Subject'})</option>
              ))}
            </select>
          )}
          {/* Date filter (all roles) */}
          <input
            type="date"
            name="date"
            defaultValue={searchParams.date || ""}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm"
          />
          {/* Present/Absent filter (all roles) */}
          <select
            name="present"
            defaultValue={searchParams.present || ""}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm"
          >
            <option value="">All</option>
            <option value="true">Present</option>
            <option value="false">Absent</option>
          </select>
          {/* Search bar (all roles) */}
          <div className="flex-1">
            <TableSearch placeholder="Search by student name, lesson, or subject..." />
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN RENDER ---
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white font-display">Attendance</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1 uppercase tracking-wider text-[11px] font-bold">
            Viewing as: {roleDisplay[role as keyof typeof roleDisplay] || "User"}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {(role === "admin" || role === "teacher") && (
            <FormContainer table="attendance" type="create">
              <button className="btn btn-primary gap-2 shadow-glow shadow-primary-500/20">
                <PlusIcon className="w-5 h-5" />
                <span>Mark Attendance</span>
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
              <UserIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Total Records</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">{count}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-success-50 dark:bg-success-500/10 flex items-center justify-center text-success-600 dark:text-success-400">
              <CheckCircleIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Present</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">
                {data.filter(record => record.present).length}
              </p>
            </div>
          </div>

          <div className="h-10 w-px bg-surface-100 dark:bg-surface-700/50 hidden md:block" />

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-danger-50 dark:bg-danger-500/10 flex items-center justify-center text-danger-600 dark:text-danger-400">
              <XCircleIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Absent</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">
                {data.filter(record => !record.present).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <TableSearch placeholder="Search attendance..." />
          
          <select
            name="present"
            defaultValue={searchParams.present || ""}
            className="select max-w-[120px]"
          >
            <option value="">All Status</option>
            <option value="true">Present</option>
            <option value="false">Absent</option>
          </select>

          {(role === "admin" || role === "teacher") && filterOptions.classes && (
            <select
              name="classId"
              defaultValue={searchParams.classId || ""}
              className="select max-w-[140px]"
            >
              <option value="">All Classes</option>
              {filterOptions.classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}

          {role === "parent" && filterOptions.children && (
            <select
              name="studentId"
              defaultValue={searchParams.studentId || ""}
              className="select"
            >
              <option value="">All Children</option>
              {filterOptions.children.map(c => (
                <option key={c.id} value={c.id}>{c.name} {c.surname}</option>
              ))}
            </select>
          )}

          <input
            type="date"
            name="date"
            defaultValue={searchParams.date || ""}
            className="select"
          />
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          <button className="btn btn-secondary btn-icon" title="Sort Order">
            <ArrowUpIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <Table 
        columns={columns}
        emptyMessage="No attendance records matching your criteria."
      >
        {data.map((item, index) => (
          <TableRow key={item.id} index={index}>
            {role !== "student" && (
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <Image
                    src={item.student.img || "/noAvatar.png"}
                    alt=""
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-surface-50 dark:ring-surface-800"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-surface-900 dark:text-white font-display">
                      {item.student.name} {item.student.surname}
                    </h3>
                    <p className="text-[11px] font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                      {item.student.username}
                    </p>
                  </div>
                </div>
              </td>
            )}

            <td className="hidden md:table-cell px-6 py-4">
              <span className="text-sm font-medium text-surface-700 dark:text-surface-200">
                {item.lesson.name}
              </span>
            </td>

            <td className="hidden lg:table-cell px-6 py-4">
              <span className="badge badge-success">
                {item.lesson.subject.name}
              </span>
            </td>

            <td className="hidden xl:table-cell px-6 py-4">
              <span className="badge badge-primary">
                {item.lesson.class.name}
              </span>
            </td>

            <td className="hidden 2xl:table-cell px-6 py-4">
              <div className="flex items-center gap-2 text-surface-500 dark:text-surface-400">
                <ClockIcon className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </td>

            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                {item.present ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-success-50 dark:bg-success-500/10 text-success-700 dark:text-success-400 ring-1 ring-inset ring-success-600/20">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Present</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-danger-50 dark:bg-danger-500/10 text-danger-700 dark:text-danger-400 ring-1 ring-inset ring-danger-600/20">
                    <XCircleIcon className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Absent</span>
                  </div>
                )}
              </div>
            </td>

            {(role === "admin" || role === "teacher") && (
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5 justify-end">
                  {(role === "admin" || (role === "teacher" && (item.lesson as any).teacherId === currentUserId)) && (
                    <>
                      <FormContainer table="attendance" type="update" data={item}>
                        <button className="btn btn-secondary btn-icon btn-sm group" title="Edit Record">
                          <PencilIcon className="w-4 h-4 text-surface-400 group-hover:text-amber-500" />
                        </button>
                      </FormContainer>
                      <FormContainer table="attendance" type="delete" id={item.id}>
                        <button className="btn btn-secondary btn-icon btn-sm group" title="Delete Record">
                          <TrashIcon className="w-4 h-4 text-surface-400 group-hover:text-danger-500" />
                        </button>
                      </FormContainer>
                    </>
                  )}
                </div>
              </td>
            )}
          </TableRow>
        ))}
      </Table>

      <Pagination page={p} count={count} />
    </div>
  );
};

export default AttendanceListPage; 