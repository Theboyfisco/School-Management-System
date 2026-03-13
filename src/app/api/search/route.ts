import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [teachers, students, classes] = await Promise.all([
      prisma.teacher.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { surname: { contains: q, mode: "insensitive" } },
            { username: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        select: { id: true, name: true, surname: true, username: true },
      }),
      prisma.student.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { surname: { contains: q, mode: "insensitive" } },
            { username: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        select: { id: true, name: true, surname: true, username: true },
      }),
      prisma.class.findMany({
        where: {
          name: { contains: q, mode: "insensitive" },
        },
        take: 3,
        select: { id: true, name: true },
      }),
    ]);

    const results = [
      ...teachers.map((t) => ({
        id: t.id,
        title: `${t.name} ${t.surname}`,
        subtitle: `Teacher (@${t.username})`,
        href: `/list/teachers/${t.id}`,
        type: "teacher",
      })),
      ...students.map((s) => ({
        id: s.id,
        title: `${s.name} ${s.surname}`,
        subtitle: `Student (@${s.username})`,
        href: `/list/students/${s.id}`,
        type: "student",
      })),
      ...classes.map((c) => ({
        id: c.id,
        title: c.name,
        subtitle: `Class`,
        href: `/list/classes/${c.id}`,
        type: "class",
      })),
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}