import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function checkDatabase() {
  try {
    console.log('Checking database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Successfully connected to the database');
    
    // Check if database is empty
    const tableCount = await prisma.$queryRaw`
      SELECT count(*) 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;
    
    console.log('Tables in database:', tableCount);
    
    // Check if we have any students
    const studentCount = await prisma.student.count();
    console.log(`Number of students: ${studentCount}`);
    
    if (studentCount === 0) {
      console.log('No students found. You may need to run the seed script.');
      console.log('Run: npm run seed');
    }
    
  } catch (error) {
    console.error('❌ Error connecting to the database:');
    console.error(error);
    
    if (error instanceof Error) {
      console.error('\nError details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    
    console.log('\nMake sure:');
    console.log('1. Database connection URL is correct in .env.local');
    console.log('2. The database has been seeded (run: npm run seed)');
    
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
