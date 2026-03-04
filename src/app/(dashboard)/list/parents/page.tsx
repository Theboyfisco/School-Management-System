import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableRow from "@/components/TableRow";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Parent, Prisma, Student } from "@prisma/client";
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
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

type ParentList = Parent & { students: Student[] };

const ParentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role as string;
  
  const columns = [
    {
      header: "Parent",
      accessor: "parent",
      sortable: true,
    },
    {
      header: "Parent ID",
      accessor: "parentId",
      className: "hidden md:table-cell",
      sortable: true,
    },
    {
      header: "Children",
      accessor: "children",
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
  const query: Prisma.ParentWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
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
  let orderBy: Prisma.ParentOrderByWithRelationInput = {};
  if (sortBy) {
    switch (sortBy) {
      case 'parent':
        orderBy.name = sortOrder === 'desc' ? 'desc' : 'asc';
        break;
      case 'parentId':
        orderBy.username = sortOrder === 'desc' ? 'desc' : 'asc';
        break;
      default:
        orderBy.name = 'asc';
    }
  } else {
    orderBy.name = 'asc';
  }

  const [data, count] = await prisma.$transaction([
    prisma.parent.findMany({
      where: query,
      include: {
        students: true,
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.parent.count({ where: query }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white font-display">Parents</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Manage and view parent information</p>
        </div>
        
        <div className="flex items-center gap-3">
          {role === "admin" && (
            <FormContainer table="parent" type="create">
              <button className="btn btn-primary gap-2">
                <PlusIcon className="w-5 h-5" />
                <span>Add Parent</span>
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
              <UsersIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Total Parents</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">{count}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center text-accent-600 dark:text-accent-400">
              <UserGroupIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Total Children</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">
                {data.reduce((acc, p) => acc + p.students.length, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <TableSearch placeholder="Search parents..." />
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
        emptyMessage="No parents found matching your search criteria."
      >
        {data.map((item, index) => (
          <TableRow key={item.id} index={index}>
            <td className="px-6 py-4">
              <div className="flex gap-4 items-center">
                <div className="w-11 h-11 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-400 ring-2 ring-surface-50 dark:ring-surface-900">
                  <UsersIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-surface-900 dark:text-white font-display">
                    {item.name} {item.surname}
                  </h3>
                  <span className="text-[11px] font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                    Parent / Guardian
                  </span>
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
                {item.students.slice(0, 2).map((student) => (
                  <span key={student.id} className="badge badge-primary">
                    {student.name}
                  </span>
                ))}
                {item.students.length > 2 && (
                  <span className="badge badge-secondary">+{item.students.length - 2}</span>
                )}
              </div>
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
                  <Link href={`/list/parents/${item.id}`}>
                    <button className="btn btn-secondary btn-icon btn-sm group" title="View Details">
                      <EyeIcon className="w-4 h-4 text-surface-400 group-hover:text-primary-500" />
                    </button>
                  </Link>
                  <FormContainer table="parent" type="update" data={item}>
                    <button className="btn btn-secondary btn-icon btn-sm group" title="Edit Parent">
                      <PencilSquareIcon className="w-4 h-4 text-surface-400 group-hover:text-amber-500" />
                    </button>
                  </FormContainer>
                  <FormContainer table="parent" type="delete" id={item.id}>
                    <button className="btn btn-secondary btn-icon btn-sm group" title="Delete Parent">
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

export default ParentListPage;
