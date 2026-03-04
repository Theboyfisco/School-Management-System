import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { messageId } = await req.json();
    if (!messageId) {
      return NextResponse.json({ error: "Message ID required" }, { status: 400 });
    }

    await prisma.messageRead.upsert({
      where: { 
        userId_messageId: { 
          userId, 
          messageId: parseInt(messageId) 
        } 
      },
      update: { readAt: new Date() },
      create: { 
        userId, 
        messageId: parseInt(messageId), 
        readAt: new Date() 
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error marking message as read:', err);
    return NextResponse.json({ error: "Failed to mark message as read" }, { status: 500 });
  }
} 