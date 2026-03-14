import prisma from '../src/lib/prisma';

async function main() {
  try {
    console.log('Testing connection to Database...');
    const result = await prisma.message.findMany({ take: 1 });
    console.log('Success!', result);
  } catch (error) {
    console.error('Prisma Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
