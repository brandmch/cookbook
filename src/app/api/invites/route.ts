import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

function inviteEmailHtml({
  cookbookName,
  inviterName,
  acceptUrl,
}: {
  cookbookName: string;
  inviterName: string;
  acceptUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're invited to ${cookbookName}</title>
</head>
<body style="margin:0;padding:0;background:#f3ead6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3ead6;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#faf4e6;border-radius:12px;box-shadow:0 2px 20px rgba(58,44,32,.12);overflow:hidden;">
          <!-- Header stripe -->
          <tr>
            <td style="background:#bf6243;height:6px;"></td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#9a866f;font-weight:600;">Fam Cookbook</p>
              <h1 style="margin:0 0 16px;font-size:36px;color:#3a2c20;line-height:1.1;font-weight:700;">You're invited! 📖</h1>
              <p style="margin:0 0 24px;font-size:15px;color:#6e5a48;line-height:1.6;">
                <strong style="color:#3a2c20;">${inviterName}</strong> has invited you to join
                <strong style="color:#3a2c20;">${cookbookName}</strong> on Fam Cookbook —
                a place to collect and share recipes across generations.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background:#bf6243;border-radius:6px;box-shadow:0 2px 0 #9c4a30;">
                    <a href="${acceptUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#faf4e6;text-decoration:none;letter-spacing:.01em;">
                      Accept invitation →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:12px;color:#9a866f;">
                This link expires in 7 days. If you didn't expect this invitation, you can ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#ece0c8;padding:16px 40px;">
              <p style="margin:0;font-size:11px;color:#9a866f;">
                Can't click the button? Copy this link:<br />
                <a href="${acceptUrl}" style="color:#bf6243;word-break:break-all;">${acceptUrl}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cookbookSlug = req.nextUrl.searchParams.get("cookbookSlug");
  if (!cookbookSlug) return NextResponse.json({ error: "cookbookSlug required" }, { status: 400 });

  const cookbook = await db.cookbook.findUnique({ where: { slug: cookbookSlug }, select: { id: true } });
  if (!cookbook) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const membership = await db.cookbookMember.findUnique({
    where: { cookbookId_userId: { cookbookId: cookbook.id, userId: session.user.id } },
  });
  if (!membership || membership.role !== "OWNER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const invites = await db.invite.findMany({
    where: { cookbookId: cookbook.id, status: "PENDING", expiresAt: { gt: new Date() } },
    select: { id: true, email: true, createdAt: true, expiresAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(invites);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { cookbookSlug: string; email: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { cookbookSlug, email } = body;
  if (!cookbookSlug || !email?.trim()) {
    return NextResponse.json({ error: "cookbookSlug and email are required" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  const cookbook = await db.cookbook.findUnique({
    where: { slug: cookbookSlug },
    select: { id: true, name: true, owner: { select: { name: true } } },
  });
  if (!cookbook) return NextResponse.json({ error: "Cookbook not found" }, { status: 404 });

  const membership = await db.cookbookMember.findUnique({
    where: { cookbookId_userId: { cookbookId: cookbook.id, userId: session.user.id } },
  });
  if (!membership || membership.role !== "OWNER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Check not already a member
  const existingMember = await db.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });
  if (existingMember) {
    const alreadyMember = await db.cookbookMember.findUnique({
      where: { cookbookId_userId: { cookbookId: cookbook.id, userId: existingMember.id } },
    });
    if (alreadyMember) {
      return NextResponse.json({ error: "That person is already a member of this cookbook." }, { status: 409 });
    }
  }

  // Check no active pending invite
  const existing = await db.invite.findFirst({
    where: { cookbookId: cookbook.id, email: normalizedEmail, status: "PENDING", expiresAt: { gt: new Date() } },
  });
  if (existing) {
    return NextResponse.json({ error: "An invite has already been sent to that address." }, { status: 409 });
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const invite = await db.invite.create({
    data: { cookbookId: cookbook.id, email: normalizedEmail, expiresAt },
    select: { id: true, token: true, email: true, expiresAt: true },
  });

  const acceptUrl = `${process.env.NEXTAUTH_URL}/invite/${invite.token}`;
  const inviterName = cookbook.owner.name ?? "Someone";

  if (!process.env.VERCEL) {
    console.log(`\n📧 [invite] ${normalizedEmail} → ${acceptUrl}\n`);
  } else {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM!,
      to: normalizedEmail,
      subject: `You're invited to join ${cookbook.name}`,
      html: inviteEmailHtml({ cookbookName: cookbook.name, inviterName, acceptUrl }),
    });
  }

  return NextResponse.json({ id: invite.id, email: invite.email, expiresAt: invite.expiresAt }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { inviteId: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { inviteId } = body;
  if (!inviteId) return NextResponse.json({ error: "inviteId is required" }, { status: 400 });

  const invite = await db.invite.findUnique({
    where: { id: inviteId },
    select: {
      id: true,
      token: true,
      email: true,
      status: true,
      cookbook: { select: { id: true, name: true, owner: { select: { name: true } } } },
    },
  });
  if (!invite) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (invite.status !== "PENDING") return NextResponse.json({ error: "Invite is no longer pending" }, { status: 400 });

  const membership = await db.cookbookMember.findUnique({
    where: { cookbookId_userId: { cookbookId: invite.cookbook.id, userId: session.user.id } },
  });
  if (!membership || membership.role !== "OWNER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db.invite.update({ where: { id: inviteId }, data: { expiresAt } });

  const acceptUrl = `${process.env.NEXTAUTH_URL}/invite/${invite.token}`;
  const inviterName = invite.cookbook.owner.name ?? "Someone";

  if (!process.env.VERCEL) {
    console.log(`\n📧 [resend invite] ${invite.email} → ${acceptUrl}\n`);
  } else {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM!,
      to: invite.email,
      subject: `You're invited to join ${invite.cookbook.name}`,
      html: inviteEmailHtml({ cookbookName: invite.cookbook.name, inviterName, acceptUrl }),
    });
  }

  return NextResponse.json({ ok: true });
}
