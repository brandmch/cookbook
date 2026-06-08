import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let name: string | undefined;
  try {
    const body = await req.json();
    if (typeof body.name === "string" && body.name.trim()) {
      name = body.name.trim().slice(0, 100);
    }
  } catch { /* body may be empty */ }

  const invite = await db.invite.findUnique({
    where: { token },
    include: { cookbook: { select: { id: true, slug: true, name: true } } },
  });

  if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });

  if (invite.status === "ACCEPTED") {
    return NextResponse.json({ cookbookSlug: invite.cookbook.slug });
  }

  if (invite.status === "EXPIRED" || invite.expiresAt < new Date()) {
    await db.invite.update({ where: { id: invite.id }, data: { status: "EXPIRED" } });
    return NextResponse.json({ error: "This invite has expired." }, { status: 410 });
  }

  if (invite.email.toLowerCase() !== session.user.email.toLowerCase()) {
    return NextResponse.json({ error: "This invite was sent to a different email address." }, { status: 403 });
  }

  // Idempotent: already a member is fine
  await db.$transaction([
    ...(name ? [db.user.update({ where: { id: session.user.id }, data: { name } })] : []),
    db.cookbookMember.upsert({
      where: { cookbookId_userId: { cookbookId: invite.cookbookId, userId: session.user.id } },
      create: { cookbookId: invite.cookbookId, userId: session.user.id, role: "MEMBER" },
      update: {},
    }),
    db.invite.update({ where: { id: invite.id }, data: { status: "ACCEPTED" } }),
  ]);

  return NextResponse.json({ cookbookSlug: invite.cookbook.slug });
}
