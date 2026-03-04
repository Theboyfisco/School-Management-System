"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useFormState } from "react-dom";
import InputField from "../InputField";
import CustomDropdown from "../CustomDropdown";
import BaseForm from "./BaseForm";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { createParent, updateParent } from "@/lib/actions";
import { createParentSchema, updateParentSchema } from "@/lib/formValidationSchemas";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  PhotoIcon,
  UserGroupIcon,
  IdentificationIcon,
  KeyIcon,
  CheckCircleIcon,
  UsersIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const ParentForm = ({
  setOpen,
  type,
  data,
}: {
  setOpen: Dispatch<SetStateAction<boolean>>;
  type: "create" | "update";
  data?: any;
}) => {
  const router = useRouter();
  const [img, setImg] = useState<any>(data?.img || null);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(type === 'create' ? createParentSchema : updateParentSchema),
    defaultValues: {
      username: data?.username || '',
      name: data?.name || '',
      surname: data?.surname || '',
      email: data?.email || '',
      password: '',
      phone: data?.phone || '',
      address: data?.address || '',
      studentIds: data?.students?.map((s: any) => s.id) || [],
      id: data?.id || undefined,
    },
  });

  const [state, formAction] = useFormState(
    type === 'create' ? createParent : updateParent,
    { success: false, error: false, message: "" }
  );

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoadingStudents(true);
      try {
        const response = await fetch('/api/students');
        const studentsData = await response.json();
        setStudents(studentsData);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setIsLoadingStudents(false);
      }
    };
    fetchStudents();
  }, []);

  const studentOptions = (students || []).map((student: any) => ({
    value: student.id,
    label: `${student.name} ${student.surname} (${student.class?.name || 'No Class'})`,
    icon: <UserIcon className="w-4 h-4" />
  }));

  const onSubmit = handleSubmit(async (formData) => {
    const loadingToast = toast.loading(`${type === "create" ? "Creating" : "Updating"} parent record...`);
    try {
      const result = await (type === 'create' 
        ? createParent({ success: false, error: false }, { ...formData, img: img?.secure_url || null })
        : updateParent({ success: false, error: false }, { ...formData, img: img?.secure_url || null })
      );

      if (result?.success) {
        toast.update(loadingToast, {
          render: `Parent ${type === "create" ? "created" : "updated"} successfully!`,
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
      title={type === "create" ? "Guardian Registration" : "Edit Guardian Details"}
      subtitle={type === "create" ? "Register a new parent or legal guardian in the system" : "Update contact information and student links"}
      onSubmit={onSubmit}
      onCancel={() => setOpen(false)}
      submitLabel={type === "create" ? "Register Guardian" : "Update Profile"}
      isSubmitting={isSubmitting}
    >
      {/* Premium Profile Header */}
      <div className="bg-gradient-to-br from-indigo-50/50 to-primary-50/50 dark:from-indigo-500/10 dark:to-primary-500/10 rounded-[2rem] p-8 border border-white dark:border-surface-800 shadow-sm relative overflow-hidden group">
        <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-tr from-primary-500 to-indigo-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
            <div className="relative w-28 h-28 rounded-full overflow-hidden bg-surface-100 dark:bg-surface-800 ring-4 ring-white dark:ring-surface-900 shadow-2xl">
              {img?.secure_url || data?.img ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={img?.secure_url || data?.img} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PhotoIcon className="w-10 h-10 text-surface-300 dark:text-surface-600" />
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-surface-950/60 flex items-center justify-center backdrop-blur-sm">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
          <div className="text-center sm:text-left space-y-3 flex-1">
            <h3 className="text-xl font-bold text-surface-900 dark:text-white font-display flex items-center justify-center sm:justify-start gap-2">
                Guardian Profile
                <SparklesIcon className="w-5 h-5 text-accent-500" />
            </h3>
            <p className="text-surface-500 dark:text-surface-400 text-sm max-w-sm leading-relaxed">
                Provide a clear portrait for emergency identification and authorized student pick-ups.
            </p>
            <CldUploadWidget
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
                  className="btn btn-primary px-8 py-2.5 rounded-xl gap-2 shadow-lg shadow-primary-500/20"
                >
                  <PhotoIcon className="w-4 h-4" />
                  {img ? 'Update Portrait' : 'Upload Image'}
                </button>
              )}
            </CldUploadWidget>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">
        <div className="space-y-10">
          {/* Account Security */}
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
                placeholder="Parent portal handle"
                required
              />
              <InputField
                label="Email Address"
                name="email"
                type="email"
                register={register}
                error={errors?.email}
                icon={<EnvelopeIcon className="w-4 h-4" />}
                placeholder="guardian@email.com"
                required
              />
              {type === "create" && (
                <InputField
                    label="Access Password"
                    name="password"
                    type="password"
                    register={register}
                    error={errors?.password}
                    placeholder="Create secure password"
                    required
                />
              )}
            </div>
          </div>

          {/* Identity Section */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Authorized Identity
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
            <InputField
                label="Primary Phone"
                name="phone"
                register={register}
                error={errors?.phone}
                icon={<PhoneIcon className="w-4 h-4" />}
                placeholder="+1 (555) 000-0000"
                required
            />
          </div>
        </div>

        <div className="space-y-10">
             {/* Contact & Location */}
             <div className="space-y-6">
                <h3 className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4" />
                    Resident Details
                </h3>
                <InputField
                    label="Home Address"
                    name="address"
                    register={register}
                    error={errors?.address}
                    icon={<MapPinIcon className="w-4 h-4" />}
                    placeholder="Residential address"
                    required
                />
            </div>

            {/* Student Relationships */}
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <UserGroupIcon className="w-4 h-4" />
                    Family Connections
                </h3>
                <CustomDropdown
                    label="Associated Students"
                    name="studentIds"
                    options={studentOptions}
                    value={watch("studentIds") || []}
                    onChange={(val) => setValue("studentIds", val as any[])}
                    placeholder={isLoadingStudents ? "Loading student database..." : "Assign students to this guardian"}
                    multiSelect
                    searchable
                    required
                    loading={isLoadingStudents}
                    helperText="Select all students this guardian is responsible for"
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

export default ParentForm;
