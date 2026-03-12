import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { createClient } from "@/utils/supabase/server";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement"
    | "message";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
  relatedData?: any;
  children?: React.ReactNode;
};

const FormContainer = async ({ table, type, data, id, relatedData: passedRelatedData, children }: FormContainerProps) => {
  let relatedData = passedRelatedData || {};

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role as string;
  const currentUserId = user?.id;

  if (type !== "delete" && !passedRelatedData) {
    switch (table) {
      case "subject":
        const subjectTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: subjectTeachers };
        break;
      case "class":
        const classGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const classTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: classTeachers, grades: classGrades };
        break;
      case "teacher":
        const teacherSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        relatedData = { subjects: teacherSubjects };
        break;
      case "student":
        const studentGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const studentClasses = await prisma.class.findMany({
          include: { _count: { select: { students: true } } },
        });
        relatedData = { classes: studentClasses, grades: studentGrades };
        break;
      case "exam":
        const examLessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          select: { id: true, name: true },
        });
        relatedData = { lessons: examLessons };
        break;
      case "lesson":
        const [lessonSubjects, lessonTeachers, lessonClasses] = await prisma.$transaction([
          prisma.subject.findMany(),
          prisma.teacher.findMany(),
          prisma.class.findMany(),
        ]);
        relatedData = { subjects: lessonSubjects, teachers: lessonTeachers, classes: lessonClasses };
        break;
      case "assignment":
        const assignmentLessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          include: {
            subject: true,
            class: true,
            teacher: true,
          },
        });
        relatedData = { lessons: assignmentLessons };
        break;
      case "result":
        const [resultStudents, resultExams, resultAssignments] = await prisma.$transaction([
          prisma.student.findMany({
            select: { id: true, name: true, surname: true },
          }),
          prisma.exam.findMany({
            include: {
              lesson: {
                include: {
                  subject: true,
                  class: true,
                },
              },
            },
          }),
          prisma.assignment.findMany({
            include: {
              lesson: {
                include: {
                  subject: true,
                  class: true,
                },
              },
            },
          }),
        ]);
        relatedData = { students: resultStudents, exams: resultExams, assignments: resultAssignments };
        break;
      case "attendance":
        const [attendanceStudents, attendanceLessons] = await prisma.$transaction([
          prisma.student.findMany({
            include: { class: true },
          }),
          prisma.lesson.findMany({
            include: {
              subject: true,
              class: true,
              teacher: true,
            },
          }),
        ]);
        relatedData = { students: attendanceStudents, lessons: attendanceLessons };
        break;
      case "event":
        const eventClasses = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        relatedData = { classes: eventClasses };
        break;
      case "message":
        const [messageTeachers, messageStudents, messageParents] = await prisma.$transaction([
          prisma.teacher.findMany({
            select: { id: true, name: true, surname: true },
          }),
          prisma.student.findMany({
            select: { id: true, name: true, surname: true },
          }),
          prisma.parent.findMany({
            select: { id: true, name: true, surname: true },
          }),
        ]);
        relatedData = { teachers: messageTeachers, students: messageStudents, parents: messageParents };
        break;
      default:
        break;
    }
  }

  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      >
        {children}
      </FormModal>
    </div>
  );
};

export default FormContainer;
