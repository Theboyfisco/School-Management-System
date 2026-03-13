"use server";

import { revalidatePath } from "next/cache";
import {
  ClassSchema,
  ExamSchema,
  type ParentSchema, // General parent type
  type CreateParentSchema, // For creating parents
  type UpdateParentSchema, // For updating parents
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
  AssignmentSchema,
  lessonSchema,
  LessonSchema,
  eventSchema,
  EventSchema,
  announcementSchema,
  AnnouncementSchema,
  attendanceSchema,
  AttendanceSchema,
  resultSchema,
  ResultSchema,
  messageSchema,
  MessageSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const isDev = process.env.NODE_ENV === "development";
const log = (...args: unknown[]) => {
  if (isDev) {
    console.log(...args);
  }
};
const logError = (...args: unknown[]) => {
  if (isDev) {
    console.error(...args);
  }
};

export type CurrentState = { 
  success: boolean; 
  error: boolean;
  message?: string;
};

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: (data.teachers || []).map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    revalidatePath("/list/subjects");
    return { success: true, error: false, message: "" };
  } catch (err) {
    logError(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        teachers: {
          set: (data.teachers || []).map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    revalidatePath("/list/subjects");
    return { success: true, error: false, message: "" };
  } catch (err) {
    logError(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id");
  if (!id || typeof id !== 'string') {
    return { 
      success: false, 
      error: true,
      message: 'Valid subject ID is required'
    };
  }

  const subjectId = parseInt(id);
  if (isNaN(subjectId)) {
    return {
      success: false,
      error: true,
      message: 'Invalid subject ID format'
    };
  }

  try {
    // First check if subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId }
    });

    if (!subject) {
      return {
        success: false,
        error: true,
        message: 'Subject not found'
      };
    }

    await prisma.subject.delete({
      where: {
        id: subjectId,
      },
    });

    revalidatePath("/list/subjects");
    return { success: true, error: false, message: "" };
  } catch (err) {
    logError('Error deleting subject:', err);
    return { 
      success: false, 
      error: true,
      message: err instanceof Error ? err.message : 'An error occurred while deleting the subject'
    };
  }
};

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.create({
      data,
    });

    revalidatePath("/list/classes");
    return { success: true, error: false, message: "" };
  } catch (err) {
    logError(err);
    return { success: false, error: true, message: "Failed to create class" };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.update({
      where: {
        id: data.id,
      },
      data,
    });

    revalidatePath("/list/classes");
    return { success: true, error: false, message: "" };
  } catch (err) {
    logError(err);
    return { success: false, error: true, message: "Failed to update class" };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.class.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/classes");
    return { success: true, error: false, message: "" };
  } catch (err) {
    logError(err);
    return { success: false, error: true };
  }
};

export const createAdmin = async (
  currentState: CurrentState,
  data: { username: string; password?: string; email?: string }
) => {
  let authUser = null;
  try {
    const supabase = createAdminClient();
    const email = data.email || `${data.username}@admin.academia.connect`;

    // 1. Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: data.password || "Admin123!", // Default password if not provided
      user_metadata: { 
        role: "admin",
        username: data.username 
      },
      email_confirm: true
    });

    if (authError) {
      logError('Supabase Auth error:', authError);
      return { success: false, error: true, message: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: true, message: "Failed to create auth user" };
    }

    authUser = authData.user;

    // 2. Create record in Prisma
    await prisma.admin.create({
      data: {
        id: authUser.id,
        username: data.username,
      },
    });

    return { success: true, error: false, message: "" };
  } catch (err: any) {
    logError('Error creating admin:', err);
    
    if (authUser) {
      try {
        const supabase = createAdminClient();
        await supabase.auth.admin.deleteUser(authUser.id);
      } catch (cleanupErr) {
        logError('Cleanup error:', cleanupErr);
      }
    }
    
    return { success: false, error: true, message: err.message || "An error occurred" };
  }
};

