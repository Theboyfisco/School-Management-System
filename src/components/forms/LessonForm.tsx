"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import CustomDropdown from "../CustomDropdown";
import BaseForm from "./BaseForm";
import { lessonSchema, LessonSchema } from "@/lib/formValidationSchemas";
import { createLesson, updateLesson } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { 
  BookOpenIcon, 
  CalendarIcon, 
  UserCircleIcon,
  UserGroupIcon,
  CheckCircleIcon,
  SparklesIcon,
  ClockIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

interface LessonFormProps {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"] as const;

const LessonForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: LessonFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<LessonSchema>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      name: data?.name || '',
      day: data?.day || undefined,
      startTime: data?.startTime ? new Date(data.startTime) : undefined,
      endTime: data?.endTime ? new Date(data.endTime) : undefined,
      subjectId: data?.subjectId || undefined,
      teacherId: data?.teacherId || '',
      classId: data?.classId || undefined,
      id: data?.id || undefined,
    } as any
  });

  const router = useRouter();

  const onSubmit = handleSubmit(async (formData: LessonSchema) => {
    const loadingToast = toast.loading(`${type === "create" ? "Creating" : "Updating"} lesson...`);
    try {
      const result = await (type === 'create' 
        ? createLesson({ success: false, error: false }, formData)
        : updateLesson({ success: false, error: false }, formData)
      );

      if (result?.success) {
        toast.update(loadingToast, {
          render: `Lesson ${type === "create" ? "created" : "updated"} successfully!`,
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

  const subjectOptions = (relatedData?.subjects || []).map((s: any) => ({
    value: s.id,
    label: s.name,
    icon: <BookOpenIcon className="w-4 h-4" />
  }));

  const teacherOptions = (relatedData?.teachers || []).map((t: any) => ({
    value: t.id,
    label: `${t.name} ${t.surname}`,
    icon: <UserCircleIcon className="w-4 h-4" />
  }));

  const classOptions = (relatedData?.classes || []).map((c: any) => ({
    value: c.id,
    label: c.name,
    icon: <UserGroupIcon className="w-4 h-4" />
  }));

  const dayOptions = DAYS.map(day => ({
    value: day,
    label: day.charAt(0) + day.slice(1).toLowerCase(),
    icon: <CalendarIcon className="w-4 h-4" />
  }));

  return (
    <BaseForm
      title={type === "create" ? "Schedule New Lesson" : "Edit Lesson Schedule"}
      subtitle={type === "create" ? "Define a new academic session with subject, teacher and timing" : "Modify existing lesson parameters and scheduling"}
      onSubmit={onSubmit}
      onCancel={() => setOpen(false)}
      submitLabel={type === "create" ? "Create Lesson" : "Update Lesson"}
      isSubmitting={isSubmitting}
    >
      {/* Hero Accent Section */}
      <div className="bg-gradient-to-br from-primary-50/50 to-indigo-50/50 dark:from-primary-500/10 dark:to-indigo-500/10 rounded-[2rem] p-8 border border-white dark:border-surface-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <BookOpenIcon className="w-24 h-24" />
          </div>
          <div className="relative z-10 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-surface-800 shadow-xl flex items-center justify-center text-primary-500 ring-1 ring-surface-100 dark:ring-surface-700">
                  <AcademicCapIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                  <h3 className="text-xl font-bold text-surface-900 dark:text-white font-display">Academic Planner</h3>
                  <p className="text-surface-500 dark:text-surface-400 text-sm font-medium">Coordinate sessions between departments and classes.</p>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">
        <div className="space-y-10">
            {/* Core Details */}
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4" />
                    Identity & Scope
                </h3>
                
                <InputField
                    label="Lesson Title"
                    name="name"
                    register={register}
                    error={errors?.name}
                    placeholder="e.g. Advanced Mathematics"
                    required
                />

                <CustomDropdown
                    label="Academic Subject"
                    name="subjectId"
                    options={subjectOptions}
                    value={watch("subjectId")}
                    onChange={(val) => setValue("subjectId", val as number)}
                    placeholder="Select Subject"
                    required
                    searchable
                />

                <CustomDropdown
                    label="Assigned Teacher"
                    name="teacherId"
                    options={teacherOptions}
                    value={watch("teacherId")}
                    onChange={(val) => setValue("teacherId", val as string)}
                    placeholder="Select Teacher"
                    required
                    searchable
                />

                <CustomDropdown
                    label="Target Class"
                    name="classId"
                    options={classOptions}
                    value={watch("classId")}
                    onChange={(val) => setValue("classId", val as number)}
                    placeholder="Select Class"
                    required
                />
            </div>
        </div>

        <div className="space-y-10">
            {/* Scheduling Details */}
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <ClockIcon className="w-4 h-4" />
                    Timing & Schedule
                </h3>
                
                <CustomDropdown
                    label="Day of Week"
                    name="day"
                    options={dayOptions}
                    value={watch("day")}
                    onChange={(val) => setValue("day", val as any)}
                    placeholder="Select Day"
                    required
                />

                <InputField
                    label="Start Time"
                    name="startTime"
                    type="datetime-local"
                    register={register}
                    error={errors?.startTime}
                    required
                    icon={<ClockIcon className="w-4 h-4" />}
                />

                <InputField
                    label="End Time"
                    name="endTime"
                    type="datetime-local"
                    register={register}
                    error={errors?.endTime}
                    required
                    icon={<ClockIcon className="w-4 h-4" />}
                />
            </div>
        </div>
      </div>

      {type === "update" && data?.id && (
        <input type="hidden" {...register('id')} />
      )}
    </BaseForm>
  );
};

export default LessonForm;