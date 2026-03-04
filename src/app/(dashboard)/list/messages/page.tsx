import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableRow from "@/components/TableRow";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Message, Prisma } from "@prisma/client";
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
  ChatBubbleLeftIcon,
  UserIcon,
  ClockIcon,
  PaperClipIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

type MessageList = Message & { 
  MessageRead: { userId: string }[];
  attachments: { id: number }[];
};

const MessageListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role as string;
  const userId = user?.id;
  
  const columns = [
    {
      header: "Message",
      accessor: "message",
      sortable: true,
    },
    {
      header: "From",
      accessor: "sender",
      className: "hidden md:table-cell",
      sortable: true,
    },
    {
      header: "To",
      accessor: "recipient",
      className: "hidden lg:table-cell",
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden xl:table-cell",
    },
    {
      header: "Status",
      accessor: "status",
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
  const query: Prisma.MessageWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.OR = [
              { content: { contains: value, mode: "insensitive" } },
              { title: { contains: value, mode: "insensitive" } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // Sorting
  let orderBy: Prisma.MessageOrderByWithRelationInput = {};
  if (sortBy) {
    switch (sortBy) {
      case 'message':
        orderBy.content = sortOrder === 'desc' ? 'desc' : 'asc';
        break;
      case 'message':
        orderBy.content = sortOrder === 'desc' ? 'desc' : 'asc';
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
    prisma.message.findMany({
      where: query,
      include: {
        MessageRead: {
          where: { userId: userId || "" }
        },
        attachments: true,
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.message.count({ where: query }),
  ]);

  // Enrich data with read status and names
  const enrichedData = data.map((message) => ({
    ...message,
    read: message.MessageRead.length > 0,
    senderName: `${message.senderRole} (${message.senderId})`,
    recipientName: message.recipientId ? `${message.recipientRole} (${message.recipientId})` : 'Broadcast',
  }));

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white font-display">Messages</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1 uppercase tracking-wider text-[11px] font-bold">
            Communication Hub • {role.charAt(0).toUpperCase() + role.slice(1)} View
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <FormContainer table="message" type="create">
            <button className="btn btn-primary gap-2 shadow-glow shadow-primary-500/20">
              <PlusIcon className="w-5 h-5" />
              <span>Compose Message</span>
            </button>
          </FormContainer>
        </div>
      </div>

      {/* Stats Summary Card */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-8 md:gap-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-600 dark:text-primary-400">
              <ChatBubbleLeftIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Total Inbox</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">{count}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-danger-50 dark:bg-danger-500/10 flex items-center justify-center text-danger-600 dark:text-danger-400">
              <ChatBubbleLeftIcon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Unread</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">
                {enrichedData.filter(msg => !msg.read).length}
              </p>
            </div>
          </div>

          <div className="h-10 w-px bg-surface-100 dark:bg-surface-700/50 hidden md:block" />

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center text-accent-600 dark:text-accent-400">
              <UserIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">External Senders</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">
                {new Set(enrichedData.map(msg => msg.senderId)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full lg:max-w-md">
          <TableSearch placeholder="Search messages or subjects..." />
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          <button className="btn btn-secondary btn-icon" title="Filter results">
            <FunnelIcon className="w-5 h-5" />
          </button>
          <button className="btn btn-secondary btn-icon" title="Sort Order">
            <ArrowUpIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <Table 
        columns={columns}
        emptyMessage="Your inbox is clear! No messages matching your search."
      >
        {enrichedData.map((item, index) => (
          <TableRow key={item.id} index={index}>
            <td className="px-6 py-4">
              <div className="flex items-center gap-4">
                <div className={`relative flex items-center justify-center w-11 h-11 rounded-xl shadow-sm transition-transform hover:scale-105 ${item.read ? 'bg-surface-100 dark:bg-surface-800 text-surface-400' : 'bg-gradient-to-br from-primary-500 to-indigo-600 text-white shadow-glow shadow-primary-500/20'}`}>
                  <ChatBubbleLeftIcon className="w-6 h-6" />
                  {!item.read && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger-500 border-2 border-white dark:border-surface-900 rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-display truncate ${item.read ? 'text-surface-600 dark:text-surface-300' : 'text-surface-900 dark:text-white font-bold'}`}>
                    {item.content}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.attachments && item.attachments.length > 0 && (
                      <PaperClipIcon className="w-3.5 h-3.5 text-primary-500" />
                    )}
                    <span className="text-[11px] font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                      {new Date(item.date).toLocaleDateString()} • {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </td>

            <td className="hidden md:table-cell px-6 py-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/noAvatar.png"
                  alt=""
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-surface-50 dark:ring-surface-800"
                />
                <div>
                  <p className="text-sm font-bold text-surface-900 dark:text-white truncate max-w-[120px]">
                    {item.senderName}
                  </p>
                  <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest leading-none">
                    {item.senderRole}
                  </p>
                </div>
              </div>
            </td>

            <td className="hidden lg:table-cell px-6 py-4">
              <div className="flex items-center gap-3 opacity-80">
                <Image
                  src="/noAvatar.png"
                  alt=""
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover grayscale ring-1 ring-surface-100 dark:ring-surface-700"
                />
                <div>
                  <p className="text-sm font-medium text-surface-700 dark:text-surface-200 truncate max-w-[120px]">
                    {item.recipientName}
                  </p>
                  <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest leading-none">
                    {item.recipientRole}
                  </p>
                </div>
              </div>
            </td>

            <td className="hidden xl:table-cell px-6 py-4">
              <div className="flex items-center gap-2 text-surface-500 dark:text-surface-400">
                <ClockIcon className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </td>

            <td className="hidden 2xl:table-cell px-6 py-4">
              <div className="flex items-center gap-2">
                {item.read ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-success-50 dark:bg-success-500/10 text-success-700 dark:text-success-400 ring-1 ring-inset ring-success-600/20">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Read</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 ring-1 ring-inset ring-primary-600/20">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider">New</span>
                  </div>
                )}
              </div>
            </td>

            {role === "admin" && (
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5 justify-end">
                  <Link href={`/list/messages/${item.id}`}>
                    <button className="btn btn-secondary btn-icon btn-sm group" title="View Message">
                      <EyeIcon className="w-4 h-4 text-surface-400 group-hover:text-primary-500" />
                    </button>
                  </Link>
                  <FormContainer table="message" type="update" data={item}>
                    <button className="btn btn-secondary btn-icon btn-sm group" title="Forward/Edit">
                      <PencilIcon className="w-4 h-4 text-surface-400 group-hover:text-amber-500" />
                    </button>
                  </FormContainer>
                  <FormContainer table="message" type="delete" id={item.id}>
                    <button className="btn btn-secondary btn-icon btn-sm group" title="Archive">
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

export default MessageListPage; 