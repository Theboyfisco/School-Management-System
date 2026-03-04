/**
 * Seed Supabase Auth Users
 * 
 * This script creates test users in Supabase Auth for each role.
 * Run with: npx ts-node scripts/seed-auth-users.ts
 * 
 * After running, you can log in with:
 *   Admin:   admin@academia.connect   / Admin123!
 *   Teacher: teacher@academia.connect / Teacher123!
 *   Student: student@academia.connect / Student123!
 *   Parent:  parent@academia.connect  / Parent123!
 */

import * as dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const prisma = new PrismaClient();

interface TestUser {
  email: string;
  password: string;
  role: string;
  username: string;
  firstName: string;
  lastName: string;
}

const testUsers: TestUser[] = [
  {
    email: 'admin@academia.connect',
    password: 'Admin123!',
    role: 'admin',
    username: 'admin1',
    firstName: 'Admin',
    lastName: 'User',
  },
  {
    email: 'teacher@academia.connect',
    password: 'Teacher123!',
    role: 'teacher',
    username: 'teacher1',
    firstName: 'TName1',
    lastName: 'TSurname1',
  },
  {
    email: 'student@academia.connect',
    password: 'Student123!',
    role: 'student',
    username: 'student1',
    firstName: 'James',
    lastName: 'Smith',
  },
  {
    email: 'parent@academia.connect',
    password: 'Parent123!',
    role: 'parent',
    username: 'parentId1',
    firstName: 'PName 1',
    lastName: 'PSurname 1',
  },
];

async function seedAuthUsers() {
  console.log('🔐 Seeding Supabase Auth Users...\n');

  for (const user of testUsers) {
    console.log(`Creating ${user.role}: ${user.email}`);

    // Check if user already exists by email
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users?.find(u => u.email === user.email);

    if (existing) {
      console.log(`  ⚠️  Already exists (id: ${existing.id}). Updating metadata...`);
      await supabase.auth.admin.updateUserById(existing.id, {
        user_metadata: {
          role: user.role,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
        }
      });

      // Update the corresponding Prisma record to use this auth ID
      await updatePrismaRecord(user, existing.id);
      console.log(`  ✅ Updated.\n`);
      continue;
    }

    // Create new auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      user_metadata: {
        role: user.role,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      email_confirm: true,
    });

    if (authError) {
      console.error(`  ❌ Error: ${authError.message}\n`);
      continue;
    }

    if (authData.user) {
      console.log(`  ✅ Created (id: ${authData.user.id})`);
      // Update the corresponding Prisma record
      await updatePrismaRecord(user, authData.user.id);
      console.log(`  ✅ Prisma record linked.\n`);
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Done! You can now log in with:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  for (const user of testUsers) {
    console.log(`  ${user.role.toUpperCase().padEnd(8)} ${user.email.padEnd(30)} ${user.password}`);
  }
  console.log('');
}

async function updatePrismaRecord(user: TestUser, authId: string) {
  try {
    switch (user.role) {
      case 'admin': {
        // Try to find existing admin with old ID
        const existing = await prisma.admin.findUnique({ where: { username: user.username } });
        if (existing && existing.id !== authId) {
          // Delete old record and create new one with auth ID
          await prisma.admin.delete({ where: { id: existing.id } }).catch(() => {});
          await prisma.admin.create({
            data: { id: authId, username: user.username }
          }).catch(() => {});
        } else if (!existing) {
          await prisma.admin.create({
            data: { id: authId, username: user.username }
          }).catch(() => {});
        }
        break;
      }
      case 'teacher': {
        const existing = await prisma.teacher.findUnique({ where: { username: user.username } });
        if (existing && existing.id !== authId) {
          // Update the ID to match auth
          try {
            await prisma.$executeRawUnsafe(
              `UPDATE "Teacher" SET id = $1 WHERE id = $2`,
              authId, existing.id
            );
          } catch (e: any) {
            console.log(`  ⚠️  Could not update teacher ID: ${e.message}`);
          }
        }
        break;
      }
      case 'student': {
        const existing = await prisma.student.findUnique({ where: { username: user.username } });
        if (existing && existing.id !== authId) {
          try {
            await prisma.$executeRawUnsafe(
              `UPDATE "Student" SET id = $1 WHERE id = $2`,
              authId, existing.id
            );
          } catch (e: any) {
            console.log(`  ⚠️  Could not update student ID: ${e.message}`);
          }
        }
        break;
      }
      case 'parent': {
        const existing = await prisma.parent.findUnique({ where: { username: user.username } });
        if (existing && existing.id !== authId) {
          try {
            await prisma.$executeRawUnsafe(
              `UPDATE "Parent" SET id = $1 WHERE id = $2`,
              authId, existing.id
            );
          } catch (e: any) {
            console.log(`  ⚠️  Could not update parent ID: ${e.message}`);
          }
        }
        break;
      }
    }
  } catch (err) {
    console.log(`  ⚠️  Prisma update skipped: ${err}`);
  }
}

seedAuthUsers()
  .catch(err => console.error('Fatal error:', err))
  .finally(() => prisma.$disconnect());
