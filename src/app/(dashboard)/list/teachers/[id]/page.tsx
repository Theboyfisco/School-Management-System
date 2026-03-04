export const dynamic = "force-dynamic";

import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import Performance from "@/components/Performance";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { Teacher, Subject, Class, Lesson } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
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
  ArrowLeftIcon,
  UsersIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

type TeacherWithDetails = Teacher & {
  _count: { 
    subjects: number; 
    lessons: number; 
    classes: number;
  };
  subjects: Subject[];
  classes: (Class & { _count: { students: number } })[];
  lessons: (Lesson & { subject: Subject; class: Class })[];
};

const SingleTeacherPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role as string;

  const teacher: TeacherWithDetails | null = await prisma.teacher.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          subjects: true,
          lessons: true,
          classes: true,
        },
      },
      subjects: {
        take: 5,
        orderBy: { name: 'asc' }
      },
      classes: {
        take: 5,
        include: {
          _count: {
            select: { students: true }
          }
        }
      },
      lessons: {
        take: 10,
        include: {
          subject: true,
          class: true
        },
        orderBy: { startTime: 'desc' }
      }
    },
  });

  if (!teacher) {
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
  const age = calculateAge(teacher.birthday);

  return (
    <div className="flex-1 space-y-8 animate-fade-in pb-12">
      {/* breadcrumb-style header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <Link 
            href="/list/teachers"
            className="group flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:border-primary-500 transition-all shadow-sm"
          >
            <ArrowLeftIcon className="w-5 h-5 text-surface-500 group-hover:text-primary-500 transition-colors" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-surface-500 uppercase tracking-widest">
              <span>Directory</span>
              <span className="text-surface-300">/</span>
              <span className="text-primary-500">Teachers</span>
            </div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white font-display">
              Profile Overview
            </h1>
          </div>
        </div>
        {role === "admin" && (
          <FormContainer table="teacher" type="update" data={teacher}>
            <button className="btn-primary py-2 px-5 shadow-glow hover:shadow-glow-lg transition-all">
              <UserIcon className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </FormContainer>
        )}
      </div>

      {/* Hero Section */}
      <div className="relative group perspective">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-accent-600/10 dark:from-primary-600/20 dark:to-accent-600/20 rounded-[2.5rem] blur-3xl -z-10 transition-all group-hover:scale-110 duration-1000"></div>
        
        <div className="glass-strong rounded-[2.5rem] overflow-hidden border border-white/20 dark:border-surface-700/50 shadow-glass-lg relative">
          {/* Header Background */}
          <div className="h-40 bg-gradient-to-r from-primary-600 via-accent-600 to-indigo-700 relative overflow-hidden">
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
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-primary-400/20 rounded-full blur-2xl"></div>
          </div>

          <div className="px-8 pb-8 -mt-16 relative">
            <div className="flex flex-col md:flex-row items-end gap-6">
              <div className="relative p-1.5 bg-white dark:bg-surface-800 rounded-[2rem] shadow-glow">
                <Image
                  src={teacher.img || "/noAvatar.png"}
                  alt={teacher.name}
                  width={140}
                  height={140}
                  className="w-32 h-32 md:w-36 md:h-36 rounded-[1.75rem] object-cover"
                />
                <div className="absolute bottom-2 right-2 w-7 h-7 bg-success-500 border-4 border-white dark:border-surface-800 rounded-full shadow-lg"></div>
              </div>

              <div className="flex-1 mb-2 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                  <h2 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-white font-display">
                    {teacher.name} {teacher.surname}
                  </h2>
                  <span className="badge-primary px-3 py-1 text-xs">{teacher.sex}</span>
                  <span className="badge-success px-3 py-1 text-xs">Active</span>
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-surface-500 dark:text-surface-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <BriefcaseIcon className="w-4 h-4 text-primary-500" />
                    Senior Faculty
                  </span>
                  <span className="flex items-center gap-1.5 text-xs">
                    <ClockIcon className="w-4 h-4 text-accent-500" />
                    Joined {new Intl.DateTimeFormat("en-US", { year: 'numeric', month: 'short' }).format(new Date())}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <UserIcon className="w-4 h-4 text-indigo-500" />
                    @{teacher.username}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
              <div className="glass p-5 rounded-2xl flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <AcademicCapIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">{teacher._count.subjects}</p>
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wide">Subjects</p>
                </div>
              </div>
              <div className="glass p-5 rounded-2xl flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
                <div className="w-12 h-12 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
                  <BuildingOfficeIcon className="w-6 h-6 text-accent-600 dark:text-accent-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">{teacher._count.classes}</p>
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wide">Classes</p>
                </div>
              </div>
              <div className="glass p-5 rounded-2xl flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
                <div className="w-12 h-12 rounded-xl bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
                  <BookOpenIcon className="w-6 h-6 text-success-600 dark:text-success-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">{teacher._count.lessons}</p>
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wide">Lessons</p>
                </div>
              </div>
              <div className="glass p-5 rounded-2xl flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
                <div className="w-12 h-12 rounded-xl bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
                  <UsersIcon className="w-6 h-6 text-warning-600 dark:text-warning-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">
                    {teacher.classes.reduce((total, cls) => total + cls._count.students, 0)}
                  </p>
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wide">Students</p>
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
                <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-primary-600" />
                </div>
                Contact Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 px-4 py-3 bg-surface-50 dark:bg-surface-850 rounded-xl border border-surface-100 dark:border-surface-700/50">
                  <EnvelopeIcon className="w-5 h-5 text-primary-500" />
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-surface-400 font-bold block">Email Address</label>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">{teacher.email || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 px-4 py-3 bg-surface-50 dark:bg-surface-850 rounded-xl border border-surface-100 dark:border-surface-700/50">
                  <PhoneIcon className="w-5 h-5 text-accent-500" />
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-surface-400 font-bold block">Phone Number</label>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">{teacher.phone || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 px-4 py-3 bg-surface-50 dark:bg-surface-850 rounded-xl border border-surface-100 dark:border-surface-700/50 text-xs">
                  <MapPinIcon className="w-5 h-5 text-indigo-500" />
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-surface-400 font-bold block">Office Address</label>
                    <p className="text-sm font-medium text-surface-900 dark:text-white leading-snug">{teacher.address}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-hover p-6">
              <h3 className="section-header flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
                  <AcademicCapIcon className="w-5 h-5 text-accent-600" />
                </div>
                Personal Profile
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 px-4 py-3 bg-surface-50 dark:bg-surface-850 rounded-xl border border-surface-100 dark:border-surface-700/50">
                  <CalendarDaysIcon className="w-5 h-5 text-orange-500" />
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-surface-400 font-bold block">Date of Birth</label>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">
                       {new Intl.DateTimeFormat("en-US", { year: 'numeric', month: 'long', day: 'numeric' }).format(teacher.birthday)}
                       <span className="ml-2 text-surface-400 text-xs">({age} y/o)</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 px-4 py-3 bg-surface-50 dark:bg-surface-850 rounded-xl border border-surface-100 dark:border-surface-700/50">
                  <HeartIcon className="w-5 h-5 text-danger-500" />
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-surface-400 font-bold block">Blood Group</label>
                    <p className="text-sm font-medium text-surface-900 dark:text-white font-mono">{teacher.bloodType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 px-4 py-3 bg-surface-50 dark:bg-surface-850 rounded-xl border border-surface-100 dark:border-surface-700/50">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-500 to-accent-500" />
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-surface-400 font-bold block">Primary Subject</label>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">
                      {teacher.subjects[0]?.name || "General Early Education"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="card-hover p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="section-header">Teaching Timetable</h3>
                <p className="section-subheader">A visual overview of the weekly schedule</p>
              </div>
              <div className="flex gap-2">
                 <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                 <div className="w-3 h-3 rounded-full bg-accent-500"></div>
                 <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
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
            <h3 className="section-header mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href={`/list/classes?supervisorId=${teacher.id}`}
                className="group p-4 bg-white dark:bg-surface-800 border border-surface-100 dark:border-surface-700 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-primary-500 hover:shadow-glow transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BuildingOfficeIcon className="w-5 h-5 text-primary-600" />
                </div>
                <span className="text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-tight">Classes</span>
              </Link>
              <Link
                href={`/list/students?teacherId=${teacher.id}`}
                className="group p-4 bg-white dark:bg-surface-800 border border-surface-100 dark:border-surface-700 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-accent-500 hover:shadow-glow transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UsersIcon className="w-5 h-5 text-accent-600" />
                </div>
                <span className="text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-tight">Students</span>
              </Link>
              <Link
                href={`/list/lessons?teacherId=${teacher.id}`}
                className="group p-4 bg-white dark:bg-surface-800 border border-surface-100 dark:border-surface-700 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-success-500 hover:shadow-glow transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-success-50 dark:bg-success-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpenIcon className="w-5 h-5 text-success-600" />
                </div>
                <span className="text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-tight">Lessons</span>
              </Link>
              <Link
                href={`/list/exams?teacherId=${teacher.id}`}
                className="group p-4 bg-white dark:bg-surface-800 border border-surface-100 dark:border-surface-700 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-danger-500 hover:shadow-glow transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-danger-50 dark:bg-danger-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DocumentTextIcon className="w-5 h-5 text-danger-600" />
                </div>
                <span className="text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-tight">Exams</span>
              </Link>
            </div>
          </div>

          {/* Performance Widget */}
          <div className="card overflow-hidden">
             <div className="p-4 border-b border-surface-100 dark:border-surface-700/50 flex items-center justify-between">
                <h3 className="section-header text-base">Key Performance</h3>
                <ChartBarIcon className="w-4 h-4 text-primary-500" />
             </div>
             <div className="p-6">
                <Performance />
             </div>
          </div>

          {/* Announcements */}
          <div className="card overflow-hidden">
             <div className="p-4 border-b border-surface-100 dark:border-surface-700/50 flex items-center justify-between">
                <h3 className="section-header text-base">Announcements</h3>
                <span className="text-[10px] font-bold text-primary-500 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded uppercase tracking-wider">Recent</span>
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

export default SingleTeacherPage;
