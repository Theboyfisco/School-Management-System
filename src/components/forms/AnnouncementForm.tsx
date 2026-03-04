"use client";
import { createAnnouncement, updateAnnouncement } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";

type AnnouncementFormProps = {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
};

const AnnouncementForm = ({ type, data, setOpen, relatedData }: AnnouncementFormProps) => {
  const router = useRouter();
  const [state, formAction] = useFormState(
    type === "create" ? createAnnouncement : updateAnnouncement,
    { success: false, error: false, message: "" }
  );

  useEffect(() => {
    if (state.success) {
      toast.success(`Announcement ${type === "create" ? "created" : "updated"} successfully!`);
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error(state.message || `Failed to ${type} announcement`);
    }
  }, [state, router, type, setOpen]);

  return (
    <form action={formAction} className="p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        {type === "create" ? "Create New Announcement" : "Update Announcement"}
      </h2>
      {type === "update" && (
        <input type="hidden" name="id" value={data?.id} />
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
          placeholder="Enter announcement title"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={data?.description || ""}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lamaSky focus:border-lamaSky dark:bg-gray-700 dark:text-white"
          placeholder="Enter announcement description (optional)"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            defaultValue={data?.date ? new Date(data.date).toISOString().slice(0, 10) : ""}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lamaSky focus:border-lamaSky dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="classId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Target Class
          </label>
          <select
            id="classId"
            name="classId"
            defaultValue={data?.classId || ""}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lamaSky focus:border-lamaSky dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Classes</option>
            {relatedData?.classes?.map((cls: any) => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>
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
          {type === "create" ? "Create Announcement" : "Update Announcement"}
        </button>
      </div>
    </form>
  );
};

export default AnnouncementForm; 