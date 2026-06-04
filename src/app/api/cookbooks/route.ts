// POST /api/cookbooks — create a cookbook during onboarding (Phase 3)
// GET  /api/cookbooks — list cookbooks for current user
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Phase 3" }, { status: 501 });
}

export async function POST() {
  return NextResponse.json({ message: "Phase 3" }, { status: 501 });
}
