"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  token: string;
  cookbookName: string;
  cookbookSlug: string;
  inviterName: string;
  inviteEmail: string;
  isSignedIn: boolean;
  emailMatches: boolean;
  sessionEmail: string | null;
};

export default function AcceptInvite({
  token,
  cookbookName,
  inviterName,
  inviteEmail,
  isSignedIn,
  emailMatches,
  sessionEmail,
}: Props) {
  if (!isSignedIn) {
    return <SignInToAccept inviteEmail={inviteEmail} token={token} cookbookName={cookbookName} inviterName={inviterName} />;
  }

  if (!emailMatches) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-3xl">📧</p>
        <h2 className="font-slab text-lg font-semibold text-ink">Wrong account</h2>
        <p className="font-sans text-sm text-ink-soft">
          This invite was sent to <strong className="text-ink">{inviteEmail}</strong>,
          but you&apos;re signed in as <strong className="text-ink">{sessionEmail}</strong>.
        </p>
        <p className="font-sans text-xs text-ink/40">
          Sign out and sign in with the invited address to accept.
        </p>
      </div>
    );
  }

  return <JoinButton token={token} cookbookName={cookbookName} inviterName={inviterName} />;
}

function SignInToAccept({
  inviteEmail,
  token,
  cookbookName,
  inviterName,
}: {
  inviteEmail: string;
  token: string;
  cookbookName: string;
  inviterName: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const callbackUrl = `/invite/${token}`;

  async function handleSignIn() {
    setLoading(true);
    setError("");
    const result = await signIn("email", { email: inviteEmail, redirect: false, callbackUrl });
    setLoading(false);
    if (result?.error) {
      setError("Something went wrong. Please try again.");
    } else {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="text-center space-y-4">
        <p className="text-3xl">✉️</p>
        <h2 className="font-slab text-lg font-semibold text-ink">Check your inbox</h2>
        <p className="font-sans text-sm text-ink-soft">
          We sent a sign-in link to <strong className="text-ink">{inviteEmail}</strong>.
          Click it and you&apos;ll land right here to join the cookbook.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="font-sans text-xs text-accent underline hover:text-accent/80"
        >
          Resend
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-slab text-xl text-ink font-semibold mb-1">
          You&apos;re invited!
        </h2>
        <p className="font-sans text-sm text-ink-soft">
          <strong className="text-ink">{inviterName}</strong> invited you to join{" "}
          <strong className="text-ink">{cookbookName}</strong>.
          Sign in to accept.
        </p>
      </div>

      <div className="space-y-2">
        <Label className="font-slab text-sm text-ink/80">Your email</Label>
        <Input
          value={inviteEmail}
          readOnly
          className="bg-cream-1 border-ink/20 font-sans text-ink/70 cursor-default"
        />
        <p className="font-sans text-xs text-ink/40">
          This invite was sent to this address.
        </p>
      </div>

      {error && <p className="font-sans text-xs text-red-600">{error}</p>}

      <Button
        onClick={handleSignIn}
        disabled={loading}
        className="w-full bg-accent hover:bg-accent/90 text-cream-0 font-slab shadow-btn-primary disabled:opacity-50"
      >
        {loading ? "Sending…" : "Send magic link →"}
      </Button>
    </div>
  );
}

function JoinButton({
  token,
  cookbookName,
  inviterName,
}: {
  token: string;
  cookbookName: string;
  inviterName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAccept() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/invites/${token}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push(`/${data.cookbookSlug}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5 text-center">
      <p className="text-4xl">📖</p>
      <div>
        <h2 className="font-slab text-xl text-ink font-semibold mb-1">
          You&apos;re invited!
        </h2>
        <p className="font-sans text-sm text-ink-soft">
          <strong className="text-ink">{inviterName}</strong> wants you to join{" "}
          <strong className="text-ink">{cookbookName}</strong>.
        </p>
      </div>

      {error && <p className="font-sans text-xs text-red-600">{error}</p>}

      <Button
        onClick={handleAccept}
        disabled={loading}
        className="w-full bg-accent hover:bg-accent/90 text-cream-0 font-slab shadow-btn-primary disabled:opacity-50"
      >
        {loading ? "Joining…" : `Join ${cookbookName} →`}
      </Button>
    </div>
  );
}
