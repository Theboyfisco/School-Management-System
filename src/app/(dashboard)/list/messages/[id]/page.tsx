import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import MessageForm from "@/components/forms/MessageForm";

async function getMessage(id: string) {
  const message = await prisma.message.findUnique({
    where: { id: parseInt(id) },
    include: {
      attachments: true,
      replies: {
        include: {
          attachments: true,
        },
        orderBy: { date: "asc" },
      },
    },
  });
  return message;
}

export default async function MessageDetails({ params }: { params: { id: string } }) {
  const message = await getMessage(params.id);
  if (!message) return notFound();

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-8">
      <button onClick={() => history.back()} className="mb-4 text-blue-600 dark:text-blue-400 hover:underline">&larr; Back</button>
      <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{message.title}</h1>
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {new Date(message.date).toLocaleDateString()} {message.isBroadcast && <span> | Broadcast</span>}
      </div>
      <div className="prose dark:prose-invert mb-4">
        {message.content}
      </div>
      {message.attachments && message.attachments.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Attachments</h4>
          <ul className="space-y-2">
            {message.attachments.map((file: any) => (
              <li key={file.id} className="flex items-center gap-2">
                <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">
                  {file.fileName}
                </a>
                <span className="text-xs text-gray-500 dark:text-gray-400">({(file.fileSize / 1024 / 1024).toFixed(2)} MB, {file.fileType})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Replies */}
      {message.replies && message.replies.length > 0 && (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Replies</h3>
          <div className="space-y-3">
            {message.replies.map((reply: any) => (
              <div key={reply.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {reply.senderRole} • {new Date(reply.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {reply.content}
                </div>
                {reply.attachments && reply.attachments.length > 0 && (
                  <ul className="space-y-1">
                    {reply.attachments.map((file: any) => (
                      <li key={file.id} className="flex items-center gap-2">
                        <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">
                          {file.fileName}
                        </a>
                        <span className="text-xs text-gray-500 dark:text-gray-400">({(file.fileSize / 1024 / 1024).toFixed(2)} MB, {file.fileType})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Reply Form */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Reply</h3>
        <MessageForm type="create" setOpen={() => {}} replyTo={message} />
      </div>
    </div>
  );
} 