export const deleteAdmin = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    // 1. Delete from Prisma
    await prisma.admin.delete({
      where: {
        id,
      },
    });

    // 2. Delete from Supabase Auth
    const supabase = createAdminClient();
    const { error } = await supabase.auth.admin.deleteUser(id);
    
    if (error) {
      logError('Supabase Auth delete error:', error);
    }

    return { success: true, error: false, message: "" };
  } catch (err) {
    logError('Error deleting admin:', err);
    return { success: false, error: true, message: "Failed to delete admin" };
  }
};

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  let authUser = null;
  try {
    const { username, email, password, name, surname } = data;
    
    // Check if email or username already exists
    const existingTeacher = await prisma.teacher.findFirst({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          { username }
        ]
      }
    });

    if (existingTeacher) {
      return { 
        success: false, 
        error: true, 
        message: 'A teacher with this email or username already exists' 
      };
    }

    const supabase = createAdminClient();
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email || `${username}@teacher.academia.connect`,
      password: password,
      user_metadata: { 
        role: "teacher",
        username: username,
        firstName: name,
        lastName: surname
      },
      email_confirm: true
    });

    if (authError) {
      logError('Supabase Auth error:', authError);
      return { success: false, error: true, message: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: true, message: "Failed to create auth user" };
    }

    authUser = authData.user;

    await prisma.teacher.create({
      data: {
        id: authUser.id,
        username: username,
        name: name,
        surname: surname,
        email: email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });

    revalidatePath("/list/teachers");
    return { success: true, error: false, message: "" };
  } catch (err: any) {
    logError('Error creating teacher:', err);

    if (authUser) {
      try {
        log('Cleaning up: Deleting Supabase auth user');
        const supabase = createAdminClient();
        await supabase.auth.admin.deleteUser(authUser.id);
      } catch (deleteErr) {
        logError('Error deleting Supabase auth user:', deleteErr);
      }
    }

    return { success: false, error: true, message: err.message || "An unexpected error occurred" };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const supabase = createAdminClient();
    
    // Update Supabase Auth if needed (username/password/metadata)
    const { error: authError } = await supabase.auth.admin.updateUserById(data.id, {
      ...(data.password !== "" && { password: data.password }),
      user_metadata: {
        username: data.username,
        firstName: data.name,
        lastName: data.surname,
        role: "teacher"
      }
    });

    if (authError) {
      logError('Supabase Auth update error:', authError);
      return { success: false, error: true, message: authError.message };
    }

    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          set: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });
    revalidatePath("/list/teachers");
    return { success: true, error: false, message: "" };
  } catch (err: any) {
    logError(err);
    return { success: false, error: true, message: err.message || "An unexpected error occurred" };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  
  if (!id) {
    logError('No teacher ID provided');
    return { success: false, error: true, message: 'Teacher ID is required' };
  }

  try {
    // Check for related data before attempting to delete
    const [lessons, supervisedClasses, subjects] = await Promise.all([
      prisma.lesson.findFirst({ where: { teacherId: id } }),
      prisma.class.findFirst({ where: { supervisorId: id } }),
      prisma.subject.findFirst({ 
        where: { 
          teachers: { 
            some: { id } 
          } 
        } 
      })
    ]);

    // Build a list of reasons why the teacher can't be deleted
    const reasons: string[] = [];
    
    if (lessons) reasons.push("has lessons assigned");
    if (supervisedClasses) reasons.push("is a supervisor for one or more classes");
    if (subjects) reasons.push("is assigned to one or more subjects");

    if (reasons.length > 0) {
      return { 
        success: false, 
        error: true, 
        message: `Cannot delete teacher because they ${reasons.join(', ')}. Please remove these associations first.`
      };
    }


    // If no related data, proceed with deletion
    await prisma.teacher.delete({
      where: { id }
    });

    // Delete the user from Supabase Auth
    const supabase = createAdminClient();
    const { error: authError } = await supabase.auth.admin.deleteUser(id);

    if (authError) {
      logError('Supabase Auth deletion error:', authError);
      // We don't necessarily return error here since DB deletion succeeded, 
      // but in production we'd want to handle this sync issue
    }

    revalidatePath("/list/teachers");
    return { success: true, error: false, message: "" };
  } catch (err) {
    logError('Error deleting teacher:', err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : 'Failed to delete teacher' 
    };
  }
};

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  log('Creating student with data:', data);
  let authUser = null;
  
  try {
    // First check if email or username already exists in database
    const existingStudent = await prisma.student.findFirst({
      where: {
        OR: [
          { email: data.email },
          { username: data.username }
        ]
      }
    });

    if (existingStudent) {
      log('Student with this email or username already exists');
      return { 
        success: false, 
        error: true,
        message: 'A student with this email or username already exists'
      };
    }

    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      log('Class is at capacity');
      return { 
        success: false, 
        error: true,
        message: 'The selected class is at capacity'
      };
    }

    log('Creating Supabase Auth user');
    const supabase = createAdminClient();
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email || `${data.username}@student.academia.connect`,
      password: data.password,
      user_metadata: {
        role: "student",
        username: data.username,
        firstName: data.name,
        lastName: data.surname
      },
      email_confirm: true
    });

    if (authError) {
      console.error('Supabase Auth error:', authError);
      return { success: false, error: true, message: authError.message };
    }

    authUser = authData.user;
    if (!authUser) {
      return { success: false, error: true, message: "Failed to create auth user" };
    }

    log('Creating database record');
    const student = await prisma.student.create({
      data: {
        id: authUser.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });
    log('Database record created:', student.id);

    revalidatePath("/list/students");
    return { success: true, error: false, message: "" };
  } catch (err: any) {
    logError('Error creating student:', err);
    
    if (authUser) {
      try {
        log('Cleaning up: Deleting Supabase auth user');
        const supabase = createAdminClient();
        await supabase.auth.admin.deleteUser(authUser.id);
      } catch (deleteErr) {
        logError('Error deleting Supabase auth user:', deleteErr);
      }
    }
    
    return { 
      success: false, 
      error: true,
      message: err.message || 'An error occurred while creating the student'
    };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const supabase = createAdminClient();
    const { error: authError } = await supabase.auth.admin.updateUserById(data.id, {
      ...(data.password !== "" && { password: data.password }),
      user_metadata: {
        username: data.username,
        firstName: data.name,
        lastName: data.surname,
        role: "student"
      }
    });

    if (authError) {
      logError('Supabase Auth update error:', authError);
      return { success: false, error: true, message: authError.message };
    }

    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });
    revalidatePath("/list/students");
    return { success: true, error: false, message: "" };
  } catch (err: any) {
    logError(err);
    return { success: false, error: true, message: err.message || "An unexpected error occurred" };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    // Delete all related records first
    await Promise.all([
      prisma.result.deleteMany({ where: { studentId: id } }),
      prisma.attendance.deleteMany({ where: { studentId: id } })
    ]);

    // Delete from database
    await prisma.student.delete({
      where: {
        id: id,
      },
    });

    // Delete from Supabase Auth
    const supabase = createAdminClient();
    await supabase.auth.admin.deleteUser(id);

    revalidatePath("/list/students");
    return { success: true, error: false, message: "" };
  } catch (err) {
    logError('Error deleting student:', err);
    return { success: false, error: true, message: "Failed to delete student" };
  }
};

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/list/exams");
    return { success: true, error: false, message: "" };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.exam.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/list/exams");
    return { success: true, error: false, message: "" };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    await prisma.exam.delete({
      where: {
        id: parseInt(id),
        // ...(role === "teacher" ? { lesson: { teacherId: userId! } } : {}),
      },
    });

    revalidatePath("/list/exams");
    return { success: true, error: false, message: "" };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  try {
    const { name, day, startTime, endTime, subjectId, teacherId, classId } = data;

    await prisma.lesson.create({
      data: {
        name,
        day,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        subjectId: typeof subjectId === 'string' ? parseInt(subjectId) : subjectId,
        teacherId,
        classId: typeof classId === 'string' ? parseInt(classId) : classId,
      },
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false, message: 'Success' };
  } catch (err) {
    logError('Error creating lesson:', err);
    return { success: false, error: true, message: 'Failed to create lesson' };
  }
};

