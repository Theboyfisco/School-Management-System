import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableRow from "@/components/TableRow";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Lesson, Prisma, Subject, Teacher } from "@prisma/client";
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
  BookOpenIcon,
  AcademicCapIcon,
  ClockIcon,
  MapPinIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

type LessonList = Lesson & { 
  teacher: Teacher | null;
  subject: Subject | null;
  class: Class | null;
};

const LessonListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role as string;
  const columns = [
    {
      header: "Lesson",
      accessor: "lesson",
      sortable: true,
    },
    {
      header: "Subject",
      accessor: "subject",
      className: "hidden md:table-cell",
      sortable: true,
    },
    {
      header: "Teacher",
      accessor: "teacher",
      className: "hidden lg:table-cell",
    },
    {
      header: "Class",
      accessor: "class",
      className: "hidden xl:table-cell",
    },
    {
      header: "Schedule",
      accessor: "schedule",
      className: "hidden 2xl:table-cell",
    },
    ...(role === "admin"
      ? [
          {
            header: "Actions",
            accessor: "actions",
          },
        ]
      : []),
  ];

  const { page, sortBy, sortOrder, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.LessonWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.OR = [
              { name: { contains: value, mode: "insensitive" } },
              { subject: { name: { contains: value, mode: "insensitive" } } },
              { teacher: { name: { contains: value, mode: "insensitive" } } },
              { teacher: { surname: { contains: value, mode: "insensitive" } } },
              { class: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // Sorting
  let orderBy: Prisma.LessonOrderByWithRelationInput = {};
  if (sortBy) {
    switch (sortBy) {
      case 'lesson':
        orderBy.name = sortOrder === 'desc' ? 'desc' : 'asc';
        break;
      case 'subject':
        orderBy.subject = { name: sortOrder === 'desc' ? 'desc' : 'asc' };
        break;
      default:
        orderBy.name = 'asc';
    }
  } else {
    orderBy.name = 'asc';
  }

  const [data, count] = await prisma.$transaction([
    prisma.lesson.findMany({
      where: query,
      include: {
        teacher: true,
        subject: true,
        class: true,
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.lesson.count({ where: query }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white font-display">Lessons</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Manage and view all academic schedules</p>
        </div>
        
        <div className="flex items-center gap-3">
          {role === "admin" && (
            <FormContainer table="lesson" type="create">
              <button className="btn btn-primary gap-2">
                <PlusIcon className="w-5 h-5" />
                <span>Add Lesson</span>
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
              <BookOpenIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Total Lessons</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">{count}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center text-accent-600 dark:text-accent-400">
              <AcademicCapIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Subjects</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">
                {new Set(data.map(lesson => lesson.subject?.name).filter(Boolean)).size}
              </p>
            </div>
          </div>

          <div className="h-10 w-px bg-surface-100 dark:bg-surface-700/50 hidden md:block" />

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-success-50 dark:bg-success-500/10 flex items-center justify-center text-success-600 dark:text-success-400">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Assigned Teachers</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">
                {data.filter(lesson => lesson.teacher).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <TableSearch placeholder="Search lessons..." />
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary btn-icon" title="Filter">
            <FunnelIcon className="w-5 h-5" />
          </button>
          <button className="btn btn-secondary btn-icon" title="Sort">
            <ArrowUpIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <Table 
        columns={columns}
        emptyMessage="No lessons found matching your search criteria."
      >
        {data.map((item, index) => (
          <TableRow key={item.id} index={index}>
            <td className="px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-11 h-11 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl shadow-glow shadow-primary-500/10 transition-transform hover:scale-105">
                  <BookOpenIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-surface-900 dark:text-white font-display">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                    <span className="text-[11px] font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                      Academic Session
                    </span>
                  </div>
                </div>
              </div>
            </td>
            
            <td className="hidden md:table-cell px-6 py-4">
              {item.subject ? (
                <span className="badge badge-accent">
                  {item.subject.name}
                </span>
              ) : (
                <span className="text-xs text-surface-400 italic">No subject</span>
              )}
            </td>

            <td className="hidden lg:table-cell px-6 py-4">
              {item.teacher ? (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Image
                      src={item.teacher.img || "/noAvatar.png"}
                      alt=""
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-surface-50 dark:ring-surface-800"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-success-500 border-2 border-white dark:border-surface-800 rounded-full" />
                  </div>
                  <span className="text-sm font-medium text-surface-700 dark:text-surface-200">
                    {item.teacher.name} {item.teacher.surname}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-surface-400 italic">Unassigned</span>
              )}
            </td>

            <td className="hidden xl:table-cell px-6 py-4">
              {item.class ? (
                <span className="badge badge-primary">
                  {item.class.name}
                </span>
              ) : (
                <span className="text-xs text-surface-400 italic">No class</span>
              )}
            </td>

            <td className="hidden 2xl:table-cell px-6 py-4">
              <div className="flex items-center gap-2.5 text-surface-600 dark:text-surface-400">
                <div className="p-1.5 bg-surface-50 dark:bg-surface-800 rounded-lg">
                  <ClockIcon className="w-4 h-4 text-primary-500" />
                </div>
                <div className="text-[13px] font-medium">
                  <span className="text-surface-900 dark:text-white font-bold">{item.day}</span>
                  <span className="mx-1.5 opacity-50">•</span>
                  <span>{new Date(item.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(item.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
            </td>

            {role === "admin" && (
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5 justify-end">
                  <Link href={`/list/lessons/${item.id}`}>
                    <button className="btn btn-secondary btn-icon btn-sm group" title="View Details">
                      <EyeIcon className="w-4 h-4 text-surface-400 group-hover:text-primary-500" />
                    </button>
                  </Link>
                  <FormContainer table="lesson" type="update" data={item}>
                    <button className="btn btn-secondary btn-icon btn-sm group" title="Edit Lesson">
                      <PencilIcon className="w-4 h-4 text-surface-400 group-hover:text-amber-500" />
                    </button>
                  </FormContainer>
                  <FormContainer table="lesson" type="delete" id={item.id}>
                    <button className="btn btn-secondary btn-icon btn-sm group" title="Delete Lesson">
                      <TrashIcon className="w-4 h-4 text-surface-400 group-hover:text-danger-500" />
                    </button>
                  </FormContainer>
                </div>
              </td>
            )}
          </TableRow>
        ))}
      </Table>

      {/* Pagination */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default LessonListPage;
