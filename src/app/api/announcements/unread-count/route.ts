import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) return NextResponse.json({ count: 0 });

  const unreadCount = await prisma.announcement.count({
    where: {
      AnnouncementRead: { none: { userId } }
    }
  });

  return NextResponse.json({ count: unreadCount });
} 