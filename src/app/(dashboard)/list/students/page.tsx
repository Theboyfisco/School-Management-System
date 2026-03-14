import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableRow from "@/components/TableRow";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Prisma, Student } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
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
  PhoneIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import BulkSelectableTable, { BulkSelectionAll, BulkSelectionCheckbox } from "@/components/BulkSelectableTable";
import { bulkDeleteStudents } from "@/lib/actions";

type StudentList = Student & { class: Class };

const StudentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role as string;

  const columns = [
    {
      header: "Student",
      accessor: "student",
      sortable: true,
    },
    {
      header: "Student ID",
      accessor: "studentId",
      className: "hidden md:table-cell",
      sortable: true,
    },
    {
      header: "Grade",
      accessor: "grade",
      className: "hidden md:table-cell",
      sortable: true,
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
  const query: Prisma.StudentWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "teacherId":
            query.class = {
              lessons: {
                some: {
                  teacherId: value,
                },
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
  let orderBy: Prisma.StudentOrderByWithRelationInput = {};
  if (sortBy) {
    switch (sortBy) {
      case 'student':
        orderBy.name = sortOrder === 'desc' ? 'desc' : 'asc';
        break;
      case 'studentId':
        orderBy.username = sortOrder === 'desc' ? 'desc' : 'asc';
        break;
      case 'grade':
        orderBy.class = { name: sortOrder === 'desc' ? 'desc' : 'asc' };
        break;
      default:
        orderBy.name = 'asc';
    }
  } else {
    orderBy.name = 'asc';
  }

  const [data, count] = await prisma.$transaction([
    prisma.student.findMany({
      where: query,
      select: {
        id: true,
        username: true,
        name: true,
        surname: true,
        email: true,
        phone: true,
        address: true,
        img: true,
        sex: true,
        class: {
          select: {
            id: true,
            name: true,
          }
        },
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.student.count({ where: query }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white font-display">Students</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Manage and view all students</p>
        </div>
        
        <div className="flex items-center gap-3">
          {role === "admin" && (
            <FormContainer table="student" type="create">
              <button className="btn btn-primary gap-2">
                <PlusIcon className="w-5 h-5" />
                <span>Add Student</span>
              </button>
            </FormContainer>
          )}
        </div>
      </div>

      {/* Stats Summary Card */}
      <div className="card p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-center gap-6 sm:gap-8">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-600 dark:text-primary-400 shadow-sm border border-primary-100/50 dark:border-primary-500/20">
              <UserGroupIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-surface-500 dark:text-surface-400 font-bold uppercase tracking-wider">Total Students</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-white leading-tight">{count}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center text-accent-600 dark:text-accent-400 shadow-sm border border-accent-100/50 dark:border-accent-500/20">
              <IdentificationIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-surface-500 dark:text-surface-400 font-bold uppercase tracking-wider">Active Status</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-white leading-tight">{count}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-surface-50 dark:bg-surface-800/50 p-3 rounded-xl border border-dotted border-surface-200 dark:border-surface-700/50 sm:col-span-2 lg:col-span-2">
            <div className="flex-1 text-center">
              <p className="text-[10px] text-surface-400 dark:text-surface-500 uppercase tracking-widest font-black mb-1">Male Students</p>
              <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{data.filter(s => s.sex === 'MALE').length}</p>
              </div>
            </div>
            <div className="w-px h-8 bg-surface-200 dark:bg-surface-700 hidden sm:block" />
            <div className="flex-1 text-center">
              <p className="text-[10px] text-surface-400 dark:text-surface-500 uppercase tracking-widest font-black mb-1">Female Students</p>
              <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
                <p className="text-xl font-bold text-pink-600 dark:text-pink-400">{data.filter(s => s.sex === 'FEMALE').length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <TableSearch placeholder="Search students..." />
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
      <BulkSelectableTable
        allIds={data.map(item => item.id)}
        tableName="student"
        deleteAction={bulkDeleteStudents}
      >
        <Table 
          columns={[
            ...(role === "admin" ? [{
              header: <BulkSelectionAll allIds={data.map(item => item.id)} />,
              accessor: "select",
              className: "w-12",
            }] : []),
            ...columns
          ]}
          loading={false}
          emptyMessage="No students found matching your search criteria."
        >
          {data.map((item, index) => (
            <TableRow key={item.id} index={index} id={item.id}>
              {role === "admin" && (
                <td className="px-3 py-4 text-center">
                  <BulkSelectionCheckbox id={item.id} />
                </td>
              )}
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
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-surface-900 rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-surface-900 dark:text-white font-display">
                        {item.name} {item.surname}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <AcademicCapIcon className="w-3 h-3 text-surface-400" />
                        <span className="text-[11px] font-medium text-surface-500 dark:text-surface-400">
                          {item.class.name}
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
                  <span className="badge badge-primary">
                    Grade {item.class.name.charAt(0)}
                  </span>
                </td>

                <td className="hidden lg:table-cell px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 group">
                      <EnvelopeIcon className="w-3.5 h-3.5 text-surface-400 group-hover:text-primary-500 transition-colors" />
                      <span className="text-[13px] text-surface-600 dark:text-surface-400 truncate max-w-[140px]">
                        {item.email || "—"}
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
                      <Link href={`/list/students/${item.id}`}>
                        <button className="btn btn-secondary btn-icon btn-sm group" title="View Details">
                          <EyeIcon className="w-4 h-4 text-surface-400 group-hover:text-primary-500" />
                        </button>
                      </Link>
                      <FormContainer table="student" type="update" data={item}>
                        <button className="btn btn-secondary btn-icon btn-sm group" title="Edit Student">
                          <PencilSquareIcon className="w-4 h-4 text-surface-400 group-hover:text-amber-500" />
                        </button>
                      </FormContainer>
                      <FormContainer table="student" type="delete" id={item.id}>
                        <button className="btn btn-secondary btn-icon btn-sm group" title="Delete Student">
                          <TrashIcon className="w-4 h-4 text-surface-400 group-hover:text-danger-500" />
                        </button>
                      </FormContainer>
                    </div>
                  </td>
                )}
              </TableRow>
            ))}
          </Table>
      </BulkSelectableTable>

      {/* Pagination */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default StudentListPage;
