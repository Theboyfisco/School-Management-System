"use client";

import {
  deleteClass,
  deleteExam,
  deleteStudent,
  deleteSubject,
  deleteTeacher,
  deleteParent,
  deleteLesson,
  deleteAssignment,
  deleteResult,
  deleteAttendance,
  deleteEvent,
  deleteAnnouncement,
  deleteMessage,
  CurrentState
} from "@/lib/actions";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState, useCallback } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import { FormContainerProps } from "./FormContainer";
import { 
  XMarkIcon, 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const deleteActionMap = {
  subject: deleteSubject,
  class: deleteClass,
  teacher: deleteTeacher,
  student: deleteStudent,
  exam: deleteExam,
  parent: deleteParent,
  lesson: deleteLesson,
  assignment: deleteAssignment,
  result: deleteResult,
  attendance: deleteAttendance,
  event: deleteEvent,
  announcement: deleteAnnouncement,
  message: deleteMessage,
} as const;

// Enhanced lazy loading with better loading states
const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: () => <FormLoadingSkeleton />,
  ssr: false
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => <FormLoadingSkeleton />,
  ssr: false
});
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
  loading: () => <FormLoadingSkeleton />,
  ssr: false
});
const ClassForm = dynamic(() => import("./forms/ClassForm"), {
  loading: () => <FormLoadingSkeleton />,
  ssr: false
});
const ExamForm = dynamic(() => import("./forms/ExamForm"), {
  loading: () => <FormLoadingSkeleton />,
  ssr: false
});
const ParentForm = dynamic(() => import("./forms/ParentForm"), {
  loading: () => <FormLoadingSkeleton />,
  ssr: false
});
const LessonForm = dynamic(() => import("./forms/LessonForm"), {
  loading: () => <FormLoadingSkeleton />,
  ssr: false
});
const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"), {
  loading: () => <FormLoadingSkeleton />,
  ssr: false
});
const ResultForm = dynamic(() => import("./forms/ResultForm"), {
  loading: () => <FormLoadingSkeleton />,
  ssr: false
});
const AttendanceForm = dynamic(() => import("./forms/AttendanceForm"), {
  loading: () => <FormLoadingSkeleton />,
  ssr: false
});
const EventForm = dynamic(() => import("./forms/EventForm"), {
  loading: () => <FormLoadingSkeleton />,
  ssr: false
});
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"), {
  loading: () => <FormLoadingSkeleton />,
  ssr: false
});
const MessageForm = dynamic(() => import("./forms/MessageForm"), {
  loading: () => <FormLoadingSkeleton />,
  ssr: false
});

// Loading skeleton component
const FormLoadingSkeleton = () => (
  <div className="animate-pulse space-y-6 p-8">
    <div className="flex items-center gap-4 mb-8">
      <div className="w-12 h-12 bg-surface-200 dark:bg-surface-700 rounded-xl" />
      <div className="h-8 bg-surface-200 dark:bg-surface-700 rounded-lg w-1/3" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-1/4" />
          <div className="h-12 bg-surface-200 dark:bg-surface-700 rounded-xl" />
        </div>
      ))}
    </div>
    <div className="flex justify-end gap-3 pt-6 border-t border-surface-100 dark:border-surface-800">
      <div className="h-10 bg-surface-200 dark:bg-surface-700 rounded-lg w-24"></div>
      <div className="h-10 bg-surface-200 dark:bg-surface-700 rounded-lg w-32"></div>
    </div>
  </div>
);

