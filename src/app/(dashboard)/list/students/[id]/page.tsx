import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import Performance from "@/components/Performance";
import StudentAttendanceCard from "@/components/StudentAttendanceCard";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Student, Class } from "@prisma/client";
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  CalendarIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  HeartIcon,
  ClockIcon,
  ChartBarIcon,
  BookOpenIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

type StudentWithClass = Student & {
  class: Class & {
    _count: {
      lessons: number;
    };
  };
};

const SingleStudentPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role as string;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      class: {
        include: {
          _count: {
            select: { lessons: true }
          }
        }
      },
      parent: true,
      grade: true,
    }
  });

  if (!student) {
    return notFound();
  }

  const calculateAge = (birthday: Date) => {
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const age = calculateAge(student.birthday);

  return (
    <div className="flex-1 space-y-8 animate-fade-in pb-12">
      {/* breadcrumb-style header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <Link 
            href="/list/students"
            className="group flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:border-primary-500 transition-all shadow-sm"
          >
            <ArrowLeftIcon className="w-5 h-5 text-surface-500 group-hover:text-primary-500 transition-colors" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-surface-500 uppercase tracking-widest">
              <span>Directory</span>
              <span className="text-surface-300">/</span>
              <span className="text-primary-500">Students</span>
            </div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white font-display">
              Student Information
            </h1>
          </div>
        </div>
        {role === "admin" && (
          <FormContainer table="student" type="update" data={student}>
            <button className="btn-primary py-2 px-5 shadow-glow hover:shadow-glow-lg transition-all">
              <UserIcon className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </FormContainer>
        )}
      </div>

      {/* Hero Section */}
      <div className="relative group perspective">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 dark:from-blue-600/20 dark:to-indigo-600/20 rounded-[2.5rem] blur-3xl -z-10 transition-all group-hover:scale-110 duration-1000"></div>
        
        <div className="glass-strong rounded-[2.5rem] overflow-hidden border border-white/20 dark:border-surface-700/50 shadow-glass-lg relative">
          {/* Header Background */}
          <div className="h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 mix-blend-overlay">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 0 L100 0 L100 100 L0 100 Z" fill="url(#grid-pattern)" />
                <defs>
                  <pattern id="grid-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </pattern>
                </defs>
              </svg>
            </div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"></div>
          </div>

          <div className="px-8 pb-8 -mt-16 relative">
            <div className="flex flex-col md:flex-row items-end gap-6">
              <div className="relative p-1.5 bg-white dark:bg-surface-800 rounded-[2rem] shadow-glow">
                <Image
                  src={student.img || "/noAvatar.png"}
                  alt={student.name}
                  width={140}
                  height={140}
                  className="w-32 h-32 md:w-36 md:h-36 rounded-[1.75rem] object-cover"
                />
                <div className="absolute bottom-2 right-2 w-7 h-7 bg-success-500 border-4 border-white dark:border-surface-800 rounded-full shadow-lg"></div>
              </div>

              <div className="flex-1 mb-2 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                  <h2 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-white font-display">
                    {student.name} {student.surname}
                  </h2>
                  <span className="badge-primary px-3 py-1 text-xs">Grade {student.grade.level}</span>
                  <span className="badge-success px-3 py-1 text-xs">Active</span>
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-surface-500 dark:text-surface-400 font-medium">
                  <span className="flex items-center gap-1.5 font-display text-sm tracking-wide">
                    {student.class.name}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs">
                    <AcademicCapIcon className="w-4 h-4 text-primary-500" />
                    Full-time Student
                  </span>
                  <span className="flex items-center gap-1.5">
                    <UserIcon className="w-4 h-4 text-indigo-500" />
                    @{student.username}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
              <div className="glass p-5 rounded-2xl flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <ClockIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <Suspense fallback={<div className="h-6 w-12 bg-surface-200 dark:bg-surface-700 rounded animate-pulse"></div>}>
                    <div className="text-2xl font-bold text-surface-900 dark:text-white">
                      <StudentAttendanceCard id={student.id} />
                    </div>
                  </Suspense>
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wide">Attendance</p>
                </div>
              </div>
              <div className="glass p-5 rounded-2xl flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <ChartBarIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">85%</p>
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wide">Grade Avg</p>
                </div>
              </div>
              <div className="glass p-5 rounded-2xl flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <DocumentTextIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">12</p>
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wide">Assignments</p>
                </div>
              </div>
              <div className="glass p-5 rounded-2xl flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <CalendarDaysIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">3</p>
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wide">Events</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Bento Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-hover p-6">
              <h3 className="section-header flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                </div>
                General Info
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 px-4 py-3 bg-surface-50 dark:bg-surface-850 rounded-xl border border-surface-100 dark:border-surface-700/50">
                  <EnvelopeIcon className="w-5 h-5 text-primary-500" />
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-surface-400 font-bold block">Email Address</label>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">{student.email || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 px-4 py-3 bg-surface-50 dark:bg-surface-850 rounded-xl border border-surface-100 dark:border-surface-700/50">
                  <PhoneIcon className="w-5 h-5 text-accent-500" />
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-surface-400 font-bold block">Phone Number</label>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">{student.phone || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 px-4 py-3 bg-surface-50 dark:bg-surface-850 rounded-xl border border-surface-100 dark:border-surface-700/50">
                  <MapPinIcon className="w-5 h-5 text-indigo-500" />
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-surface-400 font-bold block">Address</label>
                    <p className="text-sm font-medium text-surface-900 dark:text-white leading-tight">{student.address}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-hover p-6">
              <h3 className="section-header flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                   <AcademicCapIcon className="w-5 h-5 text-indigo-600" />
                </div>
                Academic Profile
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 px-4 py-3 bg-surface-50 dark:bg-surface-850 rounded-xl border border-surface-100 dark:border-surface-700/50">
                  <CalendarIcon className="w-5 h-5 text-orange-500" />
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-surface-400 font-bold block">Birthday</label>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">
                       {new Intl.DateTimeFormat("en-US", { year: 'numeric', month: 'long', day: 'numeric' }).format(student.birthday)}
                       <span className="ml-2 text-surface-400 text-xs">({age} y/o)</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 px-4 py-3 bg-surface-50 dark:bg-surface-850 rounded-xl border border-surface-100 dark:border-surface-700/50">
                  <UserIcon className="w-5 h-5 text-success-500" />
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-surface-400 font-bold block">Parent/Guardian</label>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">
                      {student.parent.name} {student.parent.surname}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 px-4 py-3 bg-surface-50 dark:bg-surface-850 rounded-xl border border-surface-100 dark:border-surface-700/50">
                   <HeartIcon className="w-5 h-5 text-danger-500" />
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-surface-400 font-bold block">Blood Group</label>
                    <p className="text-sm font-medium text-surface-900 dark:text-white font-mono">{student.bloodType}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="card-hover p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="section-header">Academic Schedule</h3>
                <p className="section-subheader">A visual overview of the student timetable</p>
              </div>
              <div className="flex gap-2">
                 <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                 <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                 <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              </div>
            </div>
            <div className="h-[600px] animate-in slide-in-from-bottom-4 duration-700">
              <BigCalendarContainer />
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="card p-6 bg-gradient-to-b from-surface-50 to-white dark:from-surface-900 dark:to-surface-850">
            <h3 className="section-header mb-6">Student Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href={`/list/lessons?classId=${student.class.id}`}
                className="group p-4 bg-white dark:bg-surface-800 border border-surface-100 dark:border-surface-700 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-blue-500 hover:shadow-glow transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpenIcon className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-tight">Lessons</span>
              </Link>
              <Link
                href={`/list/teachers?classId=${student.class.id}`}
                className="group p-4 bg-white dark:bg-surface-800 border border-surface-100 dark:border-surface-700 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-purple-500 hover:shadow-glow transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserIcon className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-tight">Teachers</span>
              </Link>
              <Link
                href={`/list/exams?classId=${student.class.id}`}
                className="group p-4 bg-white dark:bg-surface-800 border border-surface-100 dark:border-surface-700 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-danger-500 hover:shadow-glow transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-danger-50 dark:bg-danger-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DocumentTextIcon className="w-5 h-5 text-danger-600" />
                </div>
                <span className="text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-tight">Exams</span>
              </Link>
              <Link
                href={`/list/results?studentId=${student.id}`}
                className="group p-4 bg-white dark:bg-surface-800 border border-surface-100 dark:border-surface-700 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-success-500 hover:shadow-glow transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-success-50 dark:bg-success-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ChartBarIcon className="w-5 h-5 text-success-600" />
                </div>
                <span className="text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-tight">Results</span>
              </Link>
            </div>
          </div>

          <div className="card overflow-hidden">
             <div className="p-4 border-b border-surface-100 dark:border-surface-700/50 flex items-center justify-between">
                <h3 className="section-header text-base">Academic Performance</h3>
                <ChartBarIcon className="w-4 h-4 text-primary-500" />
             </div>
             <div className="p-6">
                <Performance />
             </div>
          </div>

          <div className="card overflow-hidden">
             <div className="p-4 border-b border-surface-100 dark:border-surface-700/50 flex items-center justify-between">
                <h3 className="section-header text-base">Latest Updates</h3>
                <span className="text-[10px] font-bold text-primary-500 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded uppercase tracking-wider">Board</span>
             </div>
             <div className="p-6">
                <Announcements />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleStudentPage;
