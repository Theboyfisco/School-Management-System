import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableRow from "@/components/TableRow";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { Prisma, Subject, Teacher } from "@prisma/client";
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
  BookOpenIcon,
  AcademicCapIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

type SubjectList = Subject & { 
  teachers: Teacher[];
};

const SubjectListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role as string;
  
  const columns = [
    {
      header: "Subject",
      accessor: "subject",
      sortable: true,
    },
    {
      header: "Teachers",
      accessor: "teachers",
      className: "hidden md:table-cell",
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
  const query: Prisma.SubjectWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.OR = [
              { name: { contains: value, mode: "insensitive" } },
              { teachers: { some: { name: { contains: value, mode: "insensitive" } } } },
              { teachers: { some: { surname: { contains: value, mode: "insensitive" } } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // Sorting
  let orderBy: Prisma.SubjectOrderByWithRelationInput = {};
  if (sortBy) {
    switch (sortBy) {
      case 'subject':
        orderBy.name = sortOrder === 'desc' ? 'desc' : 'asc';
        break;
      case 'teacher':
        orderBy.teachers = { _count: sortOrder === 'desc' ? 'desc' : 'asc' };
        break;
      default:
        orderBy.name = 'asc';
    }
  } else {
    orderBy.name = 'asc';
  }

  const [data, count] = await prisma.$transaction([
    prisma.subject.findMany({
      where: query,
      include: {
        teachers: true,
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.subject.count({ where: query }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white font-display">Subjects</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Manage academic curriculum</p>
        </div>
        
        <div className="flex items-center gap-3">
          {role === "admin" && (
            <FormContainer table="subject" type="create">
              <button className="btn btn-primary gap-2">
                <PlusIcon className="w-5 h-5" />
                <span>Add Subject</span>
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
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Total Subjects</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">{count}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center text-accent-600 dark:text-accent-400">
              <UserGroupIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Active Teachers</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">
                {data.filter(s => s.teachers.length > 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <TableSearch placeholder="Search subjects..." />
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
        emptyMessage="No subjects found matching your search criteria."
      >
        {data.map((item, index) => (
          <TableRow key={item.id} index={index}>
            <td className="px-6 py-4">
              <div className="flex gap-4 items-center">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white ring-2 ring-surface-50 dark:ring-surface-900 shadow-sm">
                  <BookOpenIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-surface-900 dark:text-white font-display">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <AcademicCapIcon className="w-3 h-3 text-surface-400" />
                    <span className="text-[11px] font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                      Academic Subject
                    </span>
                  </div>
                </div>
              </div>
            </td>
            
            <td className="hidden md:table-cell px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {item.teachers.slice(0, 3).map((teacher) => (
                    <div key={teacher.id} className="relative group/avatar">
                      <Image
                        src={teacher.img || "/noAvatar.png"}
                        alt={teacher.name}
                        width={28}
                        height={28}
                        className="w-7 h-7 rounded-full object-cover border-2 border-surface-50 dark:border-surface-900 ring-1 ring-surface-100 dark:ring-surface-800"
                      />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-surface-900 text-white text-[10px] rounded opacity-0 group-hover/avatar:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        {teacher.name} {teacher.surname}
                      </div>
                    </div>
                  ))}
                  {item.teachers.length > 3 && (
                    <div className="w-7 h-7 rounded-full bg-surface-100 dark:bg-surface-800 border-2 border-surface-50 dark:border-surface-900 flex items-center justify-center text-[10px] font-bold text-surface-600 dark:text-surface-400">
                      +{item.teachers.length - 3}
                    </div>
                  )}
                </div>
                {item.teachers.length === 0 ? (
                  <span className="text-xs text-surface-400 italic">No assigned teachers</span>
                ) : (
                  <span className="text-xs font-medium text-surface-500 dark:text-surface-400">
                    {item.teachers.length} Faculty
                  </span>
                )}
              </div>
            </td>

            {role === "admin" && (
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5 justify-end">
                  <Link href={`/list/subjects/${item.id}`}>
                    <button className="btn btn-secondary btn-icon btn-sm group" title="View Details">
                      <EyeIcon className="w-4 h-4 text-surface-400 group-hover:text-primary-500" />
                    </button>
                  </Link>
                  <FormContainer table="subject" type="update" data={item}>
                    <button className="btn btn-secondary btn-icon btn-sm group" title="Edit Subject">
                      <PencilSquareIcon className="w-4 h-4 text-surface-400 group-hover:text-amber-500" />
                    </button>
                  </FormContainer>
                  <FormContainer table="subject" type="delete" id={item.id}>
                    <button className="btn btn-secondary btn-icon btn-sm group" title="Delete Subject">
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

export default SubjectListPage;