export const updateLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  try {
    const { id, name, day, startTime, endTime, subjectId, teacherId, classId } = data;

    await prisma.lesson.update({
      where: {
        id: id as number,
      },
      data: {
        name,
        day,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        subjectId: typeof subjectId === 'string' ? parseInt(subjectId) : subjectId,
        teacherId,
        classId: typeof classId === 'string' ? parseInt(classId) : classId,
      },
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false, message: 'Success' };
  } catch (err) {
    logError('Error updating lesson:', err);
    return { success: false, error: true, message: 'Failed to update lesson' };
  }
};

export const deleteLesson = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.lesson.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false, message: "" };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteParent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id");
  if (!id || typeof id !== 'string') {
    return { 
      success: false, 
      error: true,
      message: 'Valid parent ID is required'
    };
  }

  try {
    // Check for related data before attempting to delete
    const [students, parent] = await Promise.all([
      prisma.student.findFirst({ 
        where: { parentId: id },
        select: { id: true, name: true }
      }),
      prisma.parent.findUnique({
        where: { id },
        select: { id: true, students: { select: { id: true, name: true } } }
      })
    ]);

    if (!parent) {
      return {
        success: false,
        error: true,
        message: 'Parent not found'
      };
    }

    // Build a list of reasons why the parent can't be deleted
    const reasons: string[] = [];
    
    if (students) {
      const studentNames = parent.students.map(s => s.name).join(', ');
      reasons.push(`has ${parent.students.length} associated student(s): ${studentNames}`);
    }

    if (reasons.length > 0) {
      return {
        success: false,
        error: true,
        message: `Cannot delete parent because they ${reasons.join(' and ')}. Please reassign or delete these students first.`
      };
    }

    // Delete from database
    await prisma.parent.delete({
      where: { id }
    });

    // Delete from Supabase Auth
    const supabase = createAdminClient();
    await supabase.auth.admin.deleteUser(id);

    revalidatePath("/list/parents");
    return {
      ...currentState,
      success: true,
      error: false,
      message: 'Parent deleted successfully'
    };
  } catch (err) {
    logError('Error deleting parent:', err);
    return { 
      success: false, 
      error: true,
      message: err instanceof Error ? err.message : 'An error occurred while deleting the parent'
    };
  }
};

