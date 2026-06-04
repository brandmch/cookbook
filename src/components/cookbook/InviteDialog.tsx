"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cookbookSlug: string;
  cookbookName: string;
};

type State = "idle" | "loading" | "success" | "error";

export default function InviteDialog({ open, onOpenChange, cookbookSlug, cookbookName }: Props) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [sentEmail, setSentEmail] = useState("");

  function reset() {
    setEmail("");
    setState("idle");
    setErrorMsg("");
    setSentEmail("");
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cookbookSlug, email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        setState("error");
        return;
      }
      setSentEmail(email.trim());
      setState("success");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setState("error");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite to {cookbookName}</DialogTitle>
          <DialogDescription className="font-sans text-ink-soft">
            They&apos;ll get an email with a link to join the cookbook.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          {state === "success" ? (
            <SuccessState email={sentEmail} onInviteAnother={reset} />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email" className="font-slab text-sm text-ink/80">
                  Email address
                </Label>
                <Input
                  id="invite-email"
                  type="email"
                  autoFocus
                  placeholder="grandma@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (state === "error") setState("idle");
                  }}
                  required
                  className="field"
                />
                {state === "error" && (
                  <p className="font-sans text-xs text-red-600">{errorMsg}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={state === "loading" || !email.trim()}
                className="w-full bg-accent hover:bg-accent/90 text-cream-0 font-slab shadow-btn-primary disabled:opacity-50"
              >
                {state === "loading" ? "Sending…" : "Send invite"}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SuccessState({ email, onInviteAnother }: { email: string; onInviteAnother: () => void }) {
  return (
    <div className="text-center space-y-4 py-2">
      <p className="text-4xl">✉️</p>
      <div>
        <p className="font-slab text-base font-semibold text-ink">Invite sent!</p>
        <p className="font-sans text-sm text-ink-soft mt-1">
          We emailed an invite to <strong className="text-ink">{email}</strong>.
          The link is valid for 7 days.
        </p>
      </div>
      <button
        onClick={onInviteAnother}
        className="font-sans text-sm text-accent underline hover:text-accent/80"
      >
        Invite someone else
      </button>
    </div>
  );
}