const forms: {
  [key: string]: (
    setOpen: Dispatch<SetStateAction<boolean>>,
    type: "create" | "update",
    data?: any,
    relatedData?: any
  ) => JSX.Element;
} = {
  subject: (setOpen, type, data, relatedData) => (
    <SubjectForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  class: (setOpen, type, data, relatedData) => (
    <ClassForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  teacher: (setOpen, type, data, relatedData) => (
    <TeacherForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  student: (setOpen, type, data, relatedData) => (
    <StudentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  exam: (setOpen, type, data, relatedData) => (
    <ExamForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  parent: (setOpen, type, data, relatedData) => (
    <ParentForm
      type={type}
      data={data}
      setOpen={setOpen}
    />
  ),
  lesson: (setOpen, type, data, relatedData) => (
    <LessonForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  assignment: (setOpen, type, data, relatedData) => (
    <AssignmentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  result: (setOpen, type, data, relatedData) => (
    <ResultForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  attendance: (setOpen, type, data, relatedData) => (
    <AttendanceForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  event: (setOpen, type, data, relatedData) => (
    <EventForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  announcement: (setOpen, type, data, relatedData) => (
    <AnnouncementForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  message: (setOpen, type, data, relatedData) => (
    <MessageForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
};

type ServerAction = (currentState: CurrentState, formData: FormData) => Promise<CurrentState>;

const FormModal = ({
  table,
  type,
  data,
  id,
  relatedData,
}: FormContainerProps & { relatedData?: any }) => {
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
    }, 200);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        handleClose();
      }
    };
    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, handleClose]);

  const Form = () => {
    const [state, formAction] = useFormState<CurrentState, FormData>(deleteActionMap[table] as ServerAction, {
      success: false,
      error: false
    });

    const router = useRouter();

    useEffect(() => {
      if (!state) return;
      
      if (state.success) {
        toast.success(`${table} has been deleted!`, {
          icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />
        });
        handleClose();
        router.refresh();
      } else if (state.error) {
        toast.error(state.message || `Failed to delete ${table}`, {
          icon: <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
        });
      }
    }, [state, router]); // eslint-disable-line react-hooks/exhaustive-deps

    return type === "delete" && id ? (
      <div className="p-8 max-w-md mx-auto text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-danger-50 dark:bg-danger-500/10 mb-6">
          <ExclamationTriangleIcon className="h-8 w-8 text-danger-600 dark:text-danger-400" />
        </div>
        <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-2 font-display">
          Delete {table}
        </h3>
        <p className="text-surface-500 dark:text-surface-400 mb-8 leading-relaxed">
          Are you sure? This action is permanent and cannot be undone.
        </p>
        
        <form action={formAction} className="flex gap-3">
          <input type="hidden" name="id" value={id} />
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="btn bg-danger-600 hover:bg-danger-700 text-white flex-1 gap-2"
          >
            <TrashIcon className="w-4 h-4" />
            Delete
          </button>
        </form>
      </div>
    ) : type === "create" || type === "update" ? (
      forms[table](setOpen, type, data, relatedData)
    ) : (
      <div className="p-12 text-center">
        <p className="text-surface-500 font-medium">Form not found!</p>
      </div>
    );
  };

  return (
    <>
      <button
        className={`
          btn btn-icon group relative
          ${type === 'create' ? 'btn-primary w-11 h-11' : 'btn-secondary w-9 h-9'}
        `}
        onClick={() => setOpen(true)}
      >
        {type === 'create' ? <PlusIcon className="w-5 h-5" /> : 
         type === 'update' ? <PencilSquareIcon className="w-4 h-4" /> : 
         <TrashIcon className="w-4 h-4" />}
        
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-surface-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none font-bold">
          {type.charAt(0).toUpperCase() + type.slice(1)} {table}
        </span>
      </button>

      {open && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop with premium blur */}
          <div 
            className={`
              fixed inset-0 bg-surface-950/40 backdrop-blur-md transition-opacity duration-300
              ${isClosing ? 'opacity-0' : 'opacity-100'}
            `}
            onClick={handleClose}
          />

          {/* Modal Container */}
          <div 
            className={`
              relative w-full max-w-4xl max-h-[90vh] overflow-hidden
              bg-white dark:bg-surface-900 rounded-[2rem] shadow-2xl border border-surface-200 dark:border-surface-800
              flex flex-col transform transition-all duration-300 ease-out
              ${isClosing ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'}
            `}
          >
            {/* Close Accent */}
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 z-20 w-10 h-10 flex items-center justify-center bg-surface-100 dark:bg-surface-800 text-surface-500 hover:text-surface-900 dark:hover:text-white rounded-full transition-all hover:rotate-90"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
              <Form />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