export const createParent = async (
  currentState: CurrentState,
  data: CreateParentSchema
) => {
  let authUser = null;
  
  try {
    const email = data.email;
    if (!email) {
      return {
        success: false,
        error: true,
        message: 'Email is required for creating a parent'
      };
    }

    // Check if email or username already exists
    const existingParent = await prisma.parent.findFirst({
      where: {
        OR: [
          { email },
          { username: data.username }
        ]
      }
    });

    if (existingParent) {
      return { 
        success: false, 
        error: true,
        message: 'A parent with this email or username already exists'
      };
    }

    // Create Supabase Auth user
    const supabase = createAdminClient();
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      user_metadata: {
        role: "parent",
        username: data.username,
        firstName: data.name,
        lastName: data.surname
      },
      email_confirm: true
    });

    if (authError) {
      logError('Supabase Auth error:', authError);
      return { success: false, error: true, message: authError.message };
    }

    authUser = authData.user;
    if (!authUser) {
      return { success: false, error: true, message: "Failed to create auth user" };
    }

    // Create the user in your database
    const parentData: any = {
      id: authUser.id,
      username: data.username,
      name: data.name,
      surname: data.surname,
      address: data.address,
      email: email,
      phone: data.phone || null,
    };

    // Create parent with student connections if any
    await prisma.parent.create({
      data: {
        ...parentData,
        // Connect students if any are selected
        students: data.studentIds?.length ? {
          connect: data.studentIds.map(id => ({ id }))
        } : undefined,
      }
    });

    revalidatePath("/list/parents");
    return { success: true, error: false, message: "" };
  } catch (err: any) {
    logError('Error creating parent:', err);
    
    if (authUser) {
      try {
        const supabase = createAdminClient();
        await supabase.auth.admin.deleteUser(authUser.id);
      } catch (deleteErr) {
        logError('Error deleting Supabase auth user:', deleteErr);
      }
    }
    
    return { 
      success: false, 
      error: true,
      message: err.message || 'An error occurred while creating the parent'
    };
  }
};

