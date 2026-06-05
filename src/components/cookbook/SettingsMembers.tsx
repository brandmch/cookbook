"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import InviteDialog from "./InviteDialog";

type Member = {
  userId: string;
  role: "OWNER" | "MEMBER";
  joinedAt: string;
  user: {
    name: string | null;
    email: string;
  };
};

type Invite = {
  id: string;
  email: string;
};

type Cookbook = { name: string; slug: string };

type Props = {
  cookbookSlug: string;
  cookbookName: string;
  cookbooks: Cookbook[];
  members: Member[];
  pendingInvites: Invite[];
  isOwner: boolean;
  currentUserId: string;
};

export default function SettingsMembers({
  cookbookSlug,
  cookbookName,
  cookbooks,
  members: initialMembers,
  pendingInvites,
  isOwner,
  currentUserId,
}: Props) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [resentId, setResentId] = useState<string | null>(null);

  async function handleResend(inviteId: string) {
    setResendingId(inviteId);
    try {
      const res = await fetch("/api/invites", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId }),
      });
      if (res.ok) {
        setResentId(inviteId);
        setTimeout(() => setResentId(null), 2500);
      }
    } finally {
      setResendingId(null);
    }
  }

  async function handleRemove(userId: string) {
    setRemovingId(userId);
    try {
      const res = await fetch("/api/cookbooks/members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cookbookSlug, userId }),
      });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.userId !== userId));
      }
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <section>
      <p className="font-mono text-[10px] eyebrow tracking-widest text-ink/40 mb-4">
        Cookbook Users
      </p>

      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline gap-2">
          {cookbooks.length > 1 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-1 font-hand text-2xl text-ink leading-none
                             hover:text-accent transition-colors focus-visible:outline-none
                             focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2
                             focus-visible:ring-offset-cream-1 rounded-sm"
                >
                  {cookbookName}
                  <ChevronDown className="h-4 w-4 text-ink/40 shrink-0 mb-0.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[200px]">
                <DropdownMenuLabel className="font-mono text-[10px] eyebrow text-ink/40 px-3 py-1.5">
                  Your cookbooks
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {cookbooks.map((cb) => (
                  <DropdownMenuItem
                    key={cb.slug}
                    onSelect={() => router.push(`/${cb.slug}/settings`)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Check
                      className={`h-3.5 w-3.5 shrink-0 ${cb.slug === cookbookSlug ? "text-accent" : "opacity-0"}`}
                    />
                    <span className="font-hand text-lg leading-tight">{cb.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <h2 className="font-hand text-2xl text-ink leading-none">{cookbookName}</h2>
          )}
          <span className="font-mono text-xs text-ink-faint">
            {members.length} {members.length === 1 ? "member" : "members"}
          </span>
        </div>

        {isOwner && (
          <Button
            onClick={() => setInviteOpen(true)}
            className="bg-accent hover:bg-accent/90 text-cream-0 font-slab text-sm h-8 px-3 shadow-btn-primary"
          >
            Invite
          </Button>
        )}
      </div>

      {/* Members table */}
      <div className="rounded-lg border border-line overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-cream-0 border-b border-line">
              <th className="text-left font-mono text-[10px] eyebrow tracking-widest text-ink/40 px-4 py-2.5">
                Name
              </th>
              <th className="text-left font-mono text-[10px] eyebrow tracking-widest text-ink/40 px-4 py-2.5">
                Email
              </th>
              <th className="text-left font-mono text-[10px] eyebrow tracking-widest text-ink/40 px-4 py-2.5">
                Role
              </th>
              {isOwner && <th className="px-4 py-2.5 w-10" />}
            </tr>
          </thead>
          <tbody>
            {members.map((member, i) => {
              const canRemove = isOwner && member.role !== "OWNER" && member.userId !== currentUserId;
              const isLast = i === members.length - 1 && pendingInvites.length === 0;
              return (
                <tr
                  key={member.userId}
                  className={`${!isLast ? "border-b border-line" : ""} bg-cream-1 hover:bg-cream-0 transition-colors`}
                >
                  <td className="px-4 py-3 font-slab text-sm font-semibold text-ink">
                    {member.user.name ?? "—"}
                    {member.userId === currentUserId && (
                      <span className="ml-2 font-mono text-[10px] eyebrow tracking-widest text-ink/40">
                        you
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-sans text-sm text-ink-soft">
                    {member.user.email}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-mono text-[10px] eyebrow tracking-widest px-2 py-0.5 rounded-pill ${
                        member.role === "OWNER"
                          ? "bg-accent/10 text-accent"
                          : "bg-ink/8 text-ink-soft"
                      }`}
                    >
                      {member.role === "OWNER" ? "Owner" : "Member"}
                    </span>
                  </td>
                  {isOwner && (
                    <td className="px-4 py-3 text-right">
                      {canRemove && (
                        <button
                          onClick={() => handleRemove(member.userId)}
                          disabled={removingId === member.userId}
                          className="p-1.5 rounded text-ink/30 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                          aria-label={`Remove ${member.user.name ?? member.user.email}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
            {pendingInvites.map((invite, i) => (
              <tr
                key={invite.id}
                className={`${i < pendingInvites.length - 1 ? "border-b border-line" : ""} bg-cream-1 hover:bg-cream-0 transition-colors opacity-60`}
              >
                <td className="px-4 py-3 font-slab text-sm text-ink/40">—</td>
                <td className="px-4 py-3 font-sans text-sm text-ink-soft">{invite.email}</td>
                <td className="px-4 py-3">
                  <span className="font-mono text-[10px] eyebrow tracking-widest px-2 py-0.5 rounded-pill bg-secondary/10 text-secondary">
                    Invited
                  </span>
                </td>
                {isOwner && (
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleResend(invite.id)}
                      disabled={resendingId === invite.id || resentId === invite.id}
                      className="font-sans text-xs text-ink/40 hover:text-accent transition-colors disabled:opacity-40 whitespace-nowrap"
                    >
                      {resentId === invite.id ? "Sent!" : resendingId === invite.id ? "Sending…" : "Resend"}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isOwner && (
        <InviteDialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          cookbookSlug={cookbookSlug}
          cookbookName={cookbookName}
        />
      )}
    </section>
  );
}
