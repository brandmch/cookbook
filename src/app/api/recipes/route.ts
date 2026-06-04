// POST /api/recipes — create a recipe (Phase 5)
// GET  /api/recipes?cookbookId=... — list recipes (Phase 4)
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Phase 4" }, { status: 501 });
}

export async function POST() {
  return NextResponse.json({ message: "Phase 5" }, { status: 501 });
}
