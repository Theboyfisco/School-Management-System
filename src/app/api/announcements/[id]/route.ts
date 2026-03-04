import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/announcements/[id]
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    
    const announcement = await prisma.announcement.findUnique({
      where: { id: parseInt(id) },
      include: {
        class: true,
      },
    });
    
    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }
    
    return NextResponse.json(announcement);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch announcement' }, { status: 500 });
  }
} 