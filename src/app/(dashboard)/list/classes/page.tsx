import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableRow from "@/components/TableRow";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { Prisma, Class, Teacher, Student } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { createClient } from "@/utils/supabase/server";
import { 
  PlusIcon, 
  FunnelIcon, 
  ArrowsUpDownIcon, 
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  UserGroupIcon,
  AcademicCapIcon,
  UserIcon
} from '@heroicons/react/24/outline';

type ClassList = Class & { 
  supervisor: Teacher | null;
  students: Student[];
};

const ClassListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role as string;

  const columns = [
    {
      header: "Class",
      accessor: "class",
      sortable: true,
    },
    {
      header: "Teacher",
      accessor: "teacher",
      className: "hidden md:table-cell",
      sortable: true,
    },
    {
      header: "Students",
      accessor: "students",
      className: "hidden lg:table-cell",
    },
    {
      header: "Capacity",
      accessor: "capacity",
      className: "hidden lg:table-cell",
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
  const query: Prisma.ClassWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.OR = [
              { name: { contains: value, mode: "insensitive" } },
              { supervisor: { name: { contains: value, mode: "insensitive" } } },
              { supervisor: { surname: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // Sorting
  let orderBy: Prisma.ClassOrderByWithRelationInput = {};
  if (sortBy) {
    switch (sortBy) {
      case 'class':
        orderBy.name = sortOrder === 'desc' ? 'desc' : 'asc';
        break;
      case 'teacher':
        orderBy.supervisor = { name: sortOrder === 'desc' ? 'desc' : 'asc' };
        break;
      default:
        orderBy.name = 'asc';
    }
  } else {
    orderBy.name = 'asc';
  }

  const [data, count] = await prisma.$transaction([
    prisma.class.findMany({
      where: query,
      select: {
        id: true,
        name: true,
        capacity: true,
        gradeId: true,
        supervisor: {
          select: {
            id: true,
            name: true,
            surname: true,
            img: true,
          }
        },
        students: {
          select: {
            id: true,
            img: true,
          }
        },
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.class.count({ where: query }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white font-display">Classes</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Manage school class structures</p>
        </div>
        
        <div className="flex items-center gap-3">
          {role === "admin" && (
            <FormContainer table="class" type="create">
              <button className="btn btn-primary gap-2">
                <PlusIcon className="w-5 h-5" />
                <span>Add Class</span>
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
              <AcademicCapIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Total Classes</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">{count}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center text-accent-600 dark:text-accent-400">
              <UserGroupIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Students Enrolled</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">
                {data.reduce((acc, cls) => acc + cls.students.length, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <TableSearch placeholder="Search classes..." />
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary btn-icon" title="Filter">
            <FunnelIcon className="w-5 h-5" />
          </button>
          <button className="btn btn-secondary btn-icon" title="Sort">
            <ArrowsUpDownIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <Table 
        columns={columns}
        emptyMessage="No classes found matching your search criteria."
      >
        {data.map((item, index) => (
          <TableRow key={item.id} index={index}>
            <td className="px-6 py-4">
              <div className="flex gap-4 items-center">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white ring-2 ring-surface-50 dark:ring-surface-900 shadow-sm">
                  <AcademicCapIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-surface-900 dark:text-white font-display">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <UserGroupIcon className="w-3 h-3 text-surface-400" />
                    <span className="text-[11px] font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                      Grade {item.gradeId}
                    </span>
                  </div>
                </div>
              </div>
            </td>
            
            <td className="hidden md:table-cell px-6 py-4">
              {item.supervisor ? (
                <div className="flex items-center gap-3">
                  <Image
                    src={item.supervisor.img || "/noAvatar.png"}
                    alt=""
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover border border-surface-100 dark:border-surface-700 ring-1 ring-surface-50 dark:ring-surface-800"
                  />
                  <div>
                    <p className="text-sm font-bold text-surface-900 dark:text-white">
                      {item.supervisor.name} {item.supervisor.surname}
                    </p>
                    <p className="text-[11px] text-surface-500 dark:text-surface-400">Supervisor</p>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-surface-400 italic">No supervisor assigned</span>
              )}
            </td>

            <td className="hidden lg:table-cell px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {item.students.slice(0, 3).map((student) => (
                    <Image
                      key={student.id}
                      src={student.img || "/noAvatar.png"}
                      alt=""
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full object-cover border-2 border-surface-50 dark:border-surface-900 ring-1 ring-surface-100 dark:ring-surface-800"
                    />
                  ))}
                  {item.students.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-surface-100 dark:bg-surface-800 border-2 border-surface-50 dark:border-surface-900 flex items-center justify-center text-[9px] font-bold text-surface-600 dark:text-surface-400">
                      +{item.students.length - 3}
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium text-surface-500 dark:text-surface-400">
                  {item.students.length} Students
                </span>
              </div>
            </td>

            <td className="hidden lg:table-cell px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="w-full bg-surface-100 dark:bg-surface-800 rounded-full h-1.5 max-w-[80px]">
                  <div 
                    className={`h-1.5 rounded-full ${
                      (item.students.length / item.capacity) > 0.9 ? 'bg-danger-500' : 'bg-primary-500'
                    }`}
                    style={{ width: `${Math.min((item.students.length / item.capacity) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-surface-500">
                  {item.students.length}/{item.capacity}
                </span>
              </div>
            </td>

            {role === "admin" && (
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5 justify-end">
                  <Link href={`/list/classes/${item.id}`}>
                    <button className="btn btn-secondary btn-icon btn-sm group" title="View Details">
                      <EyeIcon className="w-4 h-4 text-surface-400 group-hover:text-primary-500" />
                    </button>
                  </Link>
                  <FormContainer table="class" type="update" data={item}>
                    <button className="btn btn-secondary btn-icon btn-sm group" title="Edit Class">
                      <PencilSquareIcon className="w-4 h-4 text-surface-400 group-hover:text-amber-500" />
                    </button>
                  </FormContainer>
                  <FormContainer table="class" type="delete" id={item.id}>
                    <button className="btn btn-secondary btn-icon btn-sm group" title="Delete Class">
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

export default ClassListPage;
