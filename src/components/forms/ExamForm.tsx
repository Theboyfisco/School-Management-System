"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import CustomDropdown from "../CustomDropdown";
import BaseForm from "./BaseForm";
import { examSchema, ExamSchema } from "@/lib/formValidationSchemas";
import { createExam, updateExam } from "@/lib/actions";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { 
  ClipboardDocumentCheckIcon, 
  CalendarDaysIcon, 
  ClockIcon,
  BookOpenIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const ExamForm = ({
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
  } = useForm<ExamSchema>({
    resolver: zodResolver(examSchema),
     defaultValues: {
      title: data?.title || '',
      startTime: data?.startTime?.split('Z')[0] || '',
      endTime: data?.endTime?.split('Z')[0] || '',
      lessonId: data?.lessonId || undefined,
      id: data?.id || undefined,
    }
  });


  const router = useRouter();

  const onSubmit = handleSubmit(async (formData) => {
    const loadingToast = toast.loading(`${type === "create" ? "Scheduling" : "Updating"} assessment...`);
    try {
      const result = await (type === 'create' 
        ? createExam({ success: false, error: false }, formData)
        : updateExam({ success: false, error: false }, formData)
      );

      if (result?.success) {
        toast.update(loadingToast, {
          render: `Exam ${type === "create" ? "scheduled" : "updated"} successfully!`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
          icon: <CheckCircleIcon className="w-5 h-5 text-success-500" />
        });
        setOpen(false);
        router.refresh();
      } else {
        toast.update(loadingToast, {
          render: result?.message || "Scheduling failed",
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
    label: lesson.name,
    icon: <BookOpenIcon className="w-4 h-4" />
  }));

  return (
    <BaseForm
      title={type === "create" ? "New Assessment" : "Modify Exam Schedule"}
      subtitle={type === "create" ? "Plan and schedule a new formal assessment" : "Update exam timing or associated lesson details"}
      onSubmit={onSubmit}
      onCancel={() => setOpen(false)}
      submitLabel={type === "create" ? "Schedule Exam" : "Save Changes"}
      isSubmitting={isSubmitting}
    >
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-50/50 to-primary-50/50 dark:from-indigo-500/10 dark:to-primary-500/10 rounded-[2rem] p-8 border border-white dark:border-surface-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <ClipboardDocumentCheckIcon className="w-24 h-24" />
          </div>
          <div className="relative z-10 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-surface-800 shadow-xl flex items-center justify-center text-primary-500 ring-1 ring-surface-100 dark:ring-surface-700">
                  <SparklesIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                  <h3 className="text-xl font-bold text-surface-900 dark:text-white font-display">Exam Planner</h3>
                  <p className="text-surface-500 dark:text-surface-400 text-sm font-medium">Coordinate timing and content for formal testing.</p>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">
        <div className="space-y-10">
            {/* Identity Section */}
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <ClipboardDocumentCheckIcon className="w-4 h-4" />
                    Assessment Identity
                </h3>
                <InputField
                    label="Exam Title"
                    name="title"
                    register={register}
                    error={errors?.title}
                    placeholder="e.g. Mid-term Algebra II"
                    required
                />
            </div>

            {/* Content Context */}
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <BookOpenIcon className="w-4 h-4" />
                    Lesson Context
                </h3>
                <CustomDropdown
                    label="Associated Lesson"
                    name="lessonId"
                    options={lessonOptions}
                    value={watch("lessonId")}
                    onChange={(val) => setValue("lessonId", val as any)}
                    placeholder="Select lesson"
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
                    Exam window
                </h3>
                <div className="space-y-5">
                    <InputField
                        label="Start Date & Time"
                        name="startTime"
                        register={register}
                        error={errors?.startTime}
                        type="datetime-local"
                        icon={<CalendarDaysIcon className="w-4 h-4" />}
                        required
                    />
                    <InputField
                        label="End Date & Time"
                        name="endTime"
                        register={register}
                        error={errors?.endTime}
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

export default ExamForm;
