"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import CustomDropdown from "../CustomDropdown";
import BaseForm from "./BaseForm";
import { attendanceSchema, AttendanceSchema } from "@/lib/formValidationSchemas";
import { createAttendance, updateAttendance } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { 
  CheckBadgeIcon, 
  CalendarDaysIcon, 
  UserIcon,
  BookOpenIcon,
  CheckCircleIcon,
  SparklesIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface AttendanceFormProps {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}

const AttendanceForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: AttendanceFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<AttendanceSchema>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      studentId: data?.studentId || '',
      lessonId: data?.lessonId || undefined,
      date: data?.date ? new Date(data.date) : undefined,
      present: data?.present ?? true,
      id: data?.id || undefined,
    } as any
  });

  const [state, formAction] = useFormState(
    type === "create" ? createAttendance : updateAttendance,
    { success: false, error: false, message: "" }
  );

  const router = useRouter();

  const onSubmit = handleSubmit(async (formData: AttendanceSchema) => {
    const loadingToast = toast.loading(`${type === "create" ? "Recording" : "Updating"} attendance...`);
    try {
      const result = await (type === 'create' 
        ? createAttendance({ success: false, error: false }, formData)
        : updateAttendance({ success: false, error: false }, formData)
      );

      if (result?.success) {
        toast.update(loadingToast, {
          render: `Attendance ${type === "create" ? "recorded" : "updated"} successfully!`,
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

  const studentOptions = (relatedData?.students || []).map((student: any) => ({
    value: student.id,
    label: `${student.name} ${student.surname} (${student.class?.name || 'No Class'})`,
    icon: <UserIcon className="w-4 h-4" />
  }));

  const lessonOptions = (relatedData?.lessons || []).map((lesson: any) => ({
    value: lesson.id,
    label: `${lesson.subject.name} - ${lesson.class.name}`,
    icon: <BookOpenIcon className="w-4 h-4" />
  }));

  const statusOptions = [
    { value: true, label: "Present", icon: <CheckCircleIcon className="w-4 h-4 text-success-500" /> },
    { value: false, label: "Absent", icon: <SparklesIcon className="w-4 h-4 text-danger-500 rotate-45" /> },
  ];

  return (
    <BaseForm
      title={type === "create" ? "Mark Attendance" : "Update Attendance"}
      subtitle={type === "create" ? "Register a student's presence for a specific lesson" : "Correct or update existing attendance record"}
      onSubmit={onSubmit}
      onCancel={() => setOpen(false)}
      submitLabel={type === "create" ? "Save Record" : "Update Record"}
      isSubmitting={isSubmitting}
    >
      {/* Hero Accent Section */}
      <div className="bg-gradient-to-br from-success-50/50 to-primary-50/50 dark:from-success-500/10 dark:to-primary-500/10 rounded-[2rem] p-8 border border-white dark:border-surface-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <CheckBadgeIcon className="w-24 h-24" />
          </div>
          <div className="relative z-10 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-surface-800 shadow-xl flex items-center justify-center text-success-500 ring-1 ring-surface-100 dark:ring-surface-700">
                  <ShieldCheckIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                  <h3 className="text-xl font-bold text-surface-900 dark:text-white font-display">Integrity Logs</h3>
                  <p className="text-surface-500 dark:text-surface-400 text-sm font-medium">Capture precise engagement data for academic sessions.</p>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">
        <div className="space-y-10">
            {/* Subject & Student Section */}
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    Student & Lesson
                </h3>
                
                <CustomDropdown
                    label="Student Name"
                    name="studentId"
                    options={studentOptions}
                    value={watch("studentId")}
                    onChange={(val) => setValue("studentId", val as string)}
                    placeholder="Select Student"
                    required
                    searchable
                />

                <CustomDropdown
                    label="Scheduled Lesson"
                    name="lessonId"
                    options={lessonOptions}
                    value={watch("lessonId")}
                    onChange={(val) => setValue("lessonId", val as any)}
                    placeholder="Select Lesson"
                    required
                    searchable
                />
            </div>
        </div>

        <div className="space-y-10">
            {/* Logic & Timing Section */}
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <CalendarDaysIcon className="w-4 h-4" />
                    Status & Timeline
                </h3>
                
                <CustomDropdown
                    label="Attendance Status"
                    name="present"
                    options={statusOptions}
                    value={watch("present")}
                    onChange={(val) => setValue("present", val as boolean)}
                    placeholder="Select Status"
                    required
                />

                <InputField
                    label="Session Date"
                    name="date"
                    type="date"
                    register={register}
                    error={errors?.date}
                    required
                    icon={<CalendarDaysIcon className="w-4 h-4" />}
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

export default AttendanceForm;