export const updateParent = async (
  currentState: CurrentState,
  data: UpdateParentSchema
) => {
  if (!data.id) {
    return { success: false, error: true, message: 'Parent ID is required for update' };
  }

  try {
    const supabase = createAdminClient();
    const { error: authError } = await supabase.auth.admin.updateUserById(data.id, {
      ...(data.password && { password: data.password }),
      user_metadata: {
        username: data.username,
        firstName: data.name,
        lastName: data.surname,
        role: "parent"
      }
    });

    if (authError) {
      logError('Supabase Auth update error:', authError);
      return { success: false, error: true, message: authError.message };
    }

    const currentParent = await prisma.parent.findUnique({
      where: { id: data.id },
      include: { students: true },
    });

    if (!currentParent) {
      return { success: false, error: true, message: 'Parent not found' };
    }

    const currentStudentIds = currentParent.students.map(s => s.id);
    const newStudentIds = data.studentIds || [];
    const studentsToConnect = newStudentIds.filter(id => !currentStudentIds.includes(id));
    const studentsToDisconnect = currentStudentIds.filter(id => !newStudentIds.includes(id));

    await prisma.parent.update({
      where: { id: data.id },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email,
        phone: data.phone ?? undefined,
        address: data.address,
        students: {
          connect: studentsToConnect.map(id => ({ id })),
          disconnect: studentsToDisconnect.map(id => ({ id })),
        },
      },
    });

    revalidatePath("/list/parents");
    return { success: true, error: false, message: "" };
  } catch (err: any) {
    logError('Error updating parent:', err);
    return { success: false, error: true, message: err.message || 'Failed to update parent' };
  }
};

export const createAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  try {
    await prisma.assignment.create({
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/list/assignments");
    return { success: true, error: false, message: "Assignment created successfully" };
  } catch (err) {
    logError('Error creating assignment:', err);
    return { success: false, error: true, message: 'Failed to create assignment' };
  }
};

export const updateAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  try {
    if (!data.id) return { success: false, error: true, message: "ID is required" };
    await prisma.assignment.update({
      where: { id: data.id },
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/list/assignments");
    return { success: true, error: false, message: "Assignment updated successfully" };
  } catch (err) {
    logError('Error updating assignment:', err);
    return { success: false, error: true, message: 'Failed to update assignment' };
  }
};

export const deleteAssignment = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.assignment.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/assignments");
    return { success: true, error: false, message: 'Success' };
  } catch (err) {
    logError('Error deleting assignment:', err);
    return { success: false, error: true, message: 'Failed to delete assignment' };
  }
};

export const createResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  try {
    const { studentId, score, examId, assignmentId } = data;

    await prisma.result.create({
      data: {
        studentId,
        score: typeof score === 'string' ? parseInt(score) : score,
        examId: examId ? (typeof examId === 'string' ? parseInt(examId) : examId) : null,
        assignmentId: assignmentId ? (typeof assignmentId === 'string' ? parseInt(assignmentId) : assignmentId) : null,
      },
    });

    revalidatePath("/list/results");
    return { success: true, error: false, message: 'Success' };
  } catch (err) {
    logError('Error creating result:', err);
    return { success: false, error: true, message: 'Failed to create result' };
  }
};

export const updateResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  try {
    const { id, studentId, score, examId, assignmentId } = data;

    await prisma.result.update({
      where: { id: id as number },
      data: {
        studentId,
        score: typeof score === 'string' ? parseInt(score) : score,
        examId: examId ? (typeof examId === 'string' ? parseInt(examId) : examId) : null,
        assignmentId: assignmentId ? (typeof assignmentId === 'string' ? parseInt(assignmentId) : assignmentId) : null,
      },
    });

    revalidatePath("/list/results");
    return { success: true, error: false, message: 'Success' };
  } catch (err) {
    logError('Error updating result:', err);
    return { success: false, error: true, message: 'Failed to update result' };
  }
};

export const deleteResult = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.result.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/results");
    return { success: true, error: false, message: 'Success' };
  } catch (err) {
    logError('Error deleting result:', err);
    return { success: false, error: true, message: 'Failed to delete result' };
  }
};

export const createAttendance = async (
  currentState: CurrentState,
  data: AttendanceSchema
) => {
  try {
    const { studentId, lessonId, date, present } = data;

    await prisma.attendance.create({
      data: {
        studentId,
        lessonId: lessonId as number,
        date: new Date(date),
        present: Boolean(present),
      },
    });

    revalidatePath("/list/attendance");
    revalidatePath("/"); // Refresh dashboard
    return { success: true, error: false, message: 'Success' };
  } catch (err) {
    logError('Error creating attendance:', err);
    return { success: false, error: true, message: 'Failed to create attendance record' };
  }
};

