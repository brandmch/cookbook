"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateSlug } from "@/lib/slug-utils";

type Step = 1 | 2 | 3;

export default function OnboardingForm({ userName }: { userName: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  const [cookbookName, setCookbookName] = useState("");
  const [slugPreview, setSlugPreview] = useState("");
  const [displayName, setDisplayName] = useState(userName);
  const [bio, setBio] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [finalSlug, setFinalSlug] = useState("");

  useEffect(() => {
    setSlugPreview(generateSlug(cookbookName));
  }, [cookbookName]);

  async function handleCreate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/cookbooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cookbookName, displayName, bio }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setFinalSlug(data.slug);
      setStep(3);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen paper flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="font-mono text-xs eyebrow text-ink/50 tracking-widest mb-3">
            myfamilyrecipes
          </p>
          <h1 className="font-hand text-5xl text-ink leading-tight">
            {step === 1 && "Name your cookbook"}
            {step === 2 && "About you"}
            {step === 3 && "You're all set!"}
          </h1>
          <p className="font-sans text-sm text-ink/60 mt-2">
            {step === 1 && "Give your family's cookbook a name."}
            {step === 2 && "Let your family know who's cooking."}
            {step === 3 && "Your cookbook is ready to fill with recipes."}
          </p>
        </div>

        {/* Progress dots */}
        {step !== 3 && (
          <div className="flex justify-center gap-2 mb-6">
            {([1, 2] as const).map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step
                    ? "w-6 bg-accent"
                    : s < step
                    ? "w-2 bg-accent/50"
                    : "w-2 bg-ink/20"
                }`}
              />
            ))}
          </div>
        )}

        {/* Card */}
        <div className="bg-cream-0 rounded-2xl shadow-card p-7 relative overflow-hidden">
          <div className="tape absolute -top-1 left-1/2 -translate-x-1/2 w-16" />

          {step === 1 && (
            <StepOne
              cookbookName={cookbookName}
              setCookbookName={setCookbookName}
              slugPreview={slugPreview}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <StepTwo
              displayName={displayName}
              setDisplayName={setDisplayName}
              bio={bio}
              setBio={setBio}
              loading={loading}
              error={error}
              onBack={() => setStep(1)}
              onSubmit={handleCreate}
            />
          )}

          {step === 3 && (
            <StepThree
              cookbookName={cookbookName}
              slug={finalSlug}
              onGo={() => router.push(`/${finalSlug}`)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function StepOne({
  cookbookName,
  setCookbookName,
  slugPreview,
  onNext,
}: {
  cookbookName: string;
  setCookbookName: (v: string) => void;
  slugPreview: string;
  onNext: () => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-slab text-xl text-ink font-semibold mb-1">
          What&apos;s it called?
        </h2>
        <p className="font-sans text-sm text-ink/60">
          Something like &ldquo;The Smith Family Cookbook&rdquo; or &ldquo;Nonna&apos;s Kitchen.&rdquo;
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cookbookName" className="font-slab text-sm text-ink/80">
          Cookbook name
        </Label>
        <Input
          id="cookbookName"
          type="text"
          autoFocus
          placeholder="The Smith Family Cookbook"
          value={cookbookName}
          onChange={(e) => setCookbookName(e.target.value)}
          className="bg-cream-1 border-ink/20 font-sans text-ink placeholder:text-ink/30
                     focus-visible:ring-accent/40 focus-visible:border-accent"
        />
        {slugPreview && (
          <p className="font-mono text-xs text-ink/40">
            myfamilyrecipes.com/
            <span className="text-accent">{slugPreview}</span>
          </p>
        )}
      </div>

      <Button
        type="button"
        disabled={!cookbookName.trim()}
        onClick={onNext}
        className="w-full bg-accent hover:bg-accent/90 text-cream-0 font-slab
                   shadow-btn-primary disabled:opacity-50"
      >
        Next →
      </Button>
    </div>
  );
}

function StepTwo({
  displayName,
  setDisplayName,
  bio,
  setBio,
  loading,
  error,
  onBack,
  onSubmit,
}: {
  displayName: string;
  setDisplayName: (v: string) => void;
  bio: string;
  setBio: (v: string) => void;
  loading: boolean;
  error: string;
  onBack: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-slab text-xl text-ink font-semibold mb-1">
          Who&apos;s cooking?
        </h2>
        <p className="font-sans text-sm text-ink/60">
          Your family will see this when you add recipes.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayName" className="font-slab text-sm text-ink/80">
          Your name
        </Label>
        <Input
          id="displayName"
          type="text"
          autoFocus
          placeholder="Grandma Rose"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="bg-cream-1 border-ink/20 font-sans text-ink placeholder:text-ink/30
                     focus-visible:ring-accent/40 focus-visible:border-accent"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio" className="font-slab text-sm text-ink/80">
          A little about you{" "}
          <span className="font-sans text-ink/40 text-xs">(optional)</span>
        </Label>
        <Textarea
          id="bio"
          placeholder="Home cook from New Orleans. Mom of four, grandma of nine."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="bg-cream-1 border-ink/20 font-sans text-ink placeholder:text-ink/30
                     focus-visible:ring-accent/40 focus-visible:border-accent resize-none"
        />
      </div>

      {error && (
        <p className="font-sans text-xs text-red-600">{error}</p>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="flex-1"
        >
          ← Back
        </Button>
        <Button
          type="button"
          disabled={!displayName.trim() || loading}
          onClick={onSubmit}
          className="flex-[2] bg-accent hover:bg-accent/90 text-cream-0 font-slab
                     shadow-btn-primary disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create my cookbook →"}
        </Button>
      </div>
    </div>
  );
}

function StepThree({
  cookbookName,
  slug,
  onGo,
}: {
  cookbookName: string;
  slug: string;
  onGo: () => void;
}) {
  return (
    <div className="text-center space-y-5">
      <div className="text-5xl">📖</div>
      <div>
        <h2 className="font-slab text-xl text-ink font-semibold">
          {cookbookName} is ready!
        </h2>
        <p className="font-sans text-sm text-ink/60 mt-2">
          Your cookbook lives at:
        </p>
        <p className="font-mono text-sm text-accent mt-1 break-all">
          myfamilyrecipes.com/{slug}
        </p>
      </div>
      <p className="font-sans text-sm text-ink/60">
        Start adding recipes, then invite your family to contribute.
      </p>
      <Button
        type="button"
        onClick={onGo}
        className="w-full bg-accent hover:bg-accent/90 text-cream-0 font-slab
                   shadow-btn-primary"
      >
        Go to my cookbook →
      </Button>
    </div>
  );
}
