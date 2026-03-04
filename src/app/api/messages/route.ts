import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

// GET /api/messages
export async function GET(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    const role = user?.user_metadata?.role as string;
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const messages = await prisma.message.findMany({
      where: role === "admin" ? {} : {
        OR: [
          { senderId: userId },
          { recipientId: userId },
          { 
            AND: [
              { isBroadcast: true },
              { recipientRole: role.toUpperCase() as any }
            ]
          },
          { 
            AND: [
              { isBroadcast: true },
              { recipientRole: null }
            ]
          }
        ]
      },
      include: {
        parent: true,
        replies: {
          include: {
            MessageRead: { where: { userId: userId || "" }, select: { id: true } },
          }
        },
        MessageRead: { where: { userId: userId || "" }, select: { id: true } },
      },
      orderBy: { date: "desc" },
    });
    
    // Normalize response
    const normalized = messages.map(m => ({
      ...m,
      read: m.MessageRead?.length > 0,
      replies: m.replies?.map((r: any) => ({
        ...r,
        read: r.MessageRead?.length > 0,
      })) || [],
    }));

    return NextResponse.json(normalized);
  } catch (err) {
    console.error('Error fetching messages:', err);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST /api/messages
export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    const role = user?.user_metadata?.role as string;
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Parse FormData instead of JSON
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const category = formData.get('category') as string;
    const priority = formData.get('priority') as string;
    const recipientId = formData.get('recipientId') as string;
    const recipientRole = formData.get('recipientRole') as string;
    const parentId = formData.get('parentId') as string;
    const isBroadcast = formData.get('isBroadcast') as string;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Role-based validation
    if (role === "student" && recipientRole !== "teacher") {
      return NextResponse.json({ error: 'Students can only message teachers' }, { status: 400 });
    }

    if (role === "parent" && recipientRole !== "teacher") {
      return NextResponse.json({ error: 'Parents can only message teachers' }, { status: 400 });
    }

    if (role !== "admin" && recipientRole === "admin") {
      return NextResponse.json({ error: 'Cannot message admin' }, { status: 400 });
    }

    const messageData: any = {
      title,
      content,
      category: category || "GENERAL",
      priority: priority || "NORMAL",
      senderId: userId,
      senderRole: role.toUpperCase(),
      isBroadcast: isBroadcast === "true",
    };

    if (parentId) {
      messageData.parentId = parseInt(parentId);
    }

    if (!messageData.isBroadcast) {
      if (recipientId) {
        messageData.recipientId = recipientId;
      }
      if (recipientRole) {
        messageData.recipientRole = recipientRole.toUpperCase();
      }
    }

    const message = await prisma.message.create({
      data: messageData,
      include: {
        parent: true,
        replies: true,
      }
    });

    return NextResponse.json(message, { status: 201 });
  } catch (err) {
    console.error('Error creating message:', err);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
} 