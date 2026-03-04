const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

// Define enums as string literal types
type Day = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';
type UserSex = 'MALE' | 'FEMALE';

async function cleanup() {
  try {
    console.log('Cleaning existing data...');
    const tablenames = await db.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
    `;

    for (const { tablename } of tablenames) {
      if (tablename !== '_prisma_migrations') {
        try {
          await db.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
          console.log(`Cleared table: ${tablename}`);
        } catch (error) {
          console.error(`Error clearing table ${tablename}:`, error);
          throw error;
        }
      }
    }
    console.log('Database cleanup completed');
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  }
}

async function main() {
  try {
    // Test database connection
    await db.$connect();
    console.log('Successfully connected to the database');

    // Clean up existing data
    await cleanup();

    // Initialize arrays to store IDs - CORRECTED TO NUMBER[]
    let gradeIds: number[] = [];
    let classIds: number[] = [];
    let lessonIds: number[] = [];
    let subjectIds: number[] = [];

    // ADMIN
    console.log('Seeding admins...');
    await db.admin.create({
      data: {
        id: "admin1",
        username: "admin1",
      },
    });
    await db.admin.create({
      data: {
        id: "admin2",
        username: "admin2",
      },
    });

    // GRADE
    console.log('Seeding grades...');
    gradeIds = [];
    for (let i = 1; i <= 6; i++) {
      const grade = await db.grade.create({
        data: {
          level: i,
        },
      });
      gradeIds.push(grade.id);
    }

    // SUBJECT
    console.log('Seeding subjects...');
    const subjectData = [
      { name: "Mathematics" },
      { name: "Science" },
      { name: "English" },
      { name: "History" },
      { name: "Geography" },
      { name: "Physics" },
      { name: "Chemistry" },
      { name: "Biology" },
      { name: "Computer Science" },
      { name: "Art" },
    ];

    subjectIds = [];
    for (const subject of subjectData) {
      const createdSubject = await db.subject.create({ data: subject });
      subjectIds.push(createdSubject.id);
    }

    // CLASS
    console.log('Seeding classes...');
    classIds = [];
    for (let i = 0; i < 6; i++) {
      const createdClass = await db.class.create({
        data: {
          name: `${i + 1}A`,
          gradeId: gradeIds[i],
          capacity: Math.floor(Math.random() * (20 - 15 + 1)) + 15,
        },
      });
      classIds.push(createdClass.id);
    }

    // TEACHER
    console.log('Seeding teachers...');
    for (let i = 1; i <= 15; i++) {
      await db.teacher.create({
        data: {
          id: `teacher${i}`,
          username: `teacher${i}`,
          name: `TName${i}`,
          surname: `TSurname${i}`,
          email: `teacher${i}@example.com`,
          phone: `123-456-789${i}`,
          address: `Address${i}`,
          bloodType: "A+",
          sex: i % 2 === 0 ? 'MALE' : 'FEMALE' as const,
          subjects: {
            connect: [{ id: subjectIds[i % subjectIds.length] }]
          },
          classes: {
            connect: [{ id: classIds[i % classIds.length] }]
          },
          birthday: new Date(new Date().setFullYear(new Date().getFullYear() - 30)),
        },
      });
    }

    // LESSON
    console.log('Seeding lessons...');
    lessonIds = [];
    for (let i = 1; i <= 30; i++) {
      const lesson = await db.lesson.create({
        data: {
          name: `Lesson${i}`,
          day: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'][
            Math.floor(Math.random() * 5)
          ] as Day,
          startTime: new Date(new Date().setHours(new Date().getHours() + 1)),
          endTime: new Date(new Date().setHours(new Date().getHours() + 3)),
          subjectId: subjectIds[i % subjectIds.length],
          classId: classIds[i % classIds.length],
          teacherId: `teacher${(i % 15) + 1}`,
        },
      });
      lessonIds.push(lesson.id);
    }

    // PARENT
    console.log('Seeding parents...');
    for (let i = 1; i <= 25; i++) {
      await db.parent.create({
        data: {
          id: `parentId${i}`,
          username: `parentId${i}`,
          name: `PName ${i}`,
          surname: `PSurname ${i}`,
          email: `parent${i}@example.com`,
          phone: `123-456-789${i}`,
          address: `Address${i}`,
        },
      });
    }

    // STUDENT
    console.log('Seeding students...');
    const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson'];
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const;

    // Ensure we have grades and classes before creating students
    if (gradeIds.length === 0 || classIds.length === 0) {
      console.error('Cannot create students: No grades or classes exist');
      return;
    }

    for (let i = 1; i <= 50; i++) {
      try {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const parentIndex = ((i - 1) % 25) + 1; // Ensure parent index is between 1-25
        const gradeIndex = i % gradeIds.length;
        const classIndex = i % classIds.length;

        await db.student.create({
          data: {
            id: `student${i}`,
            username: `student${i}`,
            name: firstName,
            surname: lastName,
            email: `student${i}@example.com`,
            phone: `987-654-${String(i).padStart(4, '0')}`,
            address: `${i} Student Street, City`,
            bloodType: bloodTypes[Math.floor(Math.random() * bloodTypes.length)],
            sex: i % 2 === 0 ? 'MALE' : 'FEMALE' as const,
            parentId: `parentId${parentIndex}`,
            gradeId: gradeIds[gradeIndex],
            classId: classIds[classIndex],
            birthday: new Date(new Date().setFullYear(new Date().getFullYear() - (10 + Math.floor(Math.random() * 5)))),
            img: null,
            createdAt: new Date(),
          },
        });
        console.log(`Created student ${i}`);
      } catch (error) {
        console.error(`Error creating student ${i}:`, error);
      }
    }

    // EXAM
    console.log('Seeding exams...');
    const examIds = [];
    for (let i = 1; i <= 10; i++) {
      const exam = await db.exam.create({
        data: {
          title: `Exam ${i}`,
          startTime: new Date(new Date().setHours(new Date().getHours() + 1)),
          endTime: new Date(new Date().setHours(new Date().getHours() + 2)),
          lessonId: lessonIds[i % lessonIds.length],
        },
      });
      examIds.push(exam.id);
    }

    // ASSIGNMENT
    console.log('Seeding assignments...');
    const assignmentIds = [];
    for (let i = 1; i <= 10; i++) {
      const assignment = await db.assignment.create({
        data: {
          title: `Assignment ${i}`,
          startDate: new Date(new Date().setHours(new Date().getHours() + 1)),
          dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
          lessonId: lessonIds[i % lessonIds.length],
        },
      });
      assignmentIds.push(assignment.id);
    }

    // RESULT
    console.log('Seeding results...');
    for (let i = 1; i <= 10; i++) {
      try {
        const resultData: any = {
          score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
          studentId: `student${i}`,
        };

        if (i <= 5 && examIds[i - 1]) {
          resultData.examId = examIds[i - 1];
        } else if (assignmentIds[i - 6]) {
          resultData.assignmentId = assignmentIds[i - 6];
        } else {
          console.warn(`Skipping result ${i} - no exam or assignment available`);
          continue;
        }

        await db.result.create({
          data: resultData,
        });
        console.log(`Created result for student ${i}`);
      } catch (error) {
        console.error(`Error creating result ${i}:`, error);
      }
    }

    // ATTENDANCE
    console.log('Seeding attendance...');
    for (let i = 1; i <= 10; i++) {
      await db.attendance.create({
        data: {
          date: new Date(),
          present: true,
          studentId: `student${i}`,
          lessonId: lessonIds[i % lessonIds.length],
        },
      });
    }

    // EVENT
    console.log('Seeding events...');
    for (let i = 1; i <= 5; i++) {
      await db.event.create({
        data: {
          title: `Event ${i}`,
          description: `Description for Event ${i}`,
          startTime: new Date(new Date().setHours(new Date().getHours() + 1)),
          endTime: new Date(new Date().setHours(new Date().getHours() + 2)),
          classId: classIds[i % classIds.length],
        },
      });
    }

    // ANNOUNCEMENT
    console.log('Seeding announcements...');
    for (let i = 1; i <= 5; i++) {
      await db.announcement.create({
        data: {
          title: `Announcement ${i}`,
          description: `Description for Announcement ${i}`,
          date: new Date("2025-05-28"),
          classId: classIds[i % classIds.length],
        }
      });
    }

  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

main();
