import prisma from './src/lib/prisma';

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to the database');
    
    // Try to count students
    const studentCount = await prisma.student.count();
    console.log(`Number of students: ${studentCount}`);
    
    // List all tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;
    console.log('Tables in database:', tables);
    
  } catch (error) {
    console.error('Error connecting to the database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection().catch(console.error);
