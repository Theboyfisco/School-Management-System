"use client";
import { createMessage, updateMessage } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";

type MessageFormProps = {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
  replyTo?: any;
};

const MessageForm = ({ type, data, setOpen, relatedData, replyTo }: MessageFormProps) => {
  const router = useRouter();
  const [state, formAction] = useFormState(
    type === "create" ? createMessage : updateMessage,
    { success: false, error: false, message: "" }
  );

  const [recipients, setRecipients] = useState<any[]>([]);
  const [selectedRecipientType, setSelectedRecipientType] = useState<string>("");
  const [files, setFiles] = useState<FileList | null>(null);

  useEffect(() => {
    if (state.success) {
      toast.success(`Message ${type === "create" ? "sent" : "updated"} successfully!`);
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error(state.message || `Failed to ${type} message`);
    }
  }, [state, router, type, setOpen]);

  // Get available recipients based on user role
  useEffect(() => {
    if (relatedData) {
      const allRecipients: any[] = [];
      
      // Add teachers
      if (relatedData.teachers) {
        allRecipients.push(...relatedData.teachers.map((t: any) => ({
          id: t.id,
          name: `${t.name} ${t.surname}`,
          role: 'TEACHER',
          type: 'teacher'
        })));
      }
      
      // Add students
      if (relatedData.students) {
        allRecipients.push(...relatedData.students.map((s: any) => ({
          id: s.id,
          name: `${s.name} ${s.surname}`,
          role: 'STUDENT',
          type: 'student'
        })));
      }
      
      // Add parents
      if (relatedData.parents) {
        allRecipients.push(...relatedData.parents.map((p: any) => ({
          id: p.id,
          name: `${p.name} ${p.surname}`,
          role: 'PARENT',
          type: 'parent'
        })));
      }
      
      setRecipients(allRecipients);
    }
  }, [relatedData]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600';
      case 'HIGH': return 'text-orange-600';
      case 'NORMAL': return 'text-blue-600';
      case 'LOW': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'EMERGENCY': return 'text-red-600';
      case 'ACADEMIC': return 'text-green-600';
      case 'ADMINISTRATIVE': return 'text-purple-600';
      case 'GENERAL': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Submit message (create or update)
    let messageId: number | null = null;
    let result: any = null;
    if (type === "create") {
      const res = await fetch("/api/messages", {
        method: "POST",
        body: formData,
      });
      result = await res.json();
      if (res.ok && result.id) {
        messageId = result.id;
      } else {
        toast.error(result.error || "Failed to send message");
        return;
      }
    } else {
      // For update, use the existing logic
      formAction(formData);
      return;
    }

    // Upload attachments if any
    if (files && files.length > 0 && messageId) {
      const uploadData = new FormData();
      Array.from(files).forEach(file => uploadData.append("attachments", file));
      uploadData.append("messageId", String(messageId));
      const uploadRes = await fetch("/api/messages/attachments", {
        method: "POST",
        body: uploadData,
      });
      const uploadResult = await uploadRes.json();
      if (!uploadRes.ok) {
        toast.error(uploadResult.error || "Failed to upload attachments");
        return;
      }
    }

    toast.success("Message sent successfully!");
    setOpen(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        {type === "create" ? "Send New Message" : "Update Message"}
      </h2>
      
      {type === "update" && (
        <input type="hidden" name="id" value={data?.id} />
      )}
      
      {replyTo && (
        <input type="hidden" name="parentId" value={replyTo.id} />
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          defaultValue={data?.title || ""}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lamaSky focus:border-lamaSky dark:bg-gray-700 dark:text-white"
          placeholder="Enter message title"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Content *
        </label>
        <textarea
          id="content"
          name="content"
          defaultValue={data?.content || ""}
          rows={6}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lamaSky focus:border-lamaSky dark:bg-gray-700 dark:text-white"
          placeholder="Enter your message content"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={data?.category || "GENERAL"}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lamaSky focus:border-lamaSky dark:bg-gray-700 dark:text-white"
          >
            <option value="GENERAL" className={getCategoryColor('GENERAL')}>General</option>
            <option value="ACADEMIC" className={getCategoryColor('ACADEMIC')}>Academic</option>
            <option value="ADMINISTRATIVE" className={getCategoryColor('ADMINISTRATIVE')}>Administrative</option>
            <option value="EMERGENCY" className={getCategoryColor('EMERGENCY')}>Emergency</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue={data?.priority || "NORMAL"}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lamaSky focus:border-lamaSky dark:bg-gray-700 dark:text-white"
          >
            <option value="LOW" className={getPriorityColor('LOW')}>Low</option>
            <option value="NORMAL" className={getPriorityColor('NORMAL')}>Normal</option>
            <option value="HIGH" className={getPriorityColor('HIGH')}>High</option>
            <option value="URGENT" className={getPriorityColor('URGENT')}>Urgent</option>
          </select>
        </div>
      </div>

      {type === "create" && (
        <>
          <div>
            <label htmlFor="recipientType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Recipient Type
            </label>
            <select
              id="recipientType"
              value={selectedRecipientType}
              onChange={(e) => setSelectedRecipientType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lamaSky focus:border-lamaSky dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select recipient type</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
              <option value="broadcast">Broadcast to Role</option>
            </select>
          </div>

          {selectedRecipientType === "broadcast" && (
            <div>
              <label htmlFor="recipientRole" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Broadcast to Role
              </label>
              <select
                id="recipientRole"
                name="recipientRole"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lamaSky focus:border-lamaSky dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Users</option>
                <option value="TEACHER">All Teachers</option>
                <option value="STUDENT">All Students</option>
                <option value="PARENT">All Parents</option>
              </select>
              <input type="hidden" name="isBroadcast" value="true" />
            </div>
          )}

          {selectedRecipientType && selectedRecipientType !== "broadcast" && (
            <div>
              <label htmlFor="recipientId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Recipient
              </label>
              <select
                id="recipientId"
                name="recipientId"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lamaSky focus:border-lamaSky dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select a recipient</option>
                {recipients
                  .filter(r => r.type === selectedRecipientType)
                  .map((recipient) => (
                    <option key={recipient.id} value={recipient.id}>
                      {recipient.name} ({recipient.role})
                    </option>
                  ))}
              </select>
              <input type="hidden" name="recipientRole" value={selectedRecipientType.toUpperCase()} />
              <input type="hidden" name="isBroadcast" value="false" />
            </div>
          )}
        </>
      )}

      <div>
        <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Attach Files (max 5, 10MB each)
        </label>
        <input
          type="file"
          id="attachments"
          name="attachments"
          multiple
          accept="*"
          onChange={e => setFiles(e.target.files)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lamaSky focus:border-lamaSky dark:bg-gray-700 dark:text-white"
        />
        {files && files.length > 0 && (
          <ul className="mt-2 text-xs text-gray-600 dark:text-gray-300">
            {Array.from(files).map((file, idx) => (
              <li key={idx}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lamaSky"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-lamaSky border border-transparent rounded-md hover:bg-lamaSky/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lamaSky"
        >
          {type === "create" ? "Send Message" : "Update Message"}
        </button>
      </div>
    </form>
  );
};

export default MessageForm; 