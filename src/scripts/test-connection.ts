import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Environment Variables:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '***' : 'Not set');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  try {
    console.log('\nTesting database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Successfully connected to the database');
    
    // Get database version
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('Database version:', result);
    
    // List all tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('\nTables in database:', tables);
    
    // Check if Student table exists and has data
    try {
      const studentCount = await prisma.student.count();
      console.log(`\nNumber of students: ${studentCount}`);
      
      if (studentCount > 0) {
        const sampleStudent = await prisma.student.findFirst({
          include: { class: true }
        });
        console.log('Sample student:', {
          id: sampleStudent?.id,
          name: sampleStudent?.name,
          surname: sampleStudent?.surname,
          class: sampleStudent?.class
        });
      }
    } catch (error) {
      console.error('Error querying students table:', error);
    }
    
  } catch (error) {
    console.error('❌ Error connecting to the database:');
    console.error(error);
    
    if (error instanceof Error) {
      console.error('\nError details:', {
        name: error.name,
        message: error.message,
      });
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
