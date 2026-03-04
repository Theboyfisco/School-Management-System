"use client";

import { createAttendance, updateAttendance } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";

type AttendanceFormProps = {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
};

const AttendanceForm = ({ type, data, setOpen, relatedData }: AttendanceFormProps) => {
  const router = useRouter();
  const [state, formAction] = useFormState(
    type === "create" ? createAttendance : updateAttendance,
    { success: false, error: false, message: "" }
  );

  useEffect(() => {
    if (state.success) {
      toast.success(`Attendance ${type === "create" ? "created" : "updated"} successfully!`);
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error(state.message || `Failed to ${type} attendance`);
    }
  }, [state, router, type, setOpen]);

  return (
    <form action={formAction} className="p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        {type === "create" ? "Create New Attendance Record" : "Update Attendance Record"}
      </h2>
      
      {type === "update" && (
        <input type="hidden" name="id" value={data?.id} />
      )}

      <div>
        <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Student
        </label>
        <select
          id="studentId"
          name="studentId"
          defaultValue={data?.studentId || ""}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lamaSky focus:border-lamaSky dark:bg-gray-700 dark:text-white"
        >
          <option value="">Select a student</option>
          {relatedData?.students?.map((student: any) => (
            <option key={student.id} value={student.id}>
              {student.name} {student.surname} ({student.class.name})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="lessonId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Lesson
        </label>
        <select
          id="lessonId"
          name="lessonId"
          defaultValue={data?.lessonId || ""}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lamaSky focus:border-lamaSky dark:bg-gray-700 dark:text-white"
        >
          <option value="">Select a lesson</option>
          {relatedData?.lessons?.map((lesson: any) => (
            <option key={lesson.id} value={lesson.id}>
              {lesson.name} - {lesson.subject.name} ({lesson.class.name}) - {lesson.teacher.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          defaultValue={data?.date ? new Date(data.date).toISOString().split('T')[0] : ""}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lamaSky focus:border-lamaSky dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Status
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="present"
              value="true"
              defaultChecked={data?.present !== false}
              className="mr-2"
            />
            Present
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="present"
              value="false"
              defaultChecked={data?.present === false}
              className="mr-2"
            />
            Absent
          </label>
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
          {type === "create" ? "Create" : "Update"}
        </button>
      </div>
    </form>
  );
};

export default AttendanceForm; 