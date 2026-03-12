"use client";

import { createEvent, updateEvent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import BaseForm from "./BaseForm";
import InputField from "../InputField";
import CustomDropdown from "../CustomDropdown";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema, EventSchema } from "@/lib/formValidationSchemas";
import { 
  CalendarIcon, 
  DocumentTextIcon, 
  BuildingOfficeIcon,
  SparklesIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

type EventFormProps = {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
};

const EventForm = ({ type, data, setOpen, relatedData }: EventFormProps) => {
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: data?.title || '',
      description: data?.description || '',
      startTime: data?.startTime ? (new Date(data.startTime).toISOString().slice(0, 16) as any) : '',
      endTime: data?.endTime ? (new Date(data.endTime).toISOString().slice(0, 16) as any) : '',
      classId: data?.classId || undefined,
      id: data?.id || undefined,
    }
  });

  const onSubmit = handleSubmit(async (formData) => {
    const loadingToast = toast.loading(`${type === "create" ? "Creating" : "Updating"} event...`);
    try {
      const result = await (type === 'create' 
        ? createEvent({ success: false, error: false }, formData)
        : updateEvent({ success: false, error: false }, formData)
      );

      if (result?.success) {
        toast.update(loadingToast, {
          render: `Event ${type === "create" ? "created" : "updated"} successfully!`,
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
    icon: <BuildingOfficeIcon className="w-4 h-4" />
  }));

  const selectedClassId = watch("classId");

  return (
    <BaseForm
      title={type === "create" ? "Create New Event" : "Edit Event Details"}
      subtitle={type === "create" ? "Schedule a new school-wide or class-specific event" : "Modify event timing, description or target group"}
      onSubmit={onSubmit}
      onCancel={() => setOpen(false)}
      submitLabel={type === "create" ? "Create Event" : "Save Changes"}
      isSubmitting={isSubmitting}
    >
      {/* Hero Accent */}
      <div className="bg-gradient-to-br from-primary-50 to-indigo-50 dark:from-primary-500/10 dark:to-indigo-500/10 rounded-[2rem] p-8 border border-white dark:border-surface-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <CalendarIcon className="w-24 h-24" />
          </div>
          <div className="relative z-10 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-surface-800 shadow-xl flex items-center justify-center text-primary-500 ring-1 ring-surface-100 dark:ring-surface-700">
                  <SparklesIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                  <h3 className="text-xl font-bold text-surface-900 dark:text-white font-display">Event Coordination</h3>
                  <p className="text-surface-500 dark:text-surface-400 text-sm font-medium">Plan and communicate important school dates.</p>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 gap-10 pt-4">
        <div className="space-y-8">
            <InputField
                label="Event Title"
                name="title"
                register={register}
                error={errors?.title}
                placeholder="e.g. Annual Sports Meet"
                icon={<CalendarIcon className="w-4 h-4" />}
                required
            />

            <div className="space-y-2">
                <label className="text-[13px] font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400">
                    Description
                </label>
                <textarea
                    {...register("description")}
                    rows={4}
                    className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 rounded-2xl text-surface-900 dark:text-white placeholder:text-surface-400/60 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 outline-none transition-all resize-none"
                    placeholder="Provide event details..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                    label="Start Date & Time"
                    name="startTime"
                    type="datetime-local"
                    register={register}
                    error={errors?.startTime}
                    required
                />
                <InputField
                    label="End Date & Time"
                    name="endTime"
                    type="datetime-local"
                    register={register}
                    error={errors?.endTime}
                    required
                />
            </div>

            <CustomDropdown
                label="Scope / Target Class"
                name="classId"
                options={classOptions}
                value={selectedClassId || undefined}
                onChange={(val) => setValue("classId", val as any)}
                placeholder="All School (Default)"
                helperText="Leave empty for school-wide events"
            />
        </div>
      </div>
    </BaseForm>
  );
};

export default EventForm; 