export const updateAttendance = async (
  currentState: CurrentState,
  data: AttendanceSchema
) => {
  try {
    const { id, studentId, lessonId, date, present } = data;

    await prisma.attendance.update({
      where: { id: id as number },
      data: {
        studentId,
        lessonId: lessonId as number,
        date: new Date(date),
        present: Boolean(present),
      },
    });

    revalidatePath("/list/attendance");
    revalidatePath("/"); // Refresh dashboard
    return { success: true, error: false, message: 'Success' };
  } catch (err) {
    logError('Error updating attendance:', err);
    return { success: false, error: true, message: 'Failed to update attendance record' };
  }
};

export const deleteAttendance = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.attendance.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/attendance");
    revalidatePath("/"); // Refresh dashboard
    return { success: true, error: false, message: 'Success' };
  } catch (err) {
    logError('Error deleting attendance:', err);
    return { success: false, error: true, message: 'Failed to delete attendance record' };
  }
};

export const createEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    const { title, description, startTime, endTime, classId } = data;

    // Validation
    if (!title || !startTime || !endTime) {
      return { success: false, error: true, message: 'Title, start time, and end time are required' };
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return { success: false, error: true, message: 'End time must be after start time' };
    }

    await prisma.event.create({
      data: {
        title: title!,
        description: description || "",
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        classId: classId ? (typeof classId === 'string' ? parseInt(classId) : classId as number) : null,
      },
    });

    revalidatePath("/list/events");
    revalidatePath("/"); // Refresh dashboard
    return { success: true, error: false, message: 'Success' };
  } catch (err) {
    logError('Error creating event:', err);
    return { success: false, error: true, message: 'Failed to create event' };
  }
};

export const updateEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    const { id, title, description, startTime, endTime, classId } = data;

    // Validation
    if (!title || !startTime || !endTime) {
      return { success: false, error: true, message: 'Title, start time, and end time are required' };
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return { success: false, error: true, message: 'End time must be after start time' };
    }

    await prisma.event.update({
      where: { id: id as number },
      data: {
        title: title!,
        description: description || "",
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        classId: classId ? (typeof classId === 'string' ? parseInt(classId) : classId as number) : null,
      },
    });

    revalidatePath("/list/events");
    revalidatePath("/"); // Refresh dashboard
    return { success: true, error: false, message: 'Success' };
  } catch (err) {
    logError('Error updating event:', err);
    return { success: false, error: true, message: 'Failed to update event' };
  }
};

export const deleteEvent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.event.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/events");
    revalidatePath("/"); // Refresh dashboard
    return { success: true, error: false, message: 'Success' };
  } catch (err) {
    logError('Error deleting event:', err);
    return { success: false, error: true, message: 'Failed to delete event' };
  }
};

export const deleteAnnouncement = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.announcement.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/announcements");
    revalidatePath("/"); // Refresh dashboard
    return { success: true, error: false, message: 'Success' };
  } catch (err) {
    logError('Error deleting announcement:', err);
    return { success: false, error: true, message: 'Failed to delete announcement' };
  }
};

export const createAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    const { title, description, date, classId } = data;

    await prisma.announcement.create({
      data: {
        title: title!,
        description: description || "",
        date: new Date(date),
        classId: classId ? (typeof classId === 'string' ? parseInt(classId) : classId as number) : null,
      },
    });

    revalidatePath("/list/announcements");
    revalidatePath("/");
    return { success: true, error: false, message: 'Success' };
  } catch (err) {
    logError('Error creating announcement:', err);
    return { success: false, error: true, message: 'Failed to create announcement' };
  }
};

export const updateAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    const { id, title, description, date, classId } = data;

    await prisma.announcement.update({
      where: { id: id as number },
      data: {
        title: title!,
        description: description || "",
        date: new Date(date),
        classId: classId ? (typeof classId === 'string' ? parseInt(classId) : classId as number) : null,
      },
    });

    revalidatePath("/list/announcements");
    revalidatePath("/");
    return { success: true, error: false, message: 'Success' };
  } catch (err) {
    logError('Error updating announcement:', err);
    return { success: false, error: true, message: 'Failed to update announcement' };
  }
};

