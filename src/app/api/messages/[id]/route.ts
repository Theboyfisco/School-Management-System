import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

// GET /api/messages/[id]
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    const role = user?.user_metadata?.role as string;
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    const message = await prisma.message.findUnique({
      where: { id: parseInt(id) },
      include: {
        parent: true,
        replies: {
          include: {
            MessageRead: userId ? { where: { userId }, select: { id: true } } : false,
          },
          orderBy: { date: "asc" }
        },
        MessageRead: userId ? { where: { userId }, select: { id: true } } : false,
        attachments: true,
      },
    });
    
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Check if user has access to this message
    if (role !== "admin") {
      const hasAccess = 
        message.senderId === userId ||
        message.recipientId === userId ||
        (message.isBroadcast && (message.recipientRole === role.toUpperCase() || !message.recipientRole));
      
      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Mark as read if user is recipient
    if (message.recipientId === userId || (message.isBroadcast && role !== "admin")) {
      await prisma.messageRead.upsert({
        where: { 
          userId_messageId: { 
            userId, 
            messageId: parseInt(id) 
          } 
        },
        update: { readAt: new Date() },
        create: { 
          userId, 
          messageId: parseInt(id), 
          readAt: new Date() 
        },
      });
    }

    // Normalize response
    const normalized = {
      ...message,
      read: message.MessageRead && message.MessageRead.length > 0,
      replies: message.replies.map(r => ({
        ...r,
        read: r.MessageRead && r.MessageRead.length > 0,
      }))
    };
    
    return NextResponse.json(normalized);
  } catch (err) {
    console.error('Error fetching message:', err);
    return NextResponse.json({ error: 'Failed to fetch message' }, { status: 500 });
  }
}

// PUT /api/messages/[id]
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    const role = user?.user_metadata?.role as string;
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const { title, content, category, priority } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Check if user owns the message or is admin
    const existingMessage = await prisma.message.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingMessage) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (existingMessage.senderId !== userId && role !== "admin") {
      return NextResponse.json({ error: 'You can only edit your own messages' }, { status: 403 });
    }

    const message = await prisma.message.update({
      where: { id: parseInt(id) },
      data: {
        title,
        content,
        category: category || "GENERAL",
        priority: priority || "NORMAL",
      },
      include: {
        parent: true,
        replies: true,
        attachments: true,
      }
    });

    return NextResponse.json(message);
  } catch (err) {
    console.error('Error updating message:', err);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}

// DELETE /api/messages/[id]
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    const role = user?.user_metadata?.role as string;
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    // Check if user owns the message or is admin
    const existingMessage = await prisma.message.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingMessage) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (existingMessage.senderId !== userId && role !== "admin") {
      return NextResponse.json({ error: 'You can only delete your own messages' }, { status: 403 });
    }

    await prisma.message.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting message:', err);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
} 