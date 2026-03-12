"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import CustomDropdown from "../CustomDropdown";
import BaseForm from "./BaseForm";
import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchemas";
import { createSubject, updateSubject } from "@/lib/actions";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { 
  AcademicCapIcon, 
  UserIcon, 
  CheckCircleIcon,
  BookOpenIcon,
  SparklesIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface SubjectFormProps {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}

const SubjectForm = ({ type, data, setOpen, relatedData }: SubjectFormProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SubjectSchema>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: data?.name || '',
      teachers: data?.teachers || [],
      id: data?.id || undefined,
    }
  });


  const router = useRouter();

  const onSubmit = handleSubmit(async (formData) => {
    const loadingToast = toast.loading(`${type === "create" ? "Creating" : "Updating"} subject...`);
    try {
      const result = await (type === "create" 
        ? createSubject({ success: false, error: false }, formData)
        : updateSubject({ success: false, error: false }, formData)
      );

      if (result?.success) {
        toast.update(loadingToast, {
          render: `Subject ${type === "create" ? "created" : "updated"} successfully!`,
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

  const { teachers } = relatedData;

  const teacherOptions = (teachers || []).map((teacher: any) => ({
    value: teacher.id,
    label: `${teacher.name} ${teacher.surname}`,
    icon: <UserIcon className="w-4 h-4" />
  }));

  return (
    <BaseForm
      title={type === "create" ? "New Academic Subject" : "Edit Subject Details"}
      subtitle={type === "create" ? "Define a new subject and assign qualified faculty members" : "Update subject curriculum and assigned teachers"}
      onSubmit={onSubmit}
      onCancel={() => setOpen(false)}
      submitLabel={type === "create" ? "Create Subject" : "Update Details"}
      isSubmitting={isSubmitting}
    >
      {/* Hero Accent */}
      <div className="bg-gradient-to-br from-indigo-50/50 to-primary-50/50 dark:from-indigo-500/10 dark:to-primary-500/10 rounded-[2rem] p-8 border border-white dark:border-surface-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <BookOpenIcon className="w-24 h-24" />
          </div>
          <div className="relative z-10 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-surface-800 shadow-xl flex items-center justify-center text-primary-500 ring-1 ring-surface-100 dark:ring-surface-700">
                  <SparklesIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                  <h3 className="text-xl font-bold text-surface-900 dark:text-white font-display">Subject Details</h3>
                  <p className="text-surface-500 dark:text-surface-400 text-sm font-medium">Define core subject identity and teaching assignments.</p>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 gap-12 pt-4">
        <div className="space-y-10">
            {/* Subject Identity */}
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <DocumentTextIcon className="w-4 h-4" />
                    Subject Identity
                </h3>
                <InputField
                    label="Subject Title"
                    name="name"
                    register={register}
                    error={errors?.name}
                    placeholder="e.g. Advanced Mathematics"
                    icon={<AcademicCapIcon className="w-4 h-4" />}
                    required
                    helperText="Enter the official name of the course"
                />
            </div>

            {/* Teaching Faculty */}
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    Faculty Assignment
                </h3>
                <CustomDropdown
                    label="Assigned Teachers"
                    name="teachers"
                    options={teacherOptions}
                    value={watch("teachers") || []}
                    onChange={(val) => setValue("teachers", val as any[])}
                    placeholder="Select qualified faculty"
                    multiSelect
                    searchable
                    required
                    helperText="Assign one or more teachers to this subject"
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

export default SubjectForm;
