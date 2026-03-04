import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableRow from "@/components/TableRow";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { Class, Prisma, Subject, Teacher } from "@prisma/client";
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
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

type TeacherList = Teacher & { subjects: Subject[] } & { classes: Class[] };

const TeacherListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role as string;
  
  const columns = [
    {
      header: "Teacher",
      accessor: "teacher",
      sortable: true,
    },
    {
      header: "Teacher ID",
      accessor: "teacherId",
      className: "hidden md:table-cell",
      sortable: true,
    },
    {
      header: "Subjects",
      accessor: "subjects",
      className: "hidden md:table-cell",
    },
    {
      header: "Classes",
      accessor: "classes",
      className: "hidden md:table-cell",
    },
    {
      header: "Contact",
      accessor: "contact",
      className: "hidden lg:table-cell",
    },
    {
      header: "Address",
      accessor: "address",
      className: "hidden xl:table-cell",
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
  const query: Prisma.TeacherWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.lessons = {
              some: {
                classId: parseInt(value),
              },
            };
            break;
          case "search":
            query.OR = [
              { name: { contains: value, mode: "insensitive" } },
              { surname: { contains: value, mode: "insensitive" } },
              { email: { contains: value, mode: "insensitive" } },
              { username: { contains: value, mode: "insensitive" } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // Sorting
  let orderBy: Prisma.TeacherOrderByWithRelationInput = {};
  if (sortBy) {
    switch (sortBy) {
      case 'teacher':
        orderBy.name = sortOrder === 'desc' ? 'desc' : 'asc';
        break;
      case 'teacherId':
        orderBy.username = sortOrder === 'desc' ? 'desc' : 'asc';
        break;
      default:
        orderBy.name = 'asc';
    }
  } else {
    orderBy.name = 'asc';
  }

  const [data, count] = await prisma.$transaction([
    prisma.teacher.findMany({
      where: query,
      include: {
        subjects: true,
        classes: true,
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.teacher.count({ where: query }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white font-display">Teachers</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Manage and view all faculty members</p>
        </div>
        
        <div className="flex items-center gap-3">
          {role === "admin" && (
            <FormContainer table="teacher" type="create">
              <button className="btn btn-primary gap-2">
                <PlusIcon className="w-5 h-5" />
                <span>Add Teacher</span>
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
              <UserGroupIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Total Teachers</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">{count}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center text-accent-600 dark:text-accent-400">
              <AcademicCapIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Departments</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">12</p>
            </div>
          </div>

          <div className="h-10 w-px bg-surface-100 dark:bg-surface-700/50 hidden md:block" />

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-xs text-surface-500 dark:text-surface-400 uppercase tracking-wider font-bold mb-1">Male</p>
              <p className="text-lg font-bold text-blue-500">{data.filter(t => t.sex === 'MALE').length}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-surface-500 dark:text-surface-400 uppercase tracking-wider font-bold mb-1">Female</p>
              <p className="text-lg font-bold text-pink-500">{data.filter(t => t.sex === 'FEMALE').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <TableSearch placeholder="Search teachers..." />
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
        emptyMessage="No teachers found matching your search criteria."
      >
        {data.map((item, index) => (
          <TableRow key={item.id} index={index}>
            <td className="px-6 py-4">
              <div className="flex gap-4 items-center">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-tr from-primary-500 to-accent-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity" />
                  <Image
                    src={item.img || "/noAvatar.png"}
                    alt=""
                    width={44}
                    height={44}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-surface-50 dark:ring-surface-800"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-surface-900 dark:text-white font-display">
                    {item.name} {item.surname}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.sex === 'MALE' ? 'bg-blue-500' : 'bg-pink-500'}`} />
                    <span className="text-[11px] font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                      {item.sex}
                    </span>
                  </div>
                </div>
              </div>
            </td>
            
            <td className="hidden md:table-cell px-6 py-4">
              <span className="text-sm font-mono text-surface-600 dark:text-surface-400 bg-surface-50 dark:bg-surface-800/50 px-2 py-1 rounded-md border border-surface-100 dark:border-surface-700/50">
                {item.username}
              </span>
            </td>

            <td className="hidden md:table-cell px-6 py-4">
              <div className="flex flex-wrap gap-1.5">
                {item.subjects.slice(0, 2).map((subject) => (
                  <span key={subject.id} className="badge badge-accent">
                    {subject.name}
                  </span>
                ))}
                {item.subjects.length > 2 && (
                  <span className="badge badge-secondary">+{item.subjects.length - 2}</span>
                )}
              </div>
            </td>

            <td className="hidden md:table-cell px-6 py-4">
              <div className="flex flex-wrap gap-1.5">
                {item.classes.slice(0, 2).map((cls) => (
                  <span key={cls.id} className="badge badge-primary">
                    {cls.name}
                  </span>
                ))}
                {item.classes.length > 2 && (
                  <span className="badge badge-secondary">+{item.classes.length - 2}</span>
                )}
              </div>
            </td>

            <td className="hidden lg:table-cell px-6 py-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 group">
                  <EnvelopeIcon className="w-3.5 h-3.5 text-surface-400 group-hover:text-primary-500 transition-colors" />
                  <span className="text-[13px] text-surface-600 dark:text-surface-400 truncate max-w-[140px]">
                    {item.email}
                  </span>
                </div>
                <div className="flex items-center gap-2 group">
                  <PhoneIcon className="w-3.5 h-3.5 text-surface-400 group-hover:text-primary-500 transition-colors" />
                  <span className="text-[13px] text-surface-600 dark:text-surface-400">
                    {item.phone || "—"}
                  </span>
                </div>
              </div>
            </td>

            <td className="hidden xl:table-cell px-6 py-4">
              <div className="flex items-start gap-2 max-w-[200px]">
                <MapPinIcon className="w-3.5 h-3.5 text-surface-400 mt-0.5 flex-shrink-0" />
                <span className="text-[13px] text-surface-600 dark:text-surface-400 line-clamp-2 leading-relaxed">
                  {item.address}
                </span>
              </div>
            </td>

            {role === "admin" && (
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5 justify-end">
                  <Link href={`/list/teachers/${item.id}`}>
                    <button className="btn btn-secondary btn-icon btn-sm group" title="View Details">
                      <EyeIcon className="w-4 h-4 text-surface-400 group-hover:text-primary-500" />
                    </button>
                  </Link>
                  <FormContainer table="teacher" type="update" data={item}>
                    <button className="btn btn-secondary btn-icon btn-sm group" title="Edit Teacher">
                      <PencilSquareIcon className="w-4 h-4 text-surface-400 group-hover:text-amber-500" />
                    </button>
                  </FormContainer>
                  <FormContainer table="teacher" type="delete" id={item.id}>
                    <button className="btn btn-secondary btn-icon btn-sm group" title="Delete Teacher">
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

export default TeacherListPage;
