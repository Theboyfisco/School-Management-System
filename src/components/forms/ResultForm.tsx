"use client";

import { createResult, updateResult } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";

type ResultFormProps = {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
};

const ResultForm = ({ type, data, setOpen, relatedData }: ResultFormProps) => {
  const router = useRouter();
  const [assessmentType, setAssessmentType] = useState<'exam' | 'assignment'>('exam');
  const [state, formAction] = useFormState(
    type === "create" ? createResult : updateResult,
    { success: false, error: false, message: "" }
  );

  useEffect(() => {
    if (state.success) {
      toast.success(`Result ${type === "create" ? "created" : "updated"} successfully!`);
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error(state.message || `Failed to ${type} result`);
    }
  }, [state, router, type, setOpen]);

  return (
    <form action={formAction} className="p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        {type === "create" ? "Create New Result" : "Update Result"}
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
              {student.name} {student.surname}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Assessment Type
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="assessmentType"
              value="exam"
              checked={assessmentType === 'exam'}
              onChange={(e) => setAssessmentType(e.target.value as 'exam' | 'assignment')}
              className="mr-2"
            />
            Exam
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="assessmentType"
              value="assignment"
              checked={assessmentType === 'assignment'}
              onChange={(e) => setAssessmentType(e.target.value as 'exam' | 'assignment')}
              className="mr-2"
            />
            Assignment
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="assessmentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {assessmentType === 'exam' ? 'Exam' : 'Assignment'}
        </label>
        <select
          id="assessmentId"
          name="assessmentId"
          defaultValue={data?.examId || data?.assignmentId || ""}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lamaSky focus:border-lamaSky dark:bg-gray-700 dark:text-white"
        >
          <option value="">Select a {assessmentType}</option>
          {assessmentType === 'exam' 
            ? relatedData?.exams?.map((exam: any) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title} - {exam.lesson.subject.name} ({exam.lesson.class.name})
                </option>
              ))
            : relatedData?.assignments?.map((assignment: any) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.title} - {assignment.lesson.subject.name} ({assignment.lesson.class.name})
                </option>
              ))
          }
        </select>
      </div>

      <div>
        <label htmlFor="score" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Score
        </label>
        <input
          type="number"
          id="score"
          name="score"
          min="0"
          max="100"
          defaultValue={data?.score || ""}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lamaSky focus:border-lamaSky dark:bg-gray-700 dark:text-white"
        />
      </div>

      <input type="hidden" name="assessmentType" value={assessmentType} />

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

export default ResultForm; 