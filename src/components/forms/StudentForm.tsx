"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import CustomDropdown from "../CustomDropdown";
import BaseForm from "./BaseForm";
import { Dispatch, SetStateAction, useState } from "react";
import { studentSchema, StudentSchema } from "@/lib/formValidationSchemas";
import { createStudent, updateStudent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import SafeCldUploadWidget from "../SafeCldUploadWidget";
import FormStepper from "./FormStepper";
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  CalendarIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  PhotoIcon,
  HeartIcon,
  UserGroupIcon,
  IdentificationIcon,
  KeyIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const StudentForm = ({
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
    trigger,
  } = useForm<StudentSchema>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: data?.name || '',
      surname: data?.surname || '',
      email: data?.email || '',
      username: data?.username || '',
      phone: data?.phone || '',
      address: data?.address || '',
      bloodType: data?.bloodType || '',
      birthday: data?.birthday ? (data.birthday instanceof Date ? data.birthday.toISOString().split('T')[0] : typeof data.birthday === 'string' ? data.birthday.split('T')[0] : '') : '',
      parentId: data?.parentId || '',
      sex: data?.sex || '',
      gradeId: data?.gradeId || null,
      classId: data?.classId || null,
      id: data?.id || undefined,
    }
  });

  const [img, setImg] = useState<any>(data?.img);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const { grades, classes, parents } = relatedData;

  const sexOptions = [
    { value: "MALE", label: "Male" },
    { value: "FEMALE", label: "Female" },
  ];

  const bloodTypes = [
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B-", label: "B-" },
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
  ];

  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps = [
    { label: "Portal & Profile", icon: <UserIcon className="w-5 h-5" /> },
    { label: "Contact Info", icon: <PhoneIcon className="w-5 h-5" /> },
    { label: "Academic Status", icon: <AcademicCapIcon className="w-5 h-5" /> }
  ];

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 0) {
      fieldsToValidate = ['username', 'email', ...(type === 'create' ? ['password'] : []), 'name', 'surname', 'sex', 'bloodType'];
    } else if (currentStep === 1) {
      fieldsToValidate = ['phone', 'birthday', 'address'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['gradeId', 'classId', 'parentId'];
    }

    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const gradeOptions = (grades || []).map((grade: any) => ({
    value: grade.id,
    label: `Grade ${grade.level}`,
    icon: <AcademicCapIcon className="w-4 h-4" />
  }));

  const classOptions = (classes || []).map((cls: any) => ({
    value: cls.id,
    label: cls.name,
    icon: <BuildingOfficeIcon className="w-4 h-4" />
  }));

  const parentOptions = (parents || []).map((parent: any) => ({
    value: String(parent.id),
    label: `${parent.name} ${parent.surname}`,
    icon: <UserGroupIcon className="w-4 h-4" />
  }));

  const onSubmit = handleSubmit(async (formData) => {
    const loadingToast = toast.loading(`${type === "create" ? "Onboarding" : "Updating"} student...`);
    try {
      const result = await (type === 'create' 
        ? createStudent({ success: false, error: false }, { ...formData, img: img?.secure_url || null })
        : updateStudent({ success: false, error: false }, { ...formData, img: img?.secure_url || null })
      );

      if (result?.success) {
        toast.update(loadingToast, {
          render: `Student ${type === "create" ? "onboarded" : "updated"} successfully!`,
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

  return (
    <BaseForm
      title={type === "create" ? "Student Enrollment" : "Edit Student Information"}
      subtitle={type === "create" ? "Complete the enrollment process for a new student" : "Modify student record and academic status"}
      onSubmit={onSubmit}
      onCancel={() => setOpen(false)}
      submitLabel={type === "create" ? "Register Student" : "Save Changes"}
      isSubmitting={isSubmitting}
      customFooter={
        <>
          {currentStep > 0 && (
            <button
              type="button"
              onClick={prevStep}
              className="btn btn-secondary px-8 py-3 gap-2"
              disabled={isSubmitting || uploading}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back
            </button>
          )}
          {currentStep === 0 && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn btn-secondary px-8 py-3"
              disabled={isSubmitting || uploading}
            >
              Cancel
            </button>
          )}

          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="btn btn-primary px-8 py-3 gap-2 min-w-[140px]"
            >
              Next Step
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="btn btn-primary px-10 py-3 gap-2 min-w-[160px]"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>{type === "create" ? "Complete Setup" : "Save Changes"}</span>
                </>
              )}
            </button>
          )}
        </>
      }
    >
      <FormStepper steps={steps} currentStep={currentStep} />

      {/* Step 1: Portal & Profile */}
      {currentStep === 0 && (
        <div className="space-y-10 animate-fade-in">
          {/* Profile Photo Section */}
          <div className="bg-gradient-to-br from-primary-50 to-indigo-50 dark:from-primary-500/10 dark:to-indigo-500/10 rounded-[2rem] p-8 border border-white dark:border-surface-800 shadow-sm overflow-hidden relative">
        <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-tr from-primary-500 to-indigo-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-surface-100 dark:bg-surface-800 ring-4 ring-white dark:ring-surface-900 shadow-2xl">
              {img ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={img.secure_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PhotoIcon className="w-12 h-12 text-surface-300 dark:text-surface-600" />
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-surface-950/60 flex items-center justify-center backdrop-blur-sm">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
          <div className="text-center sm:text-left space-y-3">
            <h3 className="text-xl font-bold text-surface-900 dark:text-white font-display">
                Profile Photo
            </h3>
            <p className="text-surface-500 dark:text-surface-400 text-sm max-w-xs leading-relaxed">
                A clear, professional photo ensures easy identification in the student portal.
            </p>
            <SafeCldUploadWidget
              uploadPreset="school"
              onOpen={() => setUploading(true)}
              onSuccess={(result, { widget }) => {
                setImg(result.info);
                setUploading(false);
                widget.close();
              }}
              onError={() => setUploading(false)}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="btn btn-primary px-8 py-3 rounded-xl gap-2 shadow-lg shadow-primary-500/20"
                >
                  <PhotoIcon className="w-4 h-4" />
                  {img ? 'Update Photo' : 'Upload Image'}
                </button>
              )}
            </SafeCldUploadWidget>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-10">
          {/* Account Security Section */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <KeyIcon className="w-4 h-4" />
              Portal Access
            </h3>
            <div className="space-y-5">
              <InputField
                label="Username"
                name="username"
                register={register}
                error={errors?.username}
                icon={<IdentificationIcon className="w-4 h-4" />}
                placeholder="Unique student identifier"
                required
              />
              <InputField
                label="Email Address"
                name="email"
                type="email"
                register={register}
                error={errors?.email}
                icon={<EnvelopeIcon className="w-4 h-4" />}
                placeholder="student@school.edu"
                required
              />
              {type === "create" && (
                <InputField
                  label="Password"
                  name="password"
                  type="password"
                  register={register}
                  error={errors?.password}
                  placeholder="Secure student password"
                  required
                />
              )}
            </div>
          </div>

          {/* Personal Record Section */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Student Profile
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="First Name"
                name="name"
                register={register}
                error={errors?.name}
                placeholder="First name"
                required
              />
              <InputField
                label="Surname"
                name="surname"
                register={register}
                error={errors?.surname}
                placeholder="Last name"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CustomDropdown
                label="Gender"
                name="sex"
                options={sexOptions}
                value={watch("sex")}
                onChange={(val) => setValue("sex", val as any)}
                placeholder="Select sex"
                required
              />
              <CustomDropdown
                label="Blood Group"
                name="bloodType"
                options={bloodTypes}
                value={watch("bloodType")}
                onChange={(val) => setValue("bloodType", val as any)}
                placeholder="Type"
                helperText="Medical field"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )}

      {/* Step 2: Contact Info */}
      {currentStep === 1 && (
        <div className="space-y-10 animate-fade-in">
          {/* Contact & Birth Info */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <PhoneIcon className="w-4 h-4" />
              Contact Details
            </h3>
            <div className="space-y-5">
              <InputField
                label="Phone Number"
                name="phone"
                register={register}
                error={errors?.phone}
                icon={<PhoneIcon className="w-4 h-4" />}
                placeholder="+1 (555) 000-0000"
                required
              />
              <InputField
                label="Date of Birth"
                name="birthday"
                type="date"
                register={register}
                error={errors?.birthday}
                icon={<CalendarIcon className="w-4 h-4" />}
                required
              />
              <InputField
                label="Residential Address"
                name="address"
                register={register}
                error={errors?.address}
                icon={<MapPinIcon className="w-4 h-4" />}
                placeholder="Street address, City"
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Academic Status */}
      {currentStep === 2 && (
        <div className="space-y-10 animate-fade-in">
          {/* Academic & Parent Info */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <AcademicCapIcon className="w-4 h-4" />
              Academic Status
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <CustomDropdown
                label="Enrollment Grade"
                name="gradeId"
                options={gradeOptions}
                value={watch("gradeId") || undefined}
                onChange={(val) => setValue("gradeId", val as any)}
                placeholder="Grade"
                required
                searchable
              />
              <CustomDropdown
                label="Assigned Class"
                name="classId"
                options={classOptions}
                value={watch("classId") || undefined}
                onChange={(val) => setValue("classId", val as any)}
                placeholder="Class"
                required
                searchable
              />
            </div>
            <div className="pt-2">
              <CustomDropdown
                label="Parent/Guardian"
                name="parentId"
                options={parentOptions}
                value={watch("parentId")}
                onChange={(val) => setValue("parentId", val as any)}
                placeholder="Select parent or guardian"
                required
                searchable
                icon={<UserGroupIcon className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>
      )}
    </BaseForm>
  );
};

export default StudentForm;
