import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!name || name.length > 100) {
    return NextResponse.json({ error: "Name must be between 1 and 100 characters." }, { status: 400 });
  }

  await db.user.update({ where: { id: session.user.id }, data: { name } });

  return NextResponse.json({ name });
}
