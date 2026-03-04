import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

// GET /api/announcements
export async function GET(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    const announcements = await prisma.announcement.findMany({
      orderBy: { date: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        classId: true,
        AnnouncementRead: userId ? { where: { userId }, select: { id: true } } : false,
      },
    });
    // Normalize: always provide 'content' and 'read' for compatibility
    const normalized = announcements.map(a => ({
      ...a,
      content: a.description || "",
      read: a.AnnouncementRead && a.AnnouncementRead.length > 0,
    }));
    return NextResponse.json(normalized);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

// POST /api/announcements
export async function POST(req: Request) {
  try {
    const { title, description, date, classId } = await req.json();
    if (!title || !date) {
      return NextResponse.json({ error: 'Title and date are required' }, { status: 400 });
    }
    const announcement = await prisma.announcement.create({
      data: {
        title,
        description: description || null,
        date: new Date(date),
        classId: classId ? parseInt(classId) : null,
      },
    });
    return NextResponse.json(announcement, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}

// PUT /api/announcements?id=123
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    const { title, description, date, classId } = await req.json();
    const announcement = await prisma.announcement.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description: description || null,
        date: new Date(date),
        classId: classId ? parseInt(classId) : null,
      },
    });
    return NextResponse.json(announcement);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 });
  }
}

// DELETE /api/announcements?id=123
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await prisma.announcement.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
  }
} 