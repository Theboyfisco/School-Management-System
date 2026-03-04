import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    const role = user?.user_metadata?.role as string;
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type'); // Optional: filter by type

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const searchTerm = query.trim();
    const results: any[] = [];

    // Role-based search permissions
    const canSearchAll = role === "admin";
    const canSearchTeachers = role === "admin" || role === "teacher";
    const canSearchStudents = role === "admin" || role === "teacher" || role === "parent";
    const canSearchParents = role === "admin" || role === "teacher";

    // Search Teachers
    if (canSearchTeachers && (!type || type === 'teacher')) {
      const teachers = await prisma.teacher.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { surname: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { phone: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          surname: true,
          email: true,
          phone: true,
          subjects: { select: { name: true } },
        },
        take: 5,
      });

      results.push(...teachers.map(teacher => ({
        ...teacher,
        type: 'teacher',
        displayName: `${teacher.name} ${teacher.surname}`,
        subtitle: teacher.subjects.map(s => s.name).join(', '),
        url: `/list/teachers/${teacher.id}`,
      })));
    }

    // Search Students
    if (canSearchStudents && (!type || type === 'student')) {
      let studentQuery: any = {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { surname: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { phone: { contains: searchTerm, mode: 'insensitive' } },
        ],
      };

      // Role-based filtering
      if (role === "teacher") {
        const teacherClasses = await prisma.class.findMany({
          where: {
            lessons: {
              some: { teacherId: userId }
            }
          },
          select: { id: true }
        });
        studentQuery.classId = { in: teacherClasses.map(c => c.id) };
      } else if (role === "parent") {
        studentQuery.parentId = userId;
      }

      const students = await prisma.student.findMany({
        where: studentQuery,
        select: {
          id: true,
          name: true,
          surname: true,
          email: true,
          phone: true,
          class: { select: { name: true } },
        },
        take: 5,
      });

      results.push(...students.map(student => ({
        ...student,
        type: 'student',
        displayName: `${student.name} ${student.surname}`,
        subtitle: student.class?.name || 'No class assigned',
        url: `/list/students/${student.id}`,
      })));
    }

    // Search Parents
    if (canSearchParents && (!type || type === 'parent')) {
      const parents = await prisma.parent.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { surname: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { phone: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          surname: true,
          email: true,
          phone: true,
          students: { select: { name: true, surname: true } },
        },
        take: 5,
      });

      results.push(...parents.map(parent => ({
        ...parent,
        type: 'parent',
        displayName: `${parent.name} ${parent.surname}`,
        subtitle: `${parent.students.length} child${parent.students.length !== 1 ? 'ren' : ''}`,
        url: `/list/parents/${parent.id}`,
      })));
    }

    // Search Classes
    if (canSearchAll && (!type || type === 'class')) {
      const classes = await prisma.class.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            // Search by grade level - convert to string for comparison
            { grade: { level: parseInt(searchTerm) || undefined } },
          ],
        },
        select: {
          id: true,
          name: true,
          grade: { select: { level: true } },
          students: { select: { id: true } },
          lessons: { select: { subject: { select: { name: true } } } },
        },
        take: 5,
      });

      results.push(...classes.map(cls => ({
        ...cls,
        type: 'class',
        displayName: cls.name,
        subtitle: `${cls.students.length} students • Grade ${cls.grade.level}`,
        url: `/list/classes/${cls.id}`,
      })));
    }

    // Search Subjects
    if (canSearchAll && (!type || type === 'subject')) {
      const subjects = await prisma.subject.findMany({
        where: {
          name: { contains: searchTerm, mode: 'insensitive' },
        },
        select: {
          id: true,
          name: true,
          teachers: { select: { name: true, surname: true } },
        },
        take: 5,
      });

      results.push(...subjects.map(subject => ({
        ...subject,
        type: 'subject',
        displayName: subject.name,
        subtitle: subject.teachers.map(t => `${t.name} ${t.surname}`).join(', '),
        url: `/list/subjects/${subject.id}`,
      })));
    }

    // Search Events
    if (!type || type === 'event') {
      let eventQuery: any = {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      };

      // Role-based event filtering
      if (role === "teacher") {
        const teacherClasses = await prisma.class.findMany({
          where: {
            lessons: {
              some: { teacherId: userId }
            }
          },
          select: { id: true }
        });
        eventQuery.OR.push({ classId: { in: teacherClasses.map(c => c.id) } });
      } else if (role === "student") {
        const studentClass = await prisma.student.findUnique({
          where: { id: userId },
          select: { classId: true }
        });
        if (studentClass?.classId) {
          eventQuery.OR.push({ classId: studentClass.classId });
        }
      } else if (role === "parent") {
        const children = await prisma.student.findMany({
          where: { parentId: userId },
          select: { classId: true }
        });
        const childClassIds = children.map(c => c.classId).filter(Boolean);
        if (childClassIds.length > 0) {
          eventQuery.OR.push({ classId: { in: childClassIds } });
        }
      }

      const events = await prisma.event.findMany({
        where: eventQuery,
        select: {
          id: true,
          title: true,
          description: true,
          startTime: true,
          endTime: true,
          class: { select: { name: true } },
        },
        take: 5,
      });

      results.push(...events.map(event => ({
        ...event,
        type: 'event',
        displayName: event.title,
        subtitle: `${new Date(event.startTime).toLocaleDateString()} • ${event.class?.name || 'School-wide'}`,
        url: `/list/events/${event.id}`,
      })));
    }

    // Search Announcements
    if (!type || type === 'announcement') {
      const announcements = await prisma.announcement.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          description: true,
          date: true,
          class: { select: { name: true } },
        },
        take: 5,
      });

      results.push(...announcements.map(announcement => ({
        ...announcement,
        type: 'announcement',
        displayName: announcement.title,
        subtitle: `${new Date(announcement.date).toLocaleDateString()} • ${announcement.class?.name || 'School-wide'}`,
        url: `/list/announcements/${announcement.id}`,
      })));
    }

    // Search Messages
    if (!type || type === 'message') {
      let messageQuery: any = {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { content: { contains: searchTerm, mode: 'insensitive' } },
        ],
      };

      // Role-based message filtering
      if (role !== "admin") {
        messageQuery.OR.push(
          { senderId: userId },
          { recipientId: userId },
          { 
            AND: [
              { isBroadcast: true },
              { recipientRole: role.toUpperCase() }
            ]
          }
        );
      }

      const messages = await prisma.message.findMany({
        where: messageQuery,
        select: {
          id: true,
          title: true,
          content: true,
          date: true,
          senderRole: true,
          category: true,
        },
        take: 5,
      });

      results.push(...messages.map(message => ({
        ...message,
        type: 'message',
        displayName: message.title,
        subtitle: `${new Date(message.date).toLocaleDateString()} • ${message.senderRole} • ${message.category}`,
        url: `/list/messages/${message.id}`,
      })));
    }

    // Sort results by relevance (exact matches first, then partial matches)
    results.sort((a, b) => {
      const aExact = a.displayName.toLowerCase().includes(searchTerm.toLowerCase());
      const bExact = b.displayName.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    return NextResponse.json({ results: results.slice(0, 10) });
  } catch (err) {
    console.error('Search error:', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
} 