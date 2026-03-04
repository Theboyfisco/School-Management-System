import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  LessonSchema,
  lessonSchema,
  SubjectSchema,
  TeacherSchema,
  ClassSchema,
} from "@/lib/formValidationSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { createLesson, updateLesson } from "@/lib/actions";
import { toast } from "react-toastify";
import InputField from "../InputField";
import CustomDropdown from "../CustomDropdown";

interface LessonFormProps {
  setOpen: (open: boolean) => void;
  type: "create" | "update";
  data?: LessonSchema;
  relatedData?: {
    subjects: SubjectSchema[];
    teachers: TeacherSchema[];
    classes: ClassSchema[];
  };
}

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"] as const;

type FormState = { success: boolean; error: boolean; message?: string };

const LessonForm = ({ setOpen, type, data, relatedData }: LessonFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<LessonSchema>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      ...data,
      startTime: data?.startTime ? new Date(data.startTime) : undefined,
      endTime: data?.endTime ? new Date(data.endTime) : undefined,
    },
  });

  const [formState, setFormState] = useState<FormState>({ success: false, error: false });

  const action = type === "create" ? createLesson : updateLesson;

  const onSubmit = async (formData: LessonSchema) => {
    const result = await action(formState, formData);
    setFormState(result);
  };

  useEffect(() => {
    if (formState.success) {
      toast(`${data?.name || "Lesson"} has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      reset();
    }
    if (formState.error) {
      toast.error(formState.message || "An error occurred.");
    }
  }, [formState, setOpen, reset, type, data?.name]);

  const subjects = relatedData?.subjects || [];
  const teachers = relatedData?.teachers || [];
  const classes = relatedData?.classes || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {type === "create" ? "Create New Lesson" : "Update Lesson"}
        </h2>
        <div className="border-b border-gray-200 dark:border-gray-700 mb-4"></div>
      </div>

      <div className="flex flex-col gap-2">
        <InputField
          label="Lesson Name"
          name="name"
          register={register}
          error={errors.name}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomDropdown
          label="Day"
          name="day"
          options={DAYS.map((day) => ({ value: day, label: day }))}
          value={watch("day") || ""}
          onChange={(value) => setValue("day", value as typeof DAYS[number])}
          error={errors.day}
        />
        <InputField
          label="Start Time"
          name="startTime"
          type="datetime-local"
          register={register}
          error={errors.startTime}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="End Time"
          name="endTime"
          type="datetime-local"
          register={register}
          error={errors.endTime}
        />
        <CustomDropdown
          label="Subject"
          name="subjectId"
          options={subjects.map((s) => ({ value: s.id?.toString() || "", label: s.name }))}
          value={watch("subjectId")?.toString() || ""}
          onChange={(value) => setValue("subjectId", parseInt(value as string))}
          error={errors.subjectId}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomDropdown
          label="Teacher"
          name="teacherId"
          options={teachers.map((t) => ({ value: t.id || "", label: `${t.name} ${t.surname}` }))}
          value={watch("teacherId") || ""}
          onChange={(value) => setValue("teacherId", value as string)}
          error={errors.teacherId}
        />
        <CustomDropdown
          label="Class"
          name="classId"
          options={classes.map((c) => ({ value: c.id?.toString() || "", label: c.name }))}
          value={watch("classId")?.toString() || ""}
          onChange={(value) => setValue("classId", parseInt(value as string))}
          error={errors.classId}
        />
      </div>

      <div className="flex justify-end gap-4 mt-4">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {type === "create" ? "Create" : "Update"}
        </button>
      </div>
    </form>
  );
};

export default LessonForm; 