// Message Actions
export const createMessage = async (
  currentState: CurrentState,
  data: MessageSchema
) => {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    const role = user?.user_metadata?.role as string;
    
    if (!userId) {
      return { success: false, error: true, message: 'Authentication required' };
    }

    const { title, content, category, priority, recipientId, recipientRole, parentId, isBroadcast } = data;

    if (!title || !content) {
      return { success: false, error: true, message: 'Title and content are required' };
    }

    // Role-based validation
    if (role === "student" && recipientRole !== "teacher") {
      return { success: false, error: true, message: 'Students can only message teachers' };
    }

    if (role === "parent" && recipientRole !== "teacher") {
      return { success: false, error: true, message: 'Parents can only message teachers' };
    }

    if (role === "teacher" && recipientRole === "admin") {
      return { success: false, error: true, message: 'Teachers cannot message admin' };
    }

    if (role === "student" && recipientRole === "admin") {
      return { success: false, error: true, message: 'Students cannot message admin' };
    }

    if (role === "parent" && recipientRole === "admin") {
      return { success: false, error: true, message: 'Parents cannot message admin' };
    }

    const messageData: any = {
      title,
      content,
      category: category || "GENERAL",
      priority: priority || "NORMAL",
      senderId: userId,
      senderRole: role.toUpperCase(),
      isBroadcast,
    };

    if (parentId && String(parentId).trim() !== "") {
      messageData.parentId = typeof parentId === 'string' ? parseInt(parentId) : parentId as number;
    }

    if (!isBroadcast) {
      if (recipientId && recipientId.trim() !== "") {
        messageData.recipientId = recipientId;
      }
      if (recipientRole && recipientRole.trim() !== "") {
        messageData.recipientRole = recipientRole.toUpperCase();
      }
    }

    const newMessage = await prisma.message.create({
      data: messageData,
    });

    revalidatePath("/list/messages");
    revalidatePath("/");
    return { success: true, error: false, message: 'Success', id: newMessage.id };
  } catch (err) {
    logError('Error creating message:', err);
    return { success: false, error: true, message: 'Failed to create message' };
  }
};

export const updateMessage = async (
  currentState: CurrentState,
  data: FormData
) => {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    const role = user?.user_metadata?.role as string;
    
    if (!userId) {
      return { success: false, error: true, message: 'Authentication required' };
    }

    const id = parseInt(data.get("id") as string);
    const title = data.get("title") as string;
    const content = data.get("content") as string;
    const category = data.get("category") as string;
    const priority = data.get("priority") as string;

    if (!title || !content) {
      return { success: false, error: true, message: 'Title and content are required' };
    }

    // Check if user owns the message or is admin
    const existingMessage = await prisma.message.findUnique({
      where: { id },
    });

    if (!existingMessage) {
      return { success: false, error: true, message: 'Message not found' };
    }

    if (existingMessage.senderId !== userId && role !== "admin") {
      return { success: false, error: true, message: 'You can only edit your own messages' };
    }

    const messageData: any = {
      title,
      content,
      category: category || "GENERAL",
      priority: priority || "NORMAL",
    };

    await prisma.message.update({
      where: { id },
      data: messageData,
    });

    revalidatePath("/list/messages");
    revalidatePath("/");
    return { success: true, error: false, message: 'Success' };
  } catch (err) {
    logError('Error updating message:', err);
    return { success: false, error: true, message: 'Failed to update message' };
  }
};

export const deleteMessage = async (
  currentState: CurrentState,
  data: FormData
) => {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    const role = user?.user_metadata?.role as string;
    
    if (!userId) {
      return { success: false, error: true, message: 'Authentication required' };
    }

    const id = parseInt(data.get("id") as string);

    // Check if user owns the message or is admin
    const existingMessage = await prisma.message.findUnique({
      where: { id },
    });

    if (!existingMessage) {
      return { success: false, error: true, message: 'Message not found' };
    }

    if (existingMessage.senderId !== userId && role !== "admin") {
      return { success: false, error: true, message: 'You can only delete your own messages' };
    }

    await prisma.message.delete({
      where: { id },
    });

    revalidatePath("/list/messages");
    revalidatePath("/");
    return { success: true, error: false, message: 'Success' };
  } catch (err) {
    logError('Error deleting message:', err);
    return { success: false, error: true, message: 'Failed to delete message' };
  }
};

