"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import CustomDropdown from "../CustomDropdown";
import BaseForm from "./BaseForm";
import { assignmentSchema, AssignmentSchema } from "@/lib/formValidationSchemas";
import { createAssignment, updateAssignment } from "@/lib/actions";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { 
  ClipboardDocumentIcon, 
  CalendarDaysIcon, 
  ClockIcon,
  BookOpenIcon,
  CheckCircleIcon,
  SparklesIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const AssignmentForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<AssignmentSchema>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: data?.title || '',
      startDate: data?.startDate ? (data.startDate instanceof Date ? data.startDate.toISOString().slice(0, 16) : typeof data.startDate === 'string' ? data.startDate.slice(0, 16) : '') : '',
      dueDate: data?.dueDate ? (data.dueDate instanceof Date ? data.dueDate.toISOString().slice(0, 16) : typeof data.dueDate === 'string' ? data.dueDate.slice(0, 16) : '') : '',
      lessonId: data?.lessonId || undefined,
      id: data?.id || undefined,
    }
  });


  const router = useRouter();

  const onSubmit = handleSubmit(async (formData) => {
    const loadingToast = toast.loading(`${type === "create" ? "Assigning" : "Updating"} task...`);
    try {
      const result = await (type === 'create' 
        ? createAssignment({ success: false, error: false }, formData)
        : updateAssignment({ success: false, error: false }, formData)
      );

      if (result?.success) {
        toast.update(loadingToast, {
          render: `Assignment ${type === "create" ? "created" : "updated"} successfully!`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
          icon: <CheckCircleIcon className="w-5 h-5 text-success-500" />
        });
        setOpen(false);
        router.refresh();
      } else {
        toast.update(loadingToast, {
          render: result?.message || "Operation failed",
          type: "error",
          isLoading: false,
          autoClose: 5000
        });
      }
    } catch (error) {
      toast.update(loadingToast, {
        render: "A system error occurred",
        type: "error",
        isLoading: false,
        autoClose: 5000
      });
    }
  });

  const { lessons } = relatedData;

  const lessonOptions = (lessons || []).map((lesson: any) => ({
    value: lesson.id,
    label: `${lesson.subject.name} - ${lesson.class.name} (${lesson.teacher.name} ${lesson.teacher.surname})`,
    icon: <BookOpenIcon className="w-4 h-4" />
  }));

  return (
    <BaseForm
      title={type === "create" ? "New Assignment" : "Edit Assignment task"}
      subtitle={type === "create" ? "Create a new learning task for students" : "Modify assignment title, deadline or lesson link"}
      onSubmit={onSubmit}
      onCancel={() => setOpen(false)}
      submitLabel={type === "create" ? "Post Assignment" : "Save Changes"}
      isSubmitting={isSubmitting}
    >
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-50/50 to-primary-50/50 dark:from-indigo-500/10 dark:to-primary-500/10 rounded-[2rem] p-8 border border-white dark:border-surface-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <ClipboardDocumentIcon className="w-24 h-24" />
          </div>
          <div className="relative z-10 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-surface-800 shadow-xl flex items-center justify-center text-primary-500 ring-1 ring-surface-100 dark:ring-surface-700">
                  <SparklesIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                  <h3 className="text-xl font-bold text-surface-900 dark:text-white font-display">Task Planner</h3>
                  <p className="text-surface-500 dark:text-surface-400 text-sm font-medium">Coordinate homework and project deadlines.</p>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">
        <div className="space-y-10">
            {/* Identity Section */}
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <DocumentTextIcon className="w-4 h-4" />
                    Task Identity
                </h3>
                <InputField
                    label="Assignment Title"
                    name="title"
                    register={register}
                    error={errors?.title}
                    placeholder="e.g. Weekly Lab Report"
                    required
                />
            </div>

            {/* Content Context */}
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <BookOpenIcon className="w-4 h-4" />
                    Lesson association
                </h3>
                <CustomDropdown
                    label="Linked Lesson"
                    name="lessonId"
                    options={lessonOptions}
                    value={watch("lessonId")}
                    onChange={(val) => setValue("lessonId", val as any)}
                    placeholder="Select lesson context"
                    required
                    searchable
                />
            </div>
        </div>

        <div className="space-y-10">
            {/* Timing Section */}
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <ClockIcon className="w-4 h-4" />
                    Timeline window
                </h3>
                <div className="space-y-5">
                    <InputField
                        label="Available From"
                        name="startDate"
                        register={register}
                        error={errors?.startDate}
                        type="datetime-local"
                        icon={<CalendarDaysIcon className="w-4 h-4" />}
                        required
                    />
                    <InputField
                        label="Submission Deadline"
                        name="dueDate"
                        register={register}
                        error={errors?.dueDate}
                        type="datetime-local"
                        icon={<ClockIcon className="w-4 h-4" />}
                        required
                    />
                </div>
            </div>
        </div>
      </div>

      {type === "update" && data?.id && (
        <input type="hidden" {...register('id')} />
      )}
    </BaseForm>
  );
};

export default AssignmentForm;