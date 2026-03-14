import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableRow from "@/components/TableRow";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Announcement, Class, Prisma } from "@prisma/client";
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
  MegaphoneIcon,
  AcademicCapIcon,
  CalendarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import BulkSelectableTable, { BulkSelectionAll, BulkSelectionCheckbox } from "@/components/BulkSelectableTable";
import { bulkDeleteAnnouncements } from "@/lib/actions";
import RealtimeAutoRefresh from "@/components/RealtimeAutoRefresh";

type AnnouncementList = Announcement & { class: Class };

const AnnouncementListPage = async ({
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
      header: "Announcement",
      accessor: "announcement",
      sortable: true,
    },
    {
      header: "Class",
      accessor: "class",
      className: "hidden md:table-cell",
      sortable: true,
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden lg:table-cell",
      sortable: true,
    },
    {
      header: "Scope",
      accessor: "scope",
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
  const query: Prisma.AnnouncementWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.OR = [
              { title: { contains: value, mode: "insensitive" } },
              { description: { contains: value, mode: "insensitive" } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // ROLE CONDITIONS
  const roleConditions = {
    teacher: { lessons: { some: { teacherId: currentUserId! } } },
    student: { students: { some: { id: currentUserId! } } },
    parent: { students: { some: { parentId: currentUserId! } } },
  };

  query.OR = [
    { classId: null },
    {
      class: roleConditions[role as keyof typeof roleConditions] || {},
    },
  ];

  // Sorting
  let orderBy: Prisma.AnnouncementOrderByWithRelationInput = {};
  if (sortBy) {
    switch (sortBy) {
      case 'announcement':
        orderBy.title = sortOrder === 'desc' ? 'desc' : 'asc';
        break;
      case 'class':
        orderBy.class = { name: sortOrder === 'desc' ? 'desc' : 'asc' };
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

  const [data, count] = await prisma.$transaction([
    prisma.announcement.findMany({
      where: query,
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        classId: true,
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
    prisma.announcement.count({ where: query }),
  ]);

  return (
    <div className="space-y-6">
      <RealtimeAutoRefresh table="announcement" />
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white font-display">Announcements</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1 uppercase tracking-wider text-[11px] font-bold">
            Stay updated with school news and updates
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {role === "admin" && (
            <FormContainer table="announcement" type="create">
              <button className="btn btn-primary gap-2 shadow-glow shadow-primary-500/20">
                <PlusIcon className="w-5 h-5" />
                <span>New Announcement</span>
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
              <MegaphoneIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Total</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">{count}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <UserGroupIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">School-wide</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">
                {data.filter(announcement => !announcement.classId).length}
              </p>
            </div>
          </div>

          <div className="h-10 w-px bg-surface-100 dark:bg-surface-700/50 hidden md:block" />

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center text-accent-600 dark:text-accent-400">
              <AcademicCapIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Class Specific</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">
                {new Set(data.map(announcement => announcement.class?.name).filter(Boolean)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full lg:max-w-md">
          <TableSearch placeholder="Search announcements..." />
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          <button className="btn btn-secondary btn-icon" title="Sort Order">
            <ArrowUpIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <BulkSelectableTable
        allIds={data.map(item => item.id)}
        tableName="announcement"
        deleteAction={bulkDeleteAnnouncements}
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
          emptyMessage="No announcements found matching your criteria."
        >
          {data.map((item, index) => (
            <TableRow key={item.id} index={index} id={item.id}>
              {role === "admin" && (
                <td className="px-3 py-4 text-center">
                  <BulkSelectionCheckbox id={item.id} />
                </td>
              )}
              <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-11 h-11 bg-gradient-to-br from-indigo-500 to-primary-600 rounded-xl shadow-glow shadow-primary-500/10 transition-transform hover:scale-105 text-white">
                      <MegaphoneIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-surface-900 dark:text-white font-display">
                        {item.title}
                      </h3>
                      <p className="text-xs text-surface-500 dark:text-surface-400 line-clamp-1 mt-0.5">
                        {item.description || "No description provided"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="hidden md:table-cell px-6 py-4">
                  {item.class ? (
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-surface-900 dark:text-white">
                        {item.class.name}
                      </span>
                      <span className="text-[10px] font-bold text-primary-500 uppercase tracking-widest mt-0.5 px-1.5 py-0.5 bg-primary-50 dark:bg-primary-500/10 rounded w-fit">
                        Targeted
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col italic">
                      <span className="text-sm font-medium text-surface-400">
                        N/A
                      </span>
                      <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-0.5">
                        Global
                      </span>
                    </div>
                  )}
                </td>

                <td className="hidden lg:table-cell px-6 py-4">
                  <div className="flex items-center gap-2 text-surface-500 dark:text-surface-400">
                    <CalendarIcon className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </td>

                <td className="hidden xl:table-cell px-6 py-4">
                  <span className={`badge ${item.classId ? 'badge-primary' : 'badge-accent'}`}>
                    {item.classId ? 'Class' : 'School'}
                  </span>
                </td>

                {role === "admin" && (
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 justify-end">
                      <Link href={`/list/announcements/${item.id}`}>
                        <button className="btn btn-secondary btn-icon btn-sm group" title="View Details">
                          <EyeIcon className="w-4 h-4 text-surface-400 group-hover:text-primary-500" />
                        </button>
                      </Link>
                      <FormContainer table="announcement" type="update" data={item}>
                        <button className="btn btn-secondary btn-icon btn-sm group" title="Edit Announcement">
                          <PencilIcon className="w-4 h-4 text-surface-400 group-hover:text-amber-500" />
                        </button>
                      </FormContainer>
                      <FormContainer table="announcement" type="delete" id={item.id}>
                        <button className="btn btn-secondary btn-icon btn-sm group" title="Delete Announcement">
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

      <Pagination page={p} count={count} />
    </div>
  );
};

export default AnnouncementListPage;
