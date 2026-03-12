"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import CustomDropdown from "../CustomDropdown";
import BaseForm from "./BaseForm";
import { announcementSchema, AnnouncementSchema } from "@/lib/formValidationSchemas";
import { createAnnouncement, updateAnnouncement } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { 
  MegaphoneIcon, 
  CalendarDaysIcon, 
  UserGroupIcon,
  CheckCircleIcon,
  SparklesIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface AnnouncementFormProps {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}

const AnnouncementForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: AnnouncementFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<AnnouncementSchema>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: data?.title || '',
      description: data?.description || '',
      date: data?.date ? new Date(data.date) : undefined,
      classId: data?.classId || undefined,
      id: data?.id || undefined,
    } as any
  });

  const [state, formAction] = useFormState(
    type === "create" ? createAnnouncement : updateAnnouncement,
    { success: false, error: false, message: "" }
  );

  const router = useRouter();

  const onSubmit = handleSubmit(async (formData: AnnouncementSchema) => {
    const loadingToast = toast.loading(`${type === "create" ? "Creating" : "Updating"} announcement...`);
    try {
      const result = await (type === 'create' 
        ? createAnnouncement({ success: false, error: false }, formData)
        : updateAnnouncement({ success: false, error: false }, formData)
      );

      if (result?.success) {
        toast.update(loadingToast, {
          render: `Announcement ${type === "create" ? "created" : "updated"} successfully!`,
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

  const classOptions = (relatedData?.classes || []).map((cls: any) => ({
    value: cls.id,
    label: cls.name,
    icon: <UserGroupIcon className="w-4 h-4" />
  }));

  return (
    <BaseForm
      title={type === "create" ? "Post New Announcement" : "Edit Announcement"}
      subtitle={type === "create" ? "Broadcasting news and updates to classes or the entire school" : "Modify existing announcement details and scope"}
      onSubmit={onSubmit}
      onCancel={() => setOpen(false)}
      submitLabel={type === "create" ? "Post Announcement" : "Update Announcement"}
      isSubmitting={isSubmitting}
    >
      {/* Hero Accent Section */}
      <div className="bg-gradient-to-br from-primary-50/50 to-accent-50/50 dark:from-primary-500/10 dark:to-accent-500/10 rounded-[2rem] p-8 border border-white dark:border-surface-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <MegaphoneIcon className="w-24 h-24" />
          </div>
          <div className="relative z-10 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-surface-800 shadow-xl flex items-center justify-center text-primary-500 ring-1 ring-surface-100 dark:ring-surface-700">
                  <SparklesIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                  <h3 className="text-xl font-bold text-surface-900 dark:text-white font-display">Broadcast Center</h3>
                  <p className="text-surface-500 dark:text-surface-400 text-sm font-medium">Publish important context for the school community.</p>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">
        <div className="space-y-10">
            {/* Identity & Content */}
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <DocumentTextIcon className="w-4 h-4" />
                    Announcement Details
                </h3>
                <InputField
                    label="Announcement Title"
                    name="title"
                    register={register}
                    error={errors?.title}
                    placeholder="e.g. Sports Day Update"
                    required
                />
                
                <div className="w-full group">
                  <label 
                    htmlFor="description" 
                    className="block text-[13px] font-bold uppercase tracking-wider mb-2 text-surface-500 dark:text-surface-400"
                  >
                    Content / Description
                    <span className="ml-1 text-danger-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    {...register("description")}
                    className={`
                      w-full px-4 py-3.5 bg-surface-50 dark:bg-surface-800/50 border rounded-2xl
                      text-surface-900 dark:text-white placeholder:text-surface-400/60
                      transition-all duration-300 outline-none min-h-[120px]
                      ${errors?.description 
                        ? 'border-danger-300 dark:border-danger-500/30 ring-4 ring-danger-500/5 dark:ring-danger-500/10' 
                        : 'border-surface-200 dark:border-surface-700/50 hover:border-surface-300 dark:hover:border-surface-600/50 focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10'
                      }
                      text-sm font-medium
                    `}
                    placeholder="Provide full announcement text..."
                  />
                  {errors?.description && (
                    <p className="text-xs font-bold text-danger-500 mt-1.5 px-1">{errors.description.message}</p>
                  )}
                </div>
            </div>
        </div>

        <div className="space-y-10">
            {/* Context & Scheduling */}
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <CalendarDaysIcon className="w-4 h-4" />
                    Targeting & Timeline
                </h3>
                
                <InputField
                    label="Effective Date"
                    name="date"
                    type="date"
                    register={register}
                    error={errors?.date}
                    required
                    icon={<CalendarDaysIcon className="w-4 h-4" />}
                />

                <CustomDropdown
                    label="Target Audience (Class)"
                    name="classId"
                    options={classOptions}
                    value={watch("classId") || undefined}
                    onChange={(val) => setValue("classId", val as any)}
                    placeholder="All School (Default)"
                    helperText="Select a specific class or leave for school-wide"
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

export default AnnouncementForm;