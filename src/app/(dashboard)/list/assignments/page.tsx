import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableRow from "@/components/TableRow";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Assignment, Class, Prisma, Subject, Teacher } from "@prisma/client";
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

type AssignmentList = Assignment & {
  lesson: {
    subject: Subject;
    class: Class;
    teacher: Teacher;
  };
};

const AssignmentListPage = async ({
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
      header: "Assignment",
      accessor: "assignment",
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
      header: "Due Date",
      accessor: "dueDate",
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
  const query: Prisma.AssignmentWhereInput = {};

  query.lesson = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.lesson.classId = parseInt(value);
            break;
          case "teacherId":
            query.lesson.teacherId = value;
            break;
          case "search":
            query.lesson.subject = {
              name: { contains: value, mode: "insensitive" },
            };
            break;
          default:
            break;
        }
      }
    }
  }

  // Sorting
  let orderBy: Prisma.AssignmentOrderByWithRelationInput = {};
  if (sortBy) {
    switch (sortBy) {
      case 'assignment':
        orderBy.title = sortOrder === 'desc' ? 'desc' : 'asc';
        break;
      case 'subject':
        orderBy.lesson = { subject: { name: sortOrder === 'desc' ? 'desc' : 'asc' } };
        break;
      case 'dueDate':
        orderBy.dueDate = sortOrder === 'desc' ? 'desc' : 'asc';
        break;
      default:
        orderBy.dueDate = 'asc';
    }
  } else {
    orderBy.dueDate = 'asc';
  }

  // ROLE CONDITIONS
  switch (role) {
    case "admin":
      break;
    case "teacher":
      query.lesson.teacherId = currentUserId!;
      break;
    case "student":
      query.lesson.class = {
        students: {
          some: {
            id: currentUserId!,
          },
        },
      };
      break;
    case "parent":
      query.lesson.class = {
        students: {
          some: {
            parentId: currentUserId!,
          },
        },
      };
      break;
    default:
      break;
  }

  const [data, count] = await prisma.$transaction([
    prisma.assignment.findMany({
      where: query,
      include: {
        lesson: {
          select: {
            subject: { select: { name: true } },
            teacher: { select: { name: true, surname: true, img: true } },
            class: { select: { name: true } },
          },
        },
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.assignment.count({ where: query }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white font-display">Assignments</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Track and manage student coursework</p>
        </div>
        
        <div className="flex items-center gap-3">
          {role === "admin" && (
            <FormContainer table="assignment" type="create">
              <button className="btn btn-primary gap-2">
                <PlusIcon className="w-5 h-5" />
                <span>New Assignment</span>
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
              <DocumentTextIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Total Assignments</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">{count}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-success-50 dark:bg-success-500/10 flex items-center justify-center text-success-600 dark:text-success-400">
              <ClockIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Active</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">
                {data.filter(assignment => new Date(assignment.dueDate) > new Date()).length}
              </p>
            </div>
          </div>

          <div className="h-10 w-px bg-surface-100 dark:bg-surface-700/50 hidden md:block" />

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center text-accent-600 dark:text-accent-400">
              <AcademicCapIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Subjects</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">
                {new Set(data.map(assignment => (assignment.lesson as any).subject?.name).filter(Boolean)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <TableSearch placeholder="Search assignments..." />
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
        emptyMessage="No assignments found matching your criteria."
      >
        {data.map((item, index) => (
          <TableRow key={item.id} index={index}>
            <td className="px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-11 h-11 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl shadow-glow shadow-indigo-500/10 transition-transform hover:scale-105">
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-surface-900 dark:text-white font-display">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${new Date(item.dueDate) < new Date() ? 'bg-danger-500' : 'bg-success-500'}`} />
                    <span className="text-[11px] font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                      {new Date(item.dueDate) < new Date() ? 'Expired' : 'Live'}
                    </span>
                  </div>
                </div>
              </div>
            </td>
            
            <td className="hidden md:table-cell px-6 py-4">
              {item.lesson.subject ? (
                <span className="badge badge-success">
                  {item.lesson.subject.name}
                </span>
              ) : (
                <span className="text-xs text-surface-400 italic">No subject</span>
              )}
            </td>

            <td className="hidden lg:table-cell px-6 py-4">
              {item.lesson.teacher ? (
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
              {item.lesson.class ? (
                <span className="badge badge-primary">
                  {item.lesson.class.name}
                </span>
              ) : (
                <span className="text-xs text-surface-400 italic">No class</span>
              )}
            </td>

            <td className="hidden 2xl:table-cell px-6 py-4">
              <div className="flex items-center gap-2.5 text-surface-600 dark:text-surface-400">
                <div className={`p-1.5 rounded-lg ${new Date(item.dueDate) < new Date() ? 'bg-danger-50 dark:bg-danger-500/10 text-danger-500' : 'bg-surface-50 dark:bg-surface-800 text-primary-500'}`}>
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div className="text-[13px] font-medium">
                  <span className={`font-bold ${new Date(item.dueDate) < new Date() ? 'text-danger-600 dark:text-danger-400' : 'text-surface-900 dark:text-white'}`}>
                    {new Date(item.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </td>

            {role === "admin" && (
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5 justify-end">
                  <Link href={`/list/assignments/${item.id}`}>
                    <button className="btn btn-secondary btn-icon btn-sm group" title="View Details">
                      <EyeIcon className="w-4 h-4 text-surface-400 group-hover:text-primary-500" />
                    </button>
                  </Link>
                  <FormContainer table="assignment" type="update" data={item}>
                    <button className="btn btn-secondary btn-icon btn-sm group" title="Edit Assignment">
                      <PencilIcon className="w-4 h-4 text-surface-400 group-hover:text-amber-500" />
                    </button>
                  </FormContainer>
                  <FormContainer table="assignment" type="delete" id={item.id}>
                    <button className="btn btn-secondary btn-icon btn-sm group" title="Delete Assignment">
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

export default AssignmentListPage;
