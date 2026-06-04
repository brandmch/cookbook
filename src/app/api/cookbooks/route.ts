import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { createUniqueSlug } from "@/lib/slug";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cookbooks = await db.cookbook.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(cookbooks);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const cookbookName = (body.cookbookName ?? "").trim();
  const displayName = (body.displayName ?? "").trim();
  const bio = (body.bio ?? "").trim();

  if (!cookbookName) {
    return NextResponse.json({ error: "Cookbook name is required" }, { status: 400 });
  }
  if (!displayName) {
    return NextResponse.json({ error: "Display name is required" }, { status: 400 });
  }

  const slug = await createUniqueSlug(cookbookName);

  const [cookbook] = await db.$transaction([
    db.cookbook.create({
      data: {
        name: cookbookName,
        slug,
        ownerId: session.user.id,
        members: {
          create: { userId: session.user.id, role: "OWNER" },
        },
      },
    }),
    db.user.update({
      where: { id: session.user.id },
      data: {
        name: displayName,
        bio: bio || null,
      },
    }),
  ]);

  return NextResponse.json({ slug: cookbook.slug }, { status: 201 });
}
