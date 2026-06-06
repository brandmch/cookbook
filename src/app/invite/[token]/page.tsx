import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import AcceptInvite from "./AcceptInvite";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const invite = await db.invite.findUnique({
    where: { token },
    include: {
      cookbook: {
        select: { name: true, slug: true, owner: { select: { name: true } } },
      },
    },
  });

  if (!invite) {
    return <InviteShell><ErrorState title="Invite not found" body="This link is invalid or has already been used." /></InviteShell>;
  }

  const isExpired = invite.status === "EXPIRED" || invite.expiresAt < new Date();

  if (isExpired) {
    return <InviteShell><ErrorState title="Invite expired" body="This invite link is no longer valid. Ask the cookbook owner to send a new one." /></InviteShell>;
  }

  // Already accepted — if current user is a member, bounce them to the cookbook
  if (invite.status === "ACCEPTED") {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      const membership = await db.cookbookMember.findUnique({
        where: { cookbookId_userId: { cookbookId: invite.cookbookId, userId: session.user.id } },
      });
      if (membership) redirect(`/${invite.cookbook.slug}`);
    }
    return (
      <InviteShell>
        <ErrorState title="Already accepted" body="This invite has already been used. Sign in to access the cookbook." />
      </InviteShell>
    );
  }

  // Pending invite — determine sign-in state
  const session = await getServerSession(authOptions);
  const sessionEmail = session?.user?.email?.toLowerCase() ?? null;
  const inviteEmail = invite.email.toLowerCase();
  const emailMatches = sessionEmail === inviteEmail;

  const sessionUser = session?.user?.id
    ? await db.user.findUnique({ where: { id: session.user.id }, select: { name: true } })
    : null;
  const hasName = !!sessionUser?.name;

  return (
    <InviteShell>
      <AcceptInvite
        token={token}
        cookbookName={invite.cookbook.name}
        cookbookSlug={invite.cookbook.slug}
        inviterName={invite.cookbook.owner.name ?? "A family member"}
        inviteEmail={invite.email}
        isSignedIn={!!session}
        emailMatches={emailMatches}
        sessionEmail={sessionEmail}
        hasName={hasName}
      />
    </InviteShell>
  );
}

function InviteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen paper flex items-center justify-center p-6">
      <a href="/" className="fixed top-5 left-5 font-sans text-sm text-ink/50 hover:text-ink transition-colors">
        ← Home
      </a>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-mono text-xs eyebrow text-ink/50 tracking-widest mb-3">Fam Cookbook</p>
          <h1 className="font-hand text-4xl text-ink leading-tight">Family cookbook</h1>
        </div>
        <div className="bg-cream-0 rounded-2xl shadow-card p-7 relative overflow-hidden">
          <div className="tape absolute -top-1 left-1/2 -translate-x-1/2 w-16" />
          {children}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ title, body }: { title: string; body: string }) {
  return (
    <div className="text-center space-y-3 py-2">
      <p className="text-3xl">🔒</p>
      <h2 className="font-slab text-lg font-semibold text-ink">{title}</h2>
      <p className="font-sans text-sm text-ink-soft">{body}</p>
      <a href="/login" className="inline-block font-slab text-sm text-accent hover:text-accent/80 mt-2">
        Sign in →
      </a>
    </div>
  );
}
