// POST /api/invites — send an invite email (Phase 6)
// GET  /api/invites?cookbookId=... — list pending invites
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Phase 6" }, { status: 501 });
}

export async function POST() {
  return NextResponse.json({ message: "Phase 6" }, { status: 501 });
}
