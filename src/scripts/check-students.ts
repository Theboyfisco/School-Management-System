import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function checkStudents() {
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('Database connection successful');
    
    // Check if the Student table exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE  table_schema = 'public'
        AND    table_name   = 'Student'
      );
    `;
    
    console.log('Student table exists:', tableExists);
    
    // Count total students
    const studentCount = await prisma.student.count();
    console.log(`Total students in database: ${studentCount}`);
    
    if (studentCount > 0) {
      // Get first 5 students
      const sampleStudents = await prisma.student.findMany({
        take: 5,
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
      });
      
      console.log('Sample students:');
      console.table(sampleStudents);
    }
    
  } catch (error) {
    console.error('Error checking students:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
    console.log('Disconnected from database');
  }
}

checkStudents()
  .catch((e) => {
    console.error('Script error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
