"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import CustomDropdown from "../CustomDropdown";
import BaseForm from "./BaseForm";
import { classSchema, ClassSchema } from "@/lib/formValidationSchemas";
import { createClass, updateClass } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { 
  BuildingOfficeIcon, 
  UsersIcon, 
  AcademicCapIcon,
  UserIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const ClassForm = ({
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
  } = useForm<ClassSchema>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: data?.name || '',
      capacity: data?.capacity || undefined,
      gradeId: data?.gradeId || undefined,
      supervisorId: data?.supervisorId || '',
      id: data?.id || undefined,
    }
  });

  const [state, formAction] = useFormState(
    type === "create" ? createClass : updateClass,
    { success: false, error: false, message: "" }
  );

  const router = useRouter();

  const onSubmit = handleSubmit(async (formData) => {
    const loadingToast = toast.loading(`${type === "create" ? "Creating" : "Updating"} class...`);
    try {
      const result = await (type === 'create' 
        ? createClass({ success: false, error: false }, formData)
        : updateClass({ success: false, error: false }, formData)
      );

      if (result?.success) {
        toast.update(loadingToast, {
          render: `Class ${type === "create" ? "created" : "updated"} successfully!`,
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

  const { teachers, grades } = relatedData;

  const supervisorOptions = (teachers || []).map((teacher: any) => ({
    value: teacher.id,
    label: `${teacher.name} ${teacher.surname}`,
    icon: <UserIcon className="w-4 h-4" />
  }));

  const gradeOptions = (grades || []).map((grade: any) => ({
    value: grade.id,
    label: `Grade ${grade.level}`,
    icon: <AcademicCapIcon className="w-4 h-4" />
  }));

  return (
    <BaseForm
      title={type === "create" ? "Add New Class" : "Edit Class Information"}
      subtitle={type === "create" ? "Define a new classroom group and assign its supervisor" : "Modify class capacity, name or assigned supervisor"}
      onSubmit={onSubmit}
      onCancel={() => setOpen(false)}
      submitLabel={type === "create" ? "Create Class" : "Update Class"}
      isSubmitting={isSubmitting}
    >
      {/* Hero Accent Section */}
      <div className="bg-gradient-to-br from-indigo-50/50 to-primary-50/50 dark:from-indigo-500/10 dark:to-primary-500/10 rounded-[2rem] p-8 border border-white dark:border-surface-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <BuildingOfficeIcon className="w-24 h-24" />
          </div>
          <div className="relative z-10 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-surface-800 shadow-xl flex items-center justify-center text-primary-500 ring-1 ring-surface-100 dark:ring-surface-700">
                  <SparklesIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                  <h3 className="text-xl font-bold text-surface-900 dark:text-white font-display">Class Infrastructure</h3>
                  <p className="text-surface-500 dark:text-surface-400 text-sm font-medium">Configure core attributes for this academic group.</p>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">
        <div className="space-y-10">
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <BuildingOfficeIcon className="w-4 h-4" />
                    Identification
                </h3>
                <InputField
                    label="Class Name"
                    name="name"
                    register={register}
                    error={errors?.name}
                    placeholder="e.g. Grade 1-A"
                    required
                    helperText="Unique name for the classroom"
                />
            </div>

            <div className="space-y-6">
                <h3 className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <UsersIcon className="w-4 h-4" />
                    Capacity Control
                </h3>
                <InputField
                    label="Student Capacity"
                    name="capacity"
                    type="number"
                    register={register}
                    error={errors?.capacity}
                    placeholder="Max students"
                    required
                    helperText="Maximum allowed enrollments"
                />
            </div>
        </div>

        <div className="space-y-10">
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <AcademicCapIcon className="w-4 h-4" />
                    Academic Level
                </h3>
                <CustomDropdown
                    label="Grade Category"
                    name="gradeId"
                    options={gradeOptions}
                    value={watch("gradeId") || undefined}
                    onChange={(val) => setValue("gradeId", val as any)}
                    placeholder="Select Level"
                    required
                    searchable
                />
            </div>

            <div className="space-y-6">
                <h3 className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    Leadership
                </h3>
                <CustomDropdown
                    label="Class Supervisor"
                    name="supervisorId"
                    options={supervisorOptions}
                    value={watch("supervisorId") || undefined}
                    onChange={(val) => setValue("supervisorId", val as any)}
                    placeholder="Assign Teacher"
                    required
                    searchable
                    helperText="Select the primary managing teacher"
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

export default ClassForm;
