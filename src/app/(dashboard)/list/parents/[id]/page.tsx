import Announcements from "@/components/Announcements";
import FormContainer from "@/components/FormContainer";
import Performance from "@/components/Performance";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { Parent, Student, Class } from "@prisma/client";
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
  StarIcon,
  UserGroupIcon,
  TrophyIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

type ParentWithDetails = Parent & {
  students: (Student & {
    class: Class;
    grade: { level: number };
  })[];
  _count: {
    students: number;
  };
};

const SingleParentPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role as string;

  const parent: ParentWithDetails | null = await prisma.parent.findUnique({
    where: { id },
    include: {
      students: {
        include: {
          class: true,
          grade: true,
        }
      },
      _count: {
        select: {
          students: true
        }
      }
    },
  });

  if (!parent) {
    return notFound();
  }



  return (
    <div className="flex-1 space-y-8 animate-fade-in pb-12">
      {/* breadcrumb-style header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <Link 
            href="/list/parents"
            className="group flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:border-primary-500 transition-all shadow-sm"
          >
            <ArrowLeftIcon className="w-5 h-5 text-surface-500 group-hover:text-primary-500 transition-colors" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-surface-500 uppercase tracking-widest">
              <span>Directory</span>
              <span className="text-surface-300">/</span>
              <span className="text-primary-500">Parents</span>
            </div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white font-display">
              Parent Overview
            </h1>
          </div>
        </div>
        {role === "admin" && (
          <FormContainer table="parent" type="update" data={parent}>
            <button className="btn-primary py-2 px-5 shadow-glow hover:shadow-glow-lg transition-all">
              <UserIcon className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </FormContainer>
        )}
      </div>

      {/* Hero Section */}
      <div className="relative group perspective">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-teal-600/10 dark:from-emerald-600/20 dark:to-teal-600/20 rounded-[2.5rem] blur-3xl -z-10 transition-all group-hover:scale-110 duration-1000"></div>
        
        <div className="glass-strong rounded-[2.5rem] overflow-hidden border border-white/20 dark:border-surface-700/50 shadow-glass-lg relative">
          {/* Header Background */}
          <div className="h-40 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 relative overflow-hidden">
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
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl"></div>
          </div>

          <div className="px-8 pb-8 -mt-16 relative">
            <div className="flex flex-col md:flex-row items-end gap-6">
              <div className="relative p-1.5 bg-white dark:bg-surface-800 rounded-[2rem] shadow-glow">
                <Image
                  src="/noAvatar.png"
                  alt={parent.name}
                  width={140}
                  height={140}
                  className="w-32 h-32 md:w-36 md:h-36 rounded-[1.75rem] object-cover"
                />
                <div className="absolute bottom-2 right-2 w-7 h-7 bg-success-500 border-4 border-white dark:border-surface-800 rounded-full shadow-lg"></div>
              </div>

              <div className="flex-1 mb-2 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                  <h2 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-white font-display">
                    {parent.name} {parent.surname}
                  </h2>
                  <span className="badge-primary px-3 py-1 text-xs">Family Account</span>
                  <span className="badge-success px-3 py-1 text-xs">Verified</span>
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-surface-500 dark:text-surface-400 font-medium">
                  <span className="flex items-center gap-1.5 font-display text-sm tracking-wide">
                    Guardian Portfolio
                  </span>
                  <span className="flex items-center gap-1.5 text-xs">
                    <CalendarDaysIcon className="w-4 h-4 text-primary-500" />
                    Member since {new Intl.DateTimeFormat("en-US", { year: 'numeric', month: 'short' }).format(new Date(parent.createdAt))}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <UserIcon className="w-4 h-4 text-emerald-500" />
                    @{parent.username}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
              <div className="glass p-5 rounded-2xl flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <UsersIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">{parent._count.students}</p>
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wide">Children</p>
                </div>
              </div>
              <div className="glass p-5 rounded-2xl flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <BuildingOfficeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">
                    {new Set(parent.students.map(s => s.class.id)).size}
                  </p>
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wide">Total Classes</p>
                </div>
              </div>
              <div className="glass p-5 rounded-2xl flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <AcademicCapIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">
                    {new Set(parent.students.map(s => s.grade.level)).size}
                  </p>
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wide">Grade Levels</p>
                </div>
              </div>
              <div className="glass p-5 rounded-2xl flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <ChartBarIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">85%</p>
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wide">Avg Progress</p>
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
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-emerald-600" />
                </div>
                Contact Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 px-4 py-3 bg-surface-50 dark:bg-surface-850 rounded-xl border border-surface-100 dark:border-surface-700/50">
                  <EnvelopeIcon className="w-5 h-5 text-primary-500" />
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-surface-400 font-bold block">Email Address</label>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">{parent.email || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 px-4 py-3 bg-surface-50 dark:bg-surface-850 rounded-xl border border-surface-100 dark:border-surface-700/50">
                  <PhoneIcon className="w-5 h-5 text-accent-500" />
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-surface-400 font-bold block">Phone Number</label>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">{parent.phone || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 px-4 py-3 bg-surface-50 dark:bg-surface-850 rounded-xl border border-surface-100 dark:border-surface-700/50">
                  <MapPinIcon className="w-5 h-5 text-indigo-500" />
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-surface-400 font-bold block">Residence</label>
                    <p className="text-sm font-medium text-surface-900 dark:text-white leading-tight">{parent.address}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-hover p-6">
              <h3 className="section-header flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                  <UserGroupIcon className="w-5 h-5 text-teal-600" />
                </div>
                Family Account
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 px-4 py-3 bg-surface-50 dark:bg-surface-850 rounded-xl border border-surface-100 dark:border-surface-700/50 text-xs">
                   <UsersIcon className="w-5 h-5 text-orange-500" />
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-surface-400 font-bold block">Linked Students</label>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">
                      {parent.students.length} Total Children
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 px-4 py-3 bg-surface-50 dark:bg-surface-850 rounded-xl border border-surface-100 dark:border-surface-700/50">
                  <BuildingOfficeIcon className="w-5 h-5 text-blue-500" />
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-surface-400 font-bold block">Active Classes</label>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">
                      {new Set(parent.students.map(s => s.class.id)).size} School Classes
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 px-4 py-3 bg-surface-50 dark:bg-surface-850 rounded-xl border border-surface-100 dark:border-surface-700/50">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500" />
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-surface-400 font-bold block">Status</label>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">Principal Guardian</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Children Information Cards */}
          <div className="space-y-6">
            <h3 className="section-header text-xl ml-2">Children Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {parent.students.map((student) => (
                <div key={student.id} className="card-hover p-6 group">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        <Image
                          src={student.img || "/noAvatar.png"}
                          alt={student.name}
                          width={60}
                          height={60}
                          className="w-14 h-14 rounded-2xl object-cover ring-2 ring-surface-100 dark:ring-surface-700 group-hover:ring-primary-400 transition-all"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success-500 border-2 border-white dark:border-surface-800 rounded-full"></div>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-surface-900 dark:text-white group-hover:text-primary-500 transition-colors">
                          {student.name} {student.surname}
                        </h4>
                        <p className="text-xs font-medium text-surface-500 uppercase tracking-widest">Grade {student.grade.level} • {student.class.name}</p>
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-surface-50 dark:bg-surface-850 p-3 rounded-xl border border-surface-100 dark:border-surface-700/50">
                        <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Attendance</p>
                        <p className="text-sm font-bold text-surface-900 dark:text-white">92%</p>
                      </div>
                      <div className="bg-surface-50 dark:bg-surface-850 p-3 rounded-xl border border-surface-100 dark:border-surface-700/50">
                        <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Performance</p>
                        <p className="text-sm font-bold text-surface-900 dark:text-white">A-</p>
                      </div>
                   </div>

                   <div className="flex gap-2">
                     <Link
                       href={`/list/students/${student.id}`}
                       className="flex-1 btn btn-secondary py-2 text-xs font-bold gap-2"
                     >
                       <EyeIcon className="w-4 h-4" />
                       View Profile
                     </Link>
                     <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 transition-colors">
                       <ChartBarIcon className="w-5 h-5" />
                     </button>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="card p-6 bg-gradient-to-b from-surface-50 to-white dark:from-surface-900 dark:to-surface-850">
            <h3 className="section-header mb-6">Parent Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href={`/list/students?parentId=${parent.id}`}
                className="group p-4 bg-white dark:bg-surface-800 border border-surface-100 dark:border-surface-700 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-emerald-500 hover:shadow-glow transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UsersIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-tight text-center">Children</span>
              </Link>
              <Link
                href={`/list/attendance?parentId=${parent.id}`}
                className="group p-4 bg-white dark:bg-surface-800 border border-surface-100 dark:border-surface-700 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-blue-500 hover:shadow-glow transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ClockIcon className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-tight text-center">Attendance</span>
              </Link>
              <Link
                href={`/list/results?parentId=${parent.id}`}
                className="group p-4 bg-white dark:bg-surface-800 border border-surface-100 dark:border-surface-700 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-purple-500 hover:shadow-glow transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrophyIcon className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-tight text-center">Results</span>
              </Link>
              <Link
                href={`/list/messages?recipientId=${parent.id}`}
                className="group p-4 bg-white dark:bg-surface-800 border border-surface-100 dark:border-surface-700 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-orange-500 hover:shadow-glow transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <EnvelopeIcon className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-tight text-center">Message</span>
              </Link>
            </div>
          </div>

          <div className="card overflow-hidden">
             <div className="p-4 border-b border-surface-100 dark:border-surface-700/50 flex items-center justify-between">
                <h3 className="section-header text-base">Family Performance</h3>
                <ChartBarIcon className="w-4 h-4 text-emerald-500" />
             </div>
             <div className="p-6">
                <Performance />
             </div>
          </div>

          <div className="card overflow-hidden">
             <div className="p-4 border-b border-surface-100 dark:border-surface-700/50 flex items-center justify-between">
                <h3 className="section-header text-base">School Updates</h3>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded uppercase tracking-wider">Latest</span>
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

export default SingleParentPage; 