import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("attachments");
    const messageId = formData.get("messageId");
    if (!messageId) return NextResponse.json({ error: "Message ID required" }, { status: 400 });
    if (!files || files.length === 0) return NextResponse.json({ error: "No files uploaded" }, { status: 400 });

    const uploadDir = path.join(process.cwd(), "public", "uploads", "messages");
    await fs.mkdir(uploadDir, { recursive: true });

    const savedFiles = [];
    for (const file of files) {
      if (!(file instanceof File)) continue;
      if (file.size > 10 * 1024 * 1024) continue; // 10MB limit
      const ext = path.extname(file.name);
      const fileName = `${uuidv4()}${ext}`;
      const filePath = path.join(uploadDir, fileName);
      const arrayBuffer = await file.arrayBuffer();
      await fs.writeFile(filePath, Buffer.from(arrayBuffer));
      const fileUrl = `/uploads/messages/${fileName}`;
      const attachment = await prisma.messageAttachment.create({
        data: {
          messageId: parseInt(messageId as string),
          fileName: file.name,
          fileUrl,
          fileSize: file.size,
          fileType: file.type,
        },
      });
      savedFiles.push(attachment);
    }
    return NextResponse.json({ files: savedFiles });
  } catch (err) {
    console.error("Error uploading attachments:", err);
    return NextResponse.json({ error: "Failed to upload attachments" }, { status: 500 });
  }
} 