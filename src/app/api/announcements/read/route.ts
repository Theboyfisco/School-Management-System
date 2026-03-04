import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const { announcementId } = await req.json();
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId || !announcementId) return NextResponse.json({ error: "Missing data" }, { status: 400 });

  await prisma.announcementRead.upsert({
    where: { userId_announcementId: { userId, announcementId } },
    update: { readAt: new Date() },
    create: { userId, announcementId, readAt: new Date() },
  });

  return NextResponse.json({ success: true });
} 