import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { cookbookSlug: string; userId: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { cookbookSlug, userId } = body;
  if (!cookbookSlug || !userId) {
    return NextResponse.json({ error: "cookbookSlug and userId are required" }, { status: 400 });
  }

  const cookbook = await db.cookbook.findUnique({
    where: { slug: cookbookSlug },
    select: { id: true },
  });
  if (!cookbook) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const callerMembership = await db.cookbookMember.findUnique({
    where: { cookbookId_userId: { cookbookId: cookbook.id, userId: session.user.id } },
  });
  if (!callerMembership || callerMembership.role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const targetMembership = await db.cookbookMember.findUnique({
    where: { cookbookId_userId: { cookbookId: cookbook.id, userId } },
  });
  if (!targetMembership) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }
  if (targetMembership.role === "OWNER") {
    return NextResponse.json({ error: "Cannot remove the cookbook owner" }, { status: 400 });
  }

  await db.cookbookMember.delete({
    where: { cookbookId_userId: { cookbookId: cookbook.id, userId } },
  });

  return NextResponse.json({ ok: true });
}
