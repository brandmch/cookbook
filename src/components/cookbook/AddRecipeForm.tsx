"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CATEGORIES = ["Mains", "Sides", "Desserts", "Breakfast", "Holiday", "Drinks", "Baking"];

type IngredientRow = { key: string; quantity: string; unit: string; label: string };
type StepRow = { key: string; text: string };

function useRowList<T extends { key: string }>(initial: T[]) {
  const [rows, setRows] = useState<T[]>(initial);
  const counter = useRef(initial.length);

  function newKey() {
    return String(++counter.current);
  }

  function add(row: Omit<T, "key">) {
    setRows((prev) => [...prev, { ...row, key: newKey() } as T]);
  }

  function remove(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  function update(key: string, patch: Partial<T>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  return { rows, add, remove, update, setRows };
}

type InitialValues = {
  title: string;
  category: string;
  story: string;
  serves: number;
  time: string;
  ingredients: { quantity: string; unit: string; label: string }[];
  steps: { text: string }[];
};

type Props = {
  cookbookSlug: string;
  recipeId?: string;
  initialValues?: InitialValues;
};

export default function AddRecipeForm({ cookbookSlug, recipeId, initialValues }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [category, setCategory] = useState(initialValues?.category ?? "Mains");
  const [story, setStory] = useState(initialValues?.story ?? "");
  const [serves, setServes] = useState(initialValues?.serves ?? 4);
  const [time, setTime] = useState(initialValues?.time ?? "");

  const ingredients = useRowList<IngredientRow>(
    initialValues?.ingredients.length
      ? initialValues.ingredients.map((i, idx) => ({ key: String(idx + 1), ...i }))
      : [{ key: "1", quantity: "", unit: "", label: "" }],
  );
  const steps = useRowList<StepRow>(
    initialValues?.steps.length
      ? initialValues.steps.map((s, idx) => ({ key: String(idx + 1), text: s.text }))
      : [{ key: "1", text: "" }],
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError("");

    try {
      const isEdit = Boolean(recipeId);
      const res = await fetch(isEdit ? `/api/recipes/${recipeId}` : "/api/recipes", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cookbookSlug,
          title,
          category,
          story,
          serves,
          time,
          ingredients: ingredients.rows,
          steps: steps.rows,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      router.push(`/${cookbookSlug}/${data.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isEdit = Boolean(recipeId);

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl px-4 sm:px-6 py-8 space-y-8 view-enter">
      {/* Back link */}
      <a
        href={isEdit ? `/${cookbookSlug}/${recipeId}` : `/${cookbookSlug}`}
        className="inline-block font-sans text-sm text-ink/50 hover:text-ink transition-colors"
      >
        ← {isEdit ? "Back to recipe" : "Back to cookbook"}
      </a>

      <div>
        <p className="eyebrow text-ink/40 mb-1">{isEdit ? "Edit recipe" : "New recipe"}</p>
        <h1 className="font-hand text-4xl text-ink">
          {isEdit ? "Make some changes" : "What are you making?"}
        </h1>
      </div>

      {/* ── Section 1: Basics ─────────────────────────────── */}
      <Section title="The basics">
        <div className="space-y-2">
          <Label htmlFor="title" className="font-slab text-sm text-ink/80">
            Recipe name
          </Label>
          <Input
            id="title"
            type="text"
            autoFocus
            placeholder="Grandma's Apple Pie"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="field text-base"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label className="font-slab text-sm text-ink/80">Category</Label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`font-mono text-[11px] tracking-wide uppercase px-3 py-1 rounded-pill transition-colors ${
                  category === cat
                    ? "bg-ink text-cream-0"
                    : "bg-cream-1 text-ink-soft hover:bg-cream-2 border border-line"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Serves + Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="serves" className="font-slab text-sm text-ink/80">
              Serves
            </Label>
            <Input
              id="serves"
              type="number"
              min={1}
              max={100}
              value={serves}
              onChange={(e) => setServes(Number(e.target.value))}
              className="field"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time" className="font-slab text-sm text-ink/80">
              Time{" "}
              <span className="font-sans text-ink/40 text-xs">(optional)</span>
            </Label>
            <Input
              id="time"
              type="text"
              placeholder="45 min"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="field"
            />
          </div>
        </div>
      </Section>

      {/* ── Section 2: Story ──────────────────────────────── */}
      <Section title="The story">
        <div className="space-y-2">
          <Label htmlFor="story" className="font-slab text-sm text-ink/80">
            A little background{" "}
            <span className="font-sans text-ink/40 text-xs">(optional)</span>
          </Label>
          <Textarea
            id="story"
            placeholder="Where this recipe came from, a memory, or why it's special…"
            value={story}
            onChange={(e) => setStory(e.target.value)}
            rows={3}
            className="field resize-none"
          />
        </div>
      </Section>

      {/* ── Section 3: Ingredients ────────────────────────── */}
      <Section title="Ingredients">
        <div className="space-y-2">
          {/* Column headers */}
          <div className="grid grid-cols-[80px_80px_1fr_28px] gap-2 px-0.5">
            <span className="font-mono text-[10px] eyebrow text-ink/40">Qty</span>
            <span className="font-mono text-[10px] eyebrow text-ink/40">Unit</span>
            <span className="font-mono text-[10px] eyebrow text-ink/40">Ingredient</span>
            <span />
          </div>

          {ingredients.rows.map((row, idx) => (
            <div key={row.key} className="grid grid-cols-[80px_80px_1fr_28px] gap-2 items-center">
              <Input
                type="text"
                placeholder="2"
                value={row.quantity}
                onChange={(e) => ingredients.update(row.key, { quantity: e.target.value })}
                className="field text-sm h-8 px-2"
              />
              <Input
                type="text"
                placeholder="cups"
                value={row.unit}
                onChange={(e) => ingredients.update(row.key, { unit: e.target.value })}
                className="field text-sm h-8 px-2"
              />
              <Input
                type="text"
                placeholder="all-purpose flour"
                value={row.label}
                onChange={(e) => ingredients.update(row.key, { label: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    ingredients.add({ quantity: "", unit: "", label: "" });
                  }
                }}
                className="field text-sm h-8 px-2"
              />
              <button
                type="button"
                onClick={() => ingredients.rows.length > 1 && ingredients.remove(row.key)}
                disabled={ingredients.rows.length === 1}
                className="text-ink/30 hover:text-accent disabled:opacity-20 transition-colors text-lg leading-none"
                aria-label={`Remove ingredient ${idx + 1}`}
              >
                ×
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => ingredients.add({ quantity: "", unit: "", label: "" })}
            className="font-sans text-sm text-accent hover:text-accent/80 transition-colors mt-1"
          >
            + Add ingredient
          </button>
        </div>
      </Section>

      {/* ── Section 4: Steps ──────────────────────────────── */}
      <Section title="How to make it">
        <div className="space-y-3">
          {steps.rows.map((row, idx) => (
            <div key={row.key} className="flex gap-2 items-start">
              <span className="font-slab text-sm text-ink/40 mt-2 w-5 shrink-0 text-right">
                {idx + 1}.
              </span>
              <Textarea
                placeholder={idx === 0 ? "Preheat the oven to 375°F…" : "Then…"}
                value={row.text}
                onChange={(e) => steps.update(row.key, { text: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    steps.add({ text: "" });
                  }
                }}
                rows={2}
                className="field text-sm resize-none flex-1"
              />
              <button
                type="button"
                onClick={() => steps.rows.length > 1 && steps.remove(row.key)}
                disabled={steps.rows.length === 1}
                className="text-ink/30 hover:text-accent disabled:opacity-20 transition-colors text-lg leading-none mt-2"
                aria-label={`Remove step ${idx + 1}`}
              >
                ×
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => steps.add({ text: "" })}
            className="font-sans text-sm text-accent hover:text-accent/80 transition-colors ml-7"
          >
            + Add step
          </button>
        </div>
      </Section>

      {/* ── Submit ────────────────────────────────────────── */}
      {error && <p className="font-sans text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 pb-12">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push(isEdit ? `/${cookbookSlug}/${recipeId}` : `/${cookbookSlug}`)}
          className="font-slab"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || !title.trim()}
          className="flex-1 bg-accent hover:bg-accent/90 text-cream-0 font-slab shadow-btn-primary disabled:opacity-50"
        >
          {loading ? "Saving…" : isEdit ? "Save changes →" : "Save recipe →"}
        </Button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="idxcard p-6 space-y-5">
      <h2 className="font-slab text-base font-semibold text-ink border-b border-line pb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}
