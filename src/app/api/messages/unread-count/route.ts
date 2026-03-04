import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    const role = user?.user_metadata?.role as string;
    
    if (!userId) {
      return NextResponse.json({ count: 0 });
    }

    // Build query for unread messages
    const query: any = {
      where: {
        MessageRead: { none: { userId } }
      }
    };

    // Role-based filtering
    if (role === "admin") {
      // Admin sees unread count for all messages they sent (for monitoring)
      query.where = {
        senderId: userId,
        MessageRead: { none: { userId } }
      };
    } else {
      // Other users see unread messages they received
      query.where = {
        OR: [
          { recipientId: userId },
          { 
            AND: [
              { isBroadcast: true },
              { recipientRole: role.toUpperCase() },
              { MessageRead: { none: { userId } } }
            ]
          },
          { 
            AND: [
              { isBroadcast: true },
              { recipientRole: null },
              { MessageRead: { none: { userId } } }
            ]
          }
        ]
      };
    }

    const unreadCount = await prisma.message.count(query);

    return NextResponse.json({ count: unreadCount });
  } catch (err) {
    console.error('Error getting unread count:', err);
    return NextResponse.json({ count: 0 });
  }
} 