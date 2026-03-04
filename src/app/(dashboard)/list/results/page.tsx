import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableRow from "@/components/TableRow";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
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
  ChartBarIcon,
  CalendarIcon,
  StarIcon
} from '@heroicons/react/24/outline';

type ResultList = {
  id: number;
  title: string;
  studentName: string;
  studentSurname: string;
  teacherName: string;
  teacherSurname: string;
  score: number;
  className: string;
  startTime: Date;
};

const ResultListPage = async ({
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
      header: "Assessment",
      accessor: "assessment",
      sortable: true,
    },
    {
      header: "Student",
      accessor: "student",
      className: "hidden md:table-cell",
      sortable: true,
    },
    {
      header: "Score",
      accessor: "score",
      className: "hidden lg:table-cell",
    },
    {
      header: "Teacher",
      accessor: "teacher",
      className: "hidden xl:table-cell",
    },
    {
      header: "Class",
      accessor: "class",
      className: "hidden 2xl:table-cell",
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden 2xl:table-cell",
    },
    ...(role === "admin" || role === "teacher"
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
  const query: Prisma.ResultWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "studentId":
            query.studentId = value;
            break;
          case "search":
            query.OR = [
              { exam: { title: { contains: value, mode: "insensitive" } } },
              { student: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // ROLE CONDITIONS
  switch (role) {
    case "admin":
      break;
    case "teacher":
      query.OR = [
        { exam: { lesson: { teacherId: currentUserId! } } },
        { assignment: { lesson: { teacherId: currentUserId! } } },
      ];
      break;
    case "student":
      query.studentId = currentUserId!;
      break;
    case "parent":
      query.student = {
        parentId: currentUserId!,
      };
      break;
    default:
      break;
  }

  // Sorting
  let orderBy: Prisma.ResultOrderByWithRelationInput = {};
  if (sortBy) {
    switch (sortBy) {
      case 'assessment':
        orderBy.exam = { title: sortOrder === 'desc' ? 'desc' : 'asc' };
        break;
      case 'student':
        orderBy.student = { name: sortOrder === 'desc' ? 'desc' : 'asc' };
        break;
      case 'score':
        orderBy.score = sortOrder === 'desc' ? 'desc' : 'asc';
        break;
      default:
        orderBy.id = 'desc';
    }
  } else {
    orderBy.id = 'desc';
  }

  const [dataRes, count] = await prisma.$transaction([
    prisma.result.findMany({
      where: query,
      include: {
        student: { select: { name: true, surname: true, img: true } },
        exam: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true } },
                teacher: { select: { name: true, surname: true } },
              },
            },
          },
        },
        assignment: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true } },
                teacher: { select: { name: true, surname: true } },
              },
            },
          },
        },
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.result.count({ where: query }),
  ]);

  const data = dataRes
    .map((item) => {
      const assessment = item.exam || item.assignment;

      if (!assessment) return null;

      const isExam = "startTime" in assessment;

      return {
        id: item.id,
        title: (assessment as any).title,
        studentName: item.student.name,
        studentSurname: item.student.surname,
        studentImg: item.student.img,
        teacherName: (assessment as any).lesson.teacher.name,
        teacherSurname: (assessment as any).lesson.teacher.surname,
        score: item.score,
        className: (assessment as any).lesson.class.name,
        startTime: isExam ? (assessment as any).startTime : (assessment as any).dueDate,
        type: isExam ? "Exam" : "Assignment",
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  // Calculate average score
  const averageScore = data.length > 0 
    ? data.reduce((acc, result) => acc + result.score, 0) / data.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white font-display">Results</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Academic performance and assessment scoring</p>
        </div>
        
        <div className="flex items-center gap-3">
          {(role === "admin" || role === "teacher") && (
            <FormContainer table="result" type="create">
              <button className="btn btn-primary gap-2">
                <PlusIcon className="w-5 h-5" />
                <span>Add Result</span>
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
              <ChartBarIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Total Results</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">{count}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-success-50 dark:bg-success-500/10 flex items-center justify-center text-success-600 dark:text-success-400">
              <StarIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Average Score</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">
                {averageScore.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="h-10 w-px bg-surface-100 dark:bg-surface-700/50 hidden md:block" />

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center text-accent-600 dark:text-accent-400">
              <AcademicCapIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Students</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">
                {new Set(data.map(result => result.studentName + result.studentSurname)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <TableSearch placeholder="Search results..." />
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
        emptyMessage="No results found matching your criteria."
      >
        {data.map((item, index) => (
          <TableRow key={item.id} index={index}>
            <td className="px-6 py-4">
              <div className="flex items-center gap-4">
                <div className={`flex items-center justify-center w-11 h-11 rounded-xl shadow-glow transition-transform hover:scale-105 ${
                  item.type === "Exam" 
                    ? "bg-gradient-to-br from-danger-500 to-pink-500 shadow-danger-500/10"
                    : "bg-gradient-to-br from-primary-500 to-cyan-500 shadow-primary-500/10"
                }`}>
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-surface-900 dark:text-white font-display">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.type === "Exam" ? 'bg-danger-500' : 'bg-primary-500'}`} />
                    <span className="text-[11px] font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                      {item.type}
                    </span>
                  </div>
                </div>
              </div>
            </td>
            
            <td className="hidden md:table-cell px-6 py-4">
              <div className="flex items-center gap-3">
                <Image
                  src={item.studentImg || "/noAvatar.png"}
                  alt=""
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-surface-50 dark:ring-surface-800"
                />
                <span className="text-sm font-medium text-surface-700 dark:text-surface-200">
                  {item.studentName} {item.studentSurname}
                </span>
              </div>
            </td>

            <td className="hidden lg:table-cell px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ring-1 ring-inset ${
                  item.score >= 90 ? 'bg-success-50 text-success-700 ring-success-600/20 dark:bg-success-500/10 dark:text-success-400' :
                  item.score >= 80 ? 'bg-primary-50 text-primary-700 ring-primary-600/20 dark:bg-primary-500/10 dark:text-primary-400' :
                  item.score >= 70 ? 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400' :
                  'bg-danger-50 text-danger-700 ring-danger-600/20 dark:bg-danger-500/10 dark:text-danger-400'
                }`}>
                  {item.score}%
                </div>
                <div className="w-24 h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden hidden xl:block">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.score >= 90 ? 'bg-success-500' :
                      item.score >= 80 ? 'bg-primary-500' :
                      item.score >= 70 ? 'bg-amber-500' :
                      'bg-danger-500'
                    }`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            </td>

            <td className="hidden xl:table-cell px-6 py-4">
              <div className="flex items-center gap-2 text-surface-600 dark:text-surface-400">
                <AcademicCapIcon className="w-4 h-4 text-accent-500" />
                <span className="text-sm font-medium">
                  {item.teacherName} {item.teacherSurname}
                </span>
              </div>
            </td>

            <td className="hidden 2xl:table-cell px-6 py-4">
              <span className="badge badge-primary">
                {item.className}
              </span>
            </td>

            <td className="hidden 2xl:table-cell px-6 py-4">
              <div className="flex items-center gap-2 text-surface-500 dark:text-surface-400">
                <CalendarIcon className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  {new Date(item.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </td>

            {(role === "admin" || role === "teacher") && (
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5 justify-end">
                  <Link href={`/list/results/${item.id}`}>
                    <button className="btn btn-secondary btn-icon btn-sm group" title="View Details">
                      <EyeIcon className="w-4 h-4 text-surface-400 group-hover:text-primary-500" />
                    </button>
                  </Link>
                  <FormContainer table="result" type="update" data={item}>
                    <button className="btn btn-secondary btn-icon btn-sm group" title="Edit Result">
                      <PencilIcon className="w-4 h-4 text-surface-400 group-hover:text-amber-500" />
                    </button>
                  </FormContainer>
                  <FormContainer table="result" type="delete" id={item.id}>
                    <button className="btn btn-secondary btn-icon btn-sm group" title="Delete Result">
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

export default ResultListPage;
