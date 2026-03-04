import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
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

async function syncUsers() {
  console.log('Starting Supabase Auth Synchronization...');

  // 1. Sync Admins
  const admins = await prisma.admin.findMany();
  console.log(`Syncing ${admins.length} admins...`);
  for (const admin of admins) {
    await syncUser(admin.id, admin.username, 'admin', `${admin.username}@admin.academia.connect`);
  }

  // 2. Sync Teachers
  const teachers = await prisma.teacher.findMany();
  console.log(`Syncing ${teachers.length} teachers...`);
  for (const teacher of teachers) {
    await syncUser(
      teacher.id, 
      teacher.username, 
      'teacher', 
      teacher.email || `${teacher.username}@teacher.academia.connect`,
      teacher.name,
      teacher.surname
    );
  }

  // 3. Sync Students
  const students = await prisma.student.findMany();
  console.log(`Syncing ${students.length} students...`);
  for (const student of students) {
    await syncUser(
      student.id, 
      student.username, 
      'student', 
      student.email || `${student.username}@student.academia.connect`,
      student.name,
      student.surname
    );
  }

  // 4. Sync Parents
  const parents = await prisma.parent.findMany();
  console.log(`Syncing ${parents.length} parents...`);
  for (const parent of parents) {
    await syncUser(
      parent.id, 
      parent.username, 
      'parent', 
      parent.email || `${parent.username}@parent.academia.connect`,
      parent.name,
      parent.surname
    );
  }

  console.log('Synchronization completed!');
}

async function syncUser(id: string, username: string, role: string, email: string, firstName?: string, lastName?: string) {
  try {
    // Check if user exists by ID
    const { data: userData, error: getError } = await supabase.auth.admin.getUserById(id);

    if (userData?.user) {
      console.log(`User ${username} (${role}) already exists. Updating metadata...`);
      await supabase.auth.admin.updateUserById(id, {
        user_metadata: { role, username, firstName, lastName }
      });
    } else {
      console.log(`User ${username} (${role}) not found. Creating in Supabase Auth...`);
      // Use the existing ID if it's a valid UUID, otherwise let Supabase generate one and we'll have a problem.
      // NOTE: Our seed.ts currently uses string IDs like 'admin1', 'teacher1' etc.
      // Supabase REQUIRES UUID for auth.id. 
      // This means the current seed.ts is incompatible with "proper" Supabase integration.
      
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: 'Password123!',
        user_metadata: { role, username, firstName, lastName },
        email_confirm: true
      });

      if (createError) {
        console.error(`Error creating user ${username}:`, createError.message);
      } else if (createData.user) {
        // We need to update the Prisma record ID to match the new Supabase UUID
        console.log(`User ${username} created. Updating Prisma ID from ${id} to ${createData.user.id}`);
        await updatePrismaId(role, id, createData.user.id);
      }
    }
  } catch (err) {
    console.error(`Unexpected error for user ${username}:`, err);
  }
}

async function updatePrismaId(role: string, oldId: string, newId: string) {
  // This is complex because of foreign keys. 
  // In a real migration, we'd handle this more carefully.
  try {
    if (role === 'admin') {
      await prisma.admin.update({ where: { id: oldId }, data: { id: newId } });
    } else if (role === 'teacher') {
      await prisma.teacher.update({ where: { id: oldId }, data: { id: newId } });
    } else if (role === 'student') {
      await prisma.student.update({ where: { id: oldId }, data: { id: newId } });
    } else if (role === 'parent') {
      await prisma.parent.update({ where: { id: oldId }, data: { id: newId } });
    }
  } catch (err) {
    console.error(`Failed to update Prisma ID for ${role}:`, err);
  }
}

syncUsers()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
