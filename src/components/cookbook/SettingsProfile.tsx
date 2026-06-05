"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  currentName: string | null;
  email: string;
};

export default function SettingsProfile({ currentName, email }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentName ?? "");
  const [savedName, setSavedName] = useState(currentName ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) { setError("Name is required."); return; }
    if (trimmed.length > 100) { setError("Name must be 100 characters or fewer."); return; }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setSavedName(data.name);
      setName(data.name);
      setEditing(false);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setName(savedName);
    setError("");
    setEditing(false);
  }

  return (
    <section className="mb-10">
      <p className="font-mono text-[10px] eyebrow tracking-widest text-ink/40 mb-4">
        Your Profile
      </p>

      <div className="bg-cream-0 rounded-lg border border-line p-5 space-y-4">
        <div className="space-y-1.5">
          <Label className="font-mono text-[10px] eyebrow tracking-widest text-ink/40">Email</Label>
          <p className="font-sans text-sm text-ink-soft">{email}</p>
        </div>

        <div className="space-y-1.5">
          <Label className="font-mono text-[10px] eyebrow tracking-widest text-ink/40">Display name</Label>
          {editing ? (
            <div className="space-y-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
                maxLength={100}
                autoFocus
                className="font-sans text-sm text-ink border-ink/20 bg-cream-1 focus:border-accent"
              />
              {error && <p className="font-sans text-xs text-red-600">{error}</p>}
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="h-8 px-3 bg-accent hover:bg-accent/90 text-cream-0 font-slab text-sm shadow-btn-primary disabled:opacity-50"
                >
                  {loading ? "Saving…" : "Save"}
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={loading}
                  variant="ghost"
                  className="h-8 px-3 font-slab text-sm text-ink/60 hover:text-ink"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <p className="font-slab text-sm font-semibold text-ink">
                {savedName || <span className="text-ink/40 font-normal">—</span>}
              </p>
              <button
                onClick={() => setEditing(true)}
                className="font-sans text-xs text-accent hover:text-accent/80 transition-colors"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
