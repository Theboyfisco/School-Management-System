"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import CustomDropdown from "../CustomDropdown";
import BaseForm from "./BaseForm";
import { Dispatch, SetStateAction, useState } from "react";
import { teacherSchema, TeacherSchema } from "@/lib/formValidationSchemas";
import { createTeacher, updateTeacher } from "@/lib/actions";
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
  PhotoIcon,
  HeartIcon,
  IdentificationIcon,
  KeyIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const TeacherForm = ({
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
  } = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      username: data?.username || '',
      email: data?.email || '',
      name: data?.name || '',
      surname: data?.surname || '',
      phone: data?.phone || '',
      address: data?.address || '',
      bloodType: data?.bloodType || '',
      birthday: data?.birthday 
        ? (typeof data.birthday === 'string' 
            ? data.birthday.split('T')[0] 
            : data.birthday instanceof Date 
                ? data.birthday.toISOString().split('T')[0]
                : '')
        : '',
      sex: data?.sex || '',
      subjects: data?.subjects || [],
      id: data?.id || undefined,
    }
  });

  const [img, setImg] = useState<any>(data?.img);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const { subjects } = relatedData;

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
    { label: "Account & Basics", icon: <UserIcon className="w-5 h-5" /> },
    { label: "Contact Details", icon: <PhoneIcon className="w-5 h-5" /> },
    { label: "Professional Info", icon: <AcademicCapIcon className="w-5 h-5" /> },
    { label: "Review & Confirm", icon: <CheckCircleIcon className="w-5 h-5" /> }
  ];

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 0) {
      fieldsToValidate = ['username', 'email', ...(type === 'create' ? ['password'] : []), 'name', 'surname', 'sex', 'bloodType'];
    } else if (currentStep === 1) {
      fieldsToValidate = ['phone', 'birthday', 'address'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['subjects'];
    }

    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const subjectOptions = (subjects || []).map((s: any) => ({
    value: String(s.id),
    label: s.name,
    icon: <AcademicCapIcon className="w-4 h-4" />
  }));

  const onSubmit = handleSubmit(async (formData) => {
    const loadingToast = toast.loading(`${type === "create" ? "Creating" : "Updating"} teacher...`);
    try {
      const result = await (type === 'create' 
        ? createTeacher({ success: false, error: false }, { ...formData, img: img?.secure_url || null })
        : updateTeacher({ success: false, error: false }, { ...formData, img: img?.secure_url || null })
      );

      if (result?.success) {
        toast.update(loadingToast, {
          render: `Teacher ${type === "create" ? "created" : "updated"} successfully!`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
          icon: <CheckCircleIcon className="w-5 h-5 text-success-500" />
        });
        setOpen(false);
        router.refresh();
      } else {
        toast.update(loadingToast, {
          render: result?.message || "Something went wrong",
          type: "error",
          isLoading: false,
          autoClose: 5000
        });
      }
    } catch (error) {
      toast.update(loadingToast, {
        render: "An unexpected error occurred",
        type: "error",
        isLoading: false,
        autoClose: 5000
      });
    }
  });

  return (
    <BaseForm
      title={type === "create" ? "Add New Teacher" : "Edit Teacher Profile"}
      subtitle={type === "create" ? "Create a new faculty member account" : "Update personal and academic details"}
      onSubmit={onSubmit}
      onCancel={() => setOpen(false)}
      submitLabel={type === "create" ? "Create Faculty member" : "Update Profile"}
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

      {/* Step 1: Account & Basics */}
      {currentStep === 0 && (
        <div className="space-y-10 animate-fade-in">
          {/* Profile Photo Section */}
          <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-500/10 dark:to-accent-500/10 rounded-[2rem] p-8 border border-white dark:border-surface-800 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-tr from-primary-500 to-accent-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
            <div className="relative w-28 h-28 rounded-full overflow-hidden bg-surface-100 dark:bg-surface-800 ring-4 ring-white dark:ring-surface-900 shadow-2xl">
              {img ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={img.secure_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PhotoIcon className="w-10 h-10 text-surface-300 dark:text-surface-600" />
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
                Add a professional photo to help identify this faculty member across the system.
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
                  className="btn btn-primary btn-sm px-6 py-2.5 rounded-xl gap-2 shadow-lg shadow-primary-500/20"
                >
                  <PhotoIcon className="w-4 h-4" />
                  {img ? 'Change Photo' : 'Upload Image'}
                </button>
              )}
            </SafeCldUploadWidget>
          </div>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Column: Account & Basics */}
        <div className="space-y-10">
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <KeyIcon className="w-4 h-4" />
              Account Security
            </h3>
            <div className="space-y-4">
              <InputField
                label="Username"
                name="username"
                register={register}
                error={errors?.username}
                icon={<IdentificationIcon className="w-4 h-4" />}
                placeholder="Unique portal handle"
                required
              />
              <InputField
                label="Email Address"
                name="email"
                type="email"
                register={register}
                error={errors?.email}
                icon={<EnvelopeIcon className="w-4 h-4" />}
                placeholder="official@school.edu"
                required
              />
              {type === "create" && (
                <InputField
                    label="Access Password"
                    name="password"
                    type="password"
                    register={register}
                    error={errors?.password}
                    placeholder="Minimum 8 characters"
                    required
                />
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Teacher Profile
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <InputField
                    label="First Name"
                    name="name"
                    register={register}
                    error={errors.name}
                    placeholder="Legal name"
                    required
                />
                <InputField
                    label="Last Name"
                    name="surname"
                    register={register}
                    error={errors.surname}
                    placeholder="Family name"
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
                    helperText="Optional medical info"
                />
              </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Contact Details */}
      {currentStep === 1 && (
        <div className="space-y-10 animate-fade-in">
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <PhoneIcon className="w-4 h-4" />
              Contact & Location
            </h3>
            <div className="space-y-4">
                <InputField
                    label="Phone Number"
                    name="phone"
                    register={register}
                    error={errors.phone}
                    icon={<PhoneIcon className="w-4 h-4" />}
                    placeholder="+1 (555) 000-0000"
                    required
                />
                <InputField
                    label="Birth Date"
                    name="birthday"
                    type="date"
                    register={register}
                    error={errors.birthday}
                    icon={<CalendarIcon className="w-4 h-4" />}
                    required
                />
                <InputField
                    label="Residential Address"
                    name="address"
                    register={register}
                    error={errors.address}
                    icon={<MapPinIcon className="w-4 h-4" />}
                    placeholder="Street, City, Zip"
                    required
                />
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Review & Confirm */}
      {currentStep === 3 && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-surface-50 dark:bg-surface-800/40 rounded-[2rem] p-8 border border-surface-200 dark:border-surface-700/50 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
                <CheckCircleIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-surface-900 dark:text-white font-display">Review Enrollment</h3>
                <p className="text-sm text-surface-500 dark:text-surface-400">Please verify all details are correct before finalizing.</p>
              </div>
            </div>
            
            <div className="space-y-8">
              {/* Section 1: Identity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-1">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white dark:border-surface-800 shadow-lg">
                    {img ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={img.secure_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-surface-200 dark:bg-surface-700 flex items-center justify-center">
                        <UserIcon className="w-8 h-8 text-surface-400" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="sm:col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">Full Name</p>
                    <p className="text-base font-bold text-surface-900 dark:text-white">{watch("name")} {watch("surname")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">Portal Handle</p>
                    <p className="text-base font-medium text-primary-600 dark:text-primary-400">@{watch("username")}</p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-surface-200 dark:bg-surface-700/50" />

              {/* Section 2: Contact & Bio */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">Email Address</p>
                    <p className="text-sm font-medium flex items-center gap-2">
                       <EnvelopeIcon className="w-3.5 h-3.5 text-surface-400" />
                       {watch("email")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">Contact Number</p>
                    <p className="text-sm font-medium flex items-center gap-2">
                       <PhoneIcon className="w-3.5 h-3.5 text-surface-400" />
                       {watch("phone")}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">Residential Address</p>
                    <p className="text-sm font-medium flex items-center gap-2">
                       <MapPinIcon className="w-3.5 h-3.5 text-surface-400" />
                       {watch("address")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">Medical (Blood Type)</p>
                    <p className="text-sm font-medium inline-flex items-center px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20">
                       {watch("bloodType")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-surface-200 dark:bg-surface-700/50" />

              {/* Section 3: Professional */}
              <div>
                <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-3">Academic Subjects</p>
                <div className="flex flex-wrap gap-2">
                  {watch("subjects")?.map((subId: any) => {
                    const subName = subjects.find((s: any) => String(s.id) === String(subId))?.name || subId;
                    return (
                      <span key={subId} className="px-3 py-1 bg-surface-100 dark:bg-surface-800 rounded-lg text-xs font-bold border border-surface-200 dark:border-surface-700">
                        {subName}
                      </span>
                    );
                  })}
                  {(watch("subjects")?.length ?? 0) === 0 && <span className="text-sm text-surface-400 italic">No subjects selected</span>}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-primary-50 dark:bg-primary-500/5 border border-primary-100 dark:border-primary-500/20 rounded-2xl">
             <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                <CheckCircleIcon className="w-3.5 h-3.5 text-white" />
             </div>
             <p className="text-xs font-medium text-primary-700 dark:text-primary-300">
                By completing setup, you are creating a new faculty portal account with the identifiers listed above.
             </p>
          </div>
        </div>
      )}
    </BaseForm>
  );
};

export default TeacherForm;
