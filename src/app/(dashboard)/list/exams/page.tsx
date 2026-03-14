import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableRow from "@/components/TableRow";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Exam, Prisma, Subject, Teacher } from "@prisma/client";
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
  DocumentTextIcon,
  AcademicCapIcon,
  ClockIcon,
  MapPinIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

type ExamList = Exam & {
  lesson: {
    subject: Subject;
    class: Class;
    teacher: Teacher;
  };
};

const ExamListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role as string;
  const currentUserId = user?.id;
  const columns = [
    {
      header: "Exam",
      accessor: "exam",
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
  const query: Prisma.ExamWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.OR = [
              { title: { contains: value, mode: "insensitive" } },
              { lesson: { subject: { name: { contains: value, mode: "insensitive" } } } },
              { lesson: { teacher: { name: { contains: value, mode: "insensitive" } } } },
              { lesson: { teacher: { surname: { contains: value, mode: "insensitive" } } } },
              { lesson: { class: { name: { contains: value, mode: "insensitive" } } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // Sorting
  let orderBy: Prisma.ExamOrderByWithRelationInput = {};
  if (sortBy) {
    switch (sortBy) {
      case 'exam':
        orderBy.title = sortOrder === 'desc' ? 'desc' : 'asc';
        break;
      case 'subject':
        orderBy.lesson = { subject: { name: sortOrder === 'desc' ? 'desc' : 'asc' } };
        break;
      default:
        orderBy.startTime = 'asc';
    }
  } else {
    orderBy.startTime = 'asc';
  }

  const [data, count, lessons] = await prisma.$transaction([
    prisma.exam.findMany({
      where: query,
      include: {
        lesson: {
          include: {
            teacher: true,
            subject: true,
            class: true,
          },
        },
        results: true,
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.exam.count({ where: query }),
    prisma.lesson.findMany({ select: { id: true, name: true } }),
  ]);

  const relatedData = { lessons };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white font-display">Exams</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Schedules and management for all academic tests</p>
        </div>
        
        <div className="flex items-center gap-3">
          {role === "admin" && (
            <FormContainer table="exam" type="create" relatedData={relatedData}>
              <button className="btn btn-primary gap-2">
                <PlusIcon className="w-5 h-5" />
                <span>New Exam</span>
              </button>
            </FormContainer>
          )}
        </div>
      </div>

      {/* Stats Summary Card */}
      <div className="card p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-center gap-6 sm:gap-8">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-danger-50 dark:bg-danger-500/10 flex items-center justify-center text-danger-600 dark:text-danger-400 shadow-sm border border-danger-100/50 dark:border-danger-500/20">
              <DocumentTextIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-surface-500 dark:text-surface-400 font-bold uppercase tracking-wider">Total Exams</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-white leading-tight">{count}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 sm:border-l sm:dark:border-surface-700/50 sm:pl-8">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-success-50 dark:bg-success-500/10 flex items-center justify-center text-success-600 dark:text-success-400 shadow-sm border border-success-100/50 dark:border-success-500/20">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-surface-500 dark:text-surface-400 font-bold uppercase tracking-wider">Upcoming</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-white leading-tight">
                {data.filter(exam => new Date(exam.startTime) > new Date()).length}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 lg:border-l lg:dark:border-surface-700/50 lg:pl-8 sm:col-span-2 lg:col-span-1 border-t sm:border-t-0 pt-6 sm:pt-0 sm:mt-0">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center text-accent-600 dark:text-accent-400 shadow-sm border border-accent-100/50 dark:border-accent-500/20">
              <AcademicCapIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-surface-500 dark:text-surface-400 font-bold uppercase tracking-wider">Subjects</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-white leading-tight">
                {new Set(data.map(exam => exam.lesson?.subject?.name).filter(Boolean)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <TableSearch placeholder="Search exams..." />
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
        emptyMessage="No exams found matching your criteria."
      >
        {data.map((item, index) => (
          <TableRow key={item.id} index={index}>
            <td className="px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-11 h-11 bg-gradient-to-br from-danger-500 to-pink-500 rounded-xl shadow-glow shadow-danger-500/10 transition-transform hover:scale-105">
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-surface-900 dark:text-white font-display">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${new Date(item.startTime) > new Date() ? 'bg-success-500 animate-pulse' : 'bg-surface-300 dark:bg-surface-600'}`} />
                    <span className="text-[11px] font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                      {new Date(item.startTime) > new Date() ? 'Upcoming' : 'Completed'}
                    </span>
                  </div>
                </div>
              </div>
            </td>
            
            <td className="hidden md:table-cell px-6 py-4">
              {item.lesson?.subject ? (
                <span className="badge badge-success">
                  {item.lesson.subject.name}
                </span>
              ) : (
                <span className="text-xs text-surface-400 italic">No subject</span>
              )}
            </td>

            <td className="hidden lg:table-cell px-6 py-4">
              {item.lesson?.teacher ? (
                <div className="flex items-center gap-3">
                  <Image
                    src={item.lesson.teacher.img || "/noAvatar.png"}
                    alt=""
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-surface-50 dark:ring-surface-800"
                  />
                  <span className="text-sm font-medium text-surface-700 dark:text-surface-200">
                    {item.lesson.teacher.name} {item.lesson.teacher.surname}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-surface-400 italic">Unassigned</span>
              )}
            </td>

            <td className="hidden xl:table-cell px-6 py-4">
              {item.lesson?.class ? (
                <span className="badge badge-primary">
                  {item.lesson.class.name}
                </span>
              ) : (
                <span className="text-xs text-surface-400 italic">No class</span>
              )}
            </td>

            <td className="hidden 2xl:table-cell px-6 py-4">
              <div className="flex items-center gap-2.5 text-surface-600 dark:text-surface-400">
                <div className={`p-1.5 rounded-lg ${new Date(item.startTime) > new Date() ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-500' : 'bg-surface-50 dark:bg-surface-800'}`}>
                  <ClockIcon className="w-4 h-4" />
                </div>
                <div className="text-[13px] font-medium">
                  <span className={`font-bold ${new Date(item.startTime) > new Date() ? 'text-surface-900 dark:text-white' : 'opacity-70'}`}>
                    {new Date(item.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="mx-1 opacity-50">•</span>
                  <span className="opacity-70">
                    {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </td>

            {role === "admin" && (
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5 justify-end">
                  <Link href={`/list/exams/${item.id}`}>
                    <button className="btn btn-secondary btn-icon btn-sm group" title="View Details">
                      <EyeIcon className="w-4 h-4 text-surface-400 group-hover:text-primary-500" />
                    </button>
                  </Link>
                  <FormContainer table="exam" type="update" data={item} relatedData={relatedData}>
                    <button className="btn btn-secondary btn-icon btn-sm group" title="Edit Exam">
                      <PencilIcon className="w-4 h-4 text-surface-400 group-hover:text-amber-500" />
                    </button>
                  </FormContainer>
                  <FormContainer table="exam" type="delete" id={item.id}>
                    <button className="btn btn-secondary btn-icon btn-sm group" title="Delete Exam">
                      <TrashIcon className="w-4 h-4 text-surface-400 group-hover:text-danger-500" />
                    </button>
                  </FormContainer>
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

export default ExamListPage;
