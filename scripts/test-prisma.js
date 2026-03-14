const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Test both with and without sslmode=require
async function testConnection(url, label) {
  console.log(`\nTesting ${label}...`);
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: url
      }
    }
  });

  try {
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    console.log(`✅ ${label} Success:`, result);
  } catch (error) {
    console.error(`❌ ${label} Failed:`, error.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function run() {
  const currentUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;

  await testConnection(currentUrl, 'Current DATABASE_URL');
  
  if (currentUrl && !currentUrl.includes('sslmode')) {
    const sslUrl = currentUrl.includes('?') ? `${currentUrl}&sslmode=require` : `${currentUrl}?sslmode=require`;
    await testConnection(sslUrl, 'DATABASE_URL with sslmode=require');
  }

  await testConnection(directUrl, 'Direct URL (Port 5432)');
}

run();
