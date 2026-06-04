import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50)
    .replace(/-$/, "");
}

async function uniqueSlug(base: string): Promise<string> {
  const candidate = base || "my-cookbook";
  const existing = await db.cookbook.findMany({
    where: { slug: { startsWith: candidate } },
    select: { slug: true },
  });
  const taken = new Set(existing.map((c) => c.slug));
  if (!taken.has(candidate)) return candidate;
  for (let i = 2; i < 1000; i++) {
    const s = `${candidate.slice(0, 47)}-${i}`;
    if (!taken.has(s)) return s;
  }
  return `${candidate.slice(0, 43)}-${Date.now()}`;
}

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

  const slug = await uniqueSlug(slugify(cookbookName));

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
