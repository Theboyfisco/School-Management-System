"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import CustomDropdown from "../CustomDropdown";
import BaseForm from "./BaseForm";
import { resultSchema, ResultSchema } from "@/lib/formValidationSchemas";
import { createResult, updateResult } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { 
  TrophyIcon, 
  UserIcon, 
  AcademicCapIcon,
  DocumentCheckIcon,
  CheckCircleIcon,
  SparklesIcon,
  ChartBarIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

interface ResultFormProps {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}

const ResultForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: ResultFormProps) => {
  const [assessmentType, setAssessmentType] = useState<'exam' | 'assignment'>(
    data?.examId ? 'exam' : (data?.assignmentId ? 'assignment' : 'exam')
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ResultSchema>({
    resolver: zodResolver(resultSchema),
    defaultValues: {
      studentId: data?.studentId || '',
      score: data?.score || 0,
      examId: data?.examId || undefined,
      assignmentId: data?.assignmentId || undefined,
      id: data?.id || undefined,
    } as any
  });

  const router = useRouter();

  const onSubmit = handleSubmit(async (formData: ResultSchema) => {
    const loadingToast = toast.loading(`${type === "create" ? "Recording" : "Updating"} result...`);
    try {
      // Ensure the other ID is null
      if (assessmentType === 'exam') {
        formData.assignmentId = null;
      } else {
        formData.examId = null;
      }

      const result = await (type === 'create' 
        ? createResult({ success: false, error: false }, formData)
        : updateResult({ success: false, error: false }, formData)
      );

      if (result?.success) {
        toast.update(loadingToast, {
          render: `Result ${type === "create" ? "recorded" : "updated"} successfully!`,
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

  const studentOptions = (relatedData?.students || []).map((s: any) => ({
    value: s.id,
    label: `${s.name} ${s.surname}`,
    icon: <UserIcon className="w-4 h-4" />
  }));

  const examOptions = (relatedData?.exams || []).map((e: any) => ({
    value: e.id,
    label: `${e.title} - ${e.lesson.subject.name} (${e.lesson.class.name})`,
    icon: <AcademicCapIcon className="w-4 h-4" />
  }));

  const assignmentOptions = (relatedData?.assignments || []).map((a: any) => ({
    value: a.id,
    label: `${a.title} - ${a.lesson.subject.name} (${a.lesson.class.name})`,
    icon: <DocumentCheckIcon className="w-4 h-4" />
  }));

  const typeOptions = [
    { value: 'exam', label: 'Internal Exam', icon: <AcademicCapIcon className="w-4 h-4" /> },
    { value: 'assignment', label: 'Class Assignment', icon: <DocumentCheckIcon className="w-4 h-4" /> },
  ];

  return (
    <BaseForm
      title={type === "create" ? "Publish Academic Result" : "Modify Result Data"}
      subtitle={type === "create" ? "Finalize student scores for exams or take-home assignments" : "Adjust existing grade entries and performance metrics"}
      onSubmit={onSubmit}
      onCancel={() => setOpen(false)}
      submitLabel={type === "create" ? "Publish Result" : "Update Entry"}
      isSubmitting={isSubmitting}
    >
      {/* Hero Accent Section */}
      <div className="bg-gradient-to-br from-amber-50/50 to-primary-50/50 dark:from-amber-500/10 dark:to-primary-500/10 rounded-[2rem] p-8 border border-white dark:border-surface-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrophyIcon className="w-24 h-24" />
          </div>
          <div className="relative z-10 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-surface-800 shadow-xl flex items-center justify-center text-amber-500 ring-1 ring-surface-100 dark:ring-surface-700">
                  <ChartBarIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                  <h3 className="text-xl font-bold text-surface-900 dark:text-white font-display">Performance Record</h3>
                  <p className="text-surface-500 dark:text-surface-400 text-sm font-medium">Capture student achievements with precision and clarity.</p>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">
        <div className="space-y-10">
            {/* Identity & Context */}
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    Recipient Details
                </h3>
                
                <CustomDropdown
                    label="Target Student"
                    name="studentId"
                    options={studentOptions}
                    value={watch("studentId")}
                    onChange={(val) => setValue("studentId", val as string)}
                    placeholder="Select Student"
                    required
                    searchable
                />

                <InputField
                    label="Achieved Score (%)"
                    name="score"
                    type="number"
                    register={register}
                    error={errors?.score}
                    placeholder="0-100"
                    required
                    icon={<BeakerIcon className="w-4 h-4" />}
                />
            </div>
        </div>

        <div className="space-y-10">
            {/* Assessment Details */}
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <DocumentCheckIcon className="w-4 h-4" />
                    Assessment Scope
                </h3>
                
                <CustomDropdown
                    label="Evaluation Category"
                    name="assessmentType"
                    options={typeOptions}
                    value={assessmentType}
                    onChange={(val) => {
                        setAssessmentType(val as 'exam' | 'assignment');
                        // Reset the other type IDs when switching
                        if (val === 'exam') {
                           setValue('assignmentId', undefined as any);
                        } else {
                           setValue('examId', undefined as any);
                        }
                    }}
                    placeholder="Choose Type"
                    required
                />

                {assessmentType === 'exam' ? (
                    <CustomDropdown
                        label="Specific Exam"
                        name="examId"
                        options={examOptions}
                        value={watch("examId") || undefined}
                        onChange={(val) => setValue("examId", val as number)}
                        placeholder="Select Exam"
                        required
                        searchable
                    />
                ) : (
                    <CustomDropdown
                        label="Specific Assignment"
                        name="assignmentId"
                        options={assignmentOptions}
                        value={watch("assignmentId") || undefined}
                        onChange={(val) => setValue("assignmentId", val as number)}
                        placeholder="Select Assignment"
                        required
                        searchable
                    />
                )}
            </div>
        </div>
      </div>

      {type === "update" && data?.id && (
        <input type="hidden" {...register('id')} />
      )}
    </BaseForm>
  );
};

export default ResultForm;