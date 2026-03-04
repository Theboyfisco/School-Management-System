import prisma from './prisma';

export type StudentWithClass = {
  id: string;
  name: string;
  surname: string;
  email?: string | null;
  fullName: string;
  class?: {
    name: string;
  };
};

export async function getAllStudents(): Promise<StudentWithClass[]> {
  try {
    const students = await prisma.student.findMany({
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        class: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { name: 'asc' },
        { surname: 'asc' },
      ],
    });

    return students.map(student => ({
      ...student,
      fullName: `${student.name} ${student.surname} (${student.class?.name || 'No Class'})`
    }));
  } catch (error) {
    console.error('Error in getAllStudents:', error);
    throw error;
  }
}
