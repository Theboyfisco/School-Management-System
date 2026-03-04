import { NextResponse } from 'next/server';
import { getAllStudents } from '@/lib/student-actions';

export async function GET() {
  try {
    const students = await getAllStudents();
    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}
