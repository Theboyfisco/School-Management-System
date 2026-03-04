"use client";

import { createEvent, updateEvent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";

type EventFormProps = {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
};

const EventForm = ({ type, data, setOpen, relatedData }: EventFormProps) => {
  const router = useRouter();
  const [state, formAction] = useFormState(
    type === "create" ? createEvent : updateEvent,
    { success: false, error: false, message: "" }
  );

  useEffect(() => {
    if (state.success) {
      toast.success(`Event ${type === "create" ? "created" : "updated"} successfully!`);
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error(state.message || `Failed to ${type} event`);
    }
  }, [state, router, type, setOpen]);

  return (
    <form action={formAction} className="p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        {type === "create" ? "Create New Event" : "Update Event"}
      </h2>
      
      {type === "update" && (
        <input type="hidden" name="id" value={data?.id} />
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Event Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          defaultValue={data?.title || ""}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lamaSky focus:border-lamaSky dark:bg-gray-700 dark:text-white"
          placeholder="Enter event title"
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
          placeholder="Enter event description (optional)"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Date & Time *
          </label>
          <input
            type="datetime-local"
            id="startTime"
            name="startTime"
            defaultValue={data?.startTime ? new Date(data.startTime).toISOString().slice(0, 16) : ""}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lamaSky focus:border-lamaSky dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            End Date & Time *
          </label>
          <input
            type="datetime-local"
            id="endTime"
            name="endTime"
            defaultValue={data?.endTime ? new Date(data.endTime).toISOString().slice(0, 16) : ""}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lamaSky focus:border-lamaSky dark:bg-gray-700 dark:text-white"
          />
        </div>
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
          <option value="">School-wide Event</option>
          {relatedData?.classes?.map((classItem: any) => (
            <option key={classItem.id} value={classItem.id}>
              {classItem.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Leave empty for school-wide events, or select a specific class
        </p>
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
          {type === "create" ? "Create Event" : "Update Event"}
        </button>
      </div>
    </form>
  );
};

export default EventForm; 