export const markMessageAsRead = async (
  currentState: CurrentState,
  data: FormData
) => {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    if (!userId) {
      return { success: false, error: true, message: 'Authentication required' };
    }

    const messageId = parseInt(data.get("messageId") as string);

    await prisma.messageRead.upsert({
      where: { 
        userId_messageId: { 
          userId, 
          messageId 
        } 
      },
      update: { readAt: new Date() },
      create: { 
        userId, 
        messageId, 
        readAt: new Date() 
      },
    });

    revalidatePath("/list/messages");
    revalidatePath("/");
    return { success: true, error: false, message: 'Success' };
  } catch (err) {
    logError('Error marking message as read:', err);
    return { success: false, error: true, message: 'Failed to mark message as read' };
  }
};

// ============================================================
// Bulk Delete Actions
// ============================================================

export const bulkDeleteTeachers = async (ids: (string | number)[]): Promise<{ success: boolean; error: boolean; message?: string }> => {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.user_metadata?.role as string;
    if (role !== "admin") return { success: false, error: true, message: "Only admins can bulk delete" };

    await prisma.teacher.deleteMany({ where: { id: { in: ids.map(String) } } });
    revalidatePath("/list/teachers");
    return { success: true, error: false, message: `Deleted ${ids.length} teacher(s)` };
  } catch (err) {
    logError("Bulk delete teachers error:", err);
    return { success: false, error: true, message: "Failed to delete teachers" };
  }
};

export const bulkDeleteStudents = async (ids: (string | number)[]): Promise<{ success: boolean; error: boolean; message?: string }> => {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.user_metadata?.role as string;
    if (role !== "admin") return { success: false, error: true, message: "Only admins can bulk delete" };

    await prisma.student.deleteMany({ where: { id: { in: ids.map(String) } } });
    revalidatePath("/list/students");
    return { success: true, error: false, message: `Deleted ${ids.length} student(s)` };
  } catch (err) {
    logError("Bulk delete students error:", err);
    return { success: false, error: true, message: "Failed to delete students" };
  }
};

export const bulkDeleteSubjects = async (ids: (string | number)[]): Promise<{ success: boolean; error: boolean; message?: string }> => {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.user_metadata?.role as string;
    if (role !== "admin") return { success: false, error: true, message: "Only admins can bulk delete" };

    await prisma.subject.deleteMany({ where: { id: { in: ids.map(Number) } } });
    revalidatePath("/list/subjects");
    return { success: true, error: false, message: `Deleted ${ids.length} subject(s)` };
  } catch (err) {
    logError("Bulk delete subjects error:", err);
    return { success: false, error: true, message: "Failed to delete subjects" };
  }
};

export const bulkDeleteAnnouncements = async (ids: (string | number)[]): Promise<{ success: boolean; error: boolean; message?: string }> => {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.user_metadata?.role as string;
    if (role !== "admin") return { success: false, error: true, message: "Only admins can bulk delete" };

    await prisma.announcement.deleteMany({ where: { id: { in: ids.map(Number) } } });
    revalidatePath("/list/announcements");
    return { success: true, error: false, message: `Deleted ${ids.length} announcement(s)` };
  } catch (err) {
    logError("Bulk delete announcements error:", err);
    return { success: false, error: true, message: "Failed to delete announcements" };
  }
};

export const bulkDeleteEvents = async (ids: (string | number)[]): Promise<{ success: boolean; error: boolean; message?: string }> => {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.user_metadata?.role as string;
    if (role !== "admin") return { success: false, error: true, message: "Only admins can bulk delete" };

    await prisma.event.deleteMany({ where: { id: { in: ids.map(Number) } } });
    revalidatePath("/list/events");
    return { success: true, error: false, message: `Deleted ${ids.length} event(s)` };
  } catch (err) {
    logError("Bulk delete events error:", err);
    return { success: false, error: true, message: "Failed to delete events" };
  }
};
