"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const didVerify = searchParams.get("verify") === "1";

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(didVerify);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    const result = await signIn("email", {
      email: email.toLowerCase().trim(),
      redirect: false,
      callbackUrl: "/",
    });

    setLoading(false);

    if (result?.error) {
      setError("Something went wrong. Please try again.");
    } else {
      setSubmitted(true);
    }
  }

  return (
    <div className="min-h-screen paper flex items-center justify-center p-6">
      <a
        href="/"
        className="fixed top-5 left-5 font-sans text-sm text-ink/50 hover:text-ink transition-colors"
      >
        ← Back
      </a>
      <div className="w-full max-w-sm">

        {/* Title */}
        <div className="text-center mb-8">
          <p className="font-mono text-xs eyebrow text-ink/50 tracking-widest mb-3">
            myfamilyrecipes
          </p>
          <h1 className="font-hand text-5xl text-ink leading-tight">
            Your family cookbook
          </h1>
          <p className="font-sans text-sm text-ink/60 mt-2">
            Collect and share recipes across generations.
          </p>
        </div>

        {/* Card */}
        <div className="bg-cream-0 rounded-2xl shadow-card p-7 relative overflow-hidden">
          {/* Tape accent strip */}
          <div className="tape absolute -top-1 left-1/2 -translate-x-1/2 w-16" />

          {submitted ? (
            <CheckInboxState email={email} onBack={() => setSubmitted(false)} />
          ) : (
            <MagicLinkForm
              email={email}
              setEmail={setEmail}
              loading={loading}
              error={error}
              onSubmit={handleSubmit}
            />
          )}
        </div>

        <p className="text-center font-sans text-xs text-ink/40 mt-6">
          No passwords. No fuss. Just family recipes.
        </p>
      </div>
    </div>
  );
}

function MagicLinkForm({
  email,
  setEmail,
  loading,
  error,
  onSubmit,
}: {
  email: string;
  setEmail: (v: string) => void;
  loading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <h2 className="font-slab text-xl text-ink font-semibold mb-1">
          Welcome back
        </h2>
        <p className="font-sans text-sm text-ink/60">
          New here? We&apos;ll create your account automatically.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="font-slab text-sm text-ink/80">
          Email address
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-cream-1 border-ink/20 font-sans text-ink placeholder:text-ink/30
                     focus-visible:ring-accent/40 focus-visible:border-accent"
        />
        {error && (
          <p className="font-sans text-xs text-red-600">{error}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading || !email.trim()}
        className="w-full bg-accent hover:bg-accent/90 text-cream-0 font-slab
                   shadow-btn-primary disabled:opacity-50"
      >
        {loading ? "Sending…" : "Send magic link"}
      </Button>
    </form>
  );
}

function CheckInboxState({
  email,
  onBack,
}: {
  email: string;
  onBack: () => void;
}) {
  return (
    <div className="text-center space-y-4">
      <div className="text-4xl">✉️</div>
      <div>
        <h2 className="font-slab text-xl text-ink font-semibold">
          Check your inbox
        </h2>
        <p className="font-sans text-sm text-ink/60 mt-1">
          We sent a magic link to{" "}
          <span className="font-semibold text-ink">{email}</span>. Click it to
          sign in — no password needed.
        </p>
      </div>
      <p className="font-sans text-xs text-ink/40">
        Didn&apos;t get it?{" "}
        <button
          onClick={onBack}
          className="underline text-accent hover:text-accent/80 cursor-pointer"
        >
          Try again
        </button>
      </p>
    </div>
  );
}
