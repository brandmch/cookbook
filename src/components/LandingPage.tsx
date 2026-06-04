import Link from "next/link";
import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { Bookmark, Mail, Users, ArrowRight } from "lucide-react";

// ── Design tokens ─────────────────────────────────────────────────

const C = {
  cream0:      "#faf4e6",
  cream1:      "#f3ead6",
  cream2:      "#ece0c8",
  cream3:      "#e2d3b6",
  ink:         "#3a2c20",
  inkSoft:     "#6e5a48",
  inkFaint:    "#9a866f",
  accent:      "#bf6243",
  accentDeep:  "#9c4a30",
  secondary:   "#7c8a5b",
  honey:       "#c9a24a",
} as const;

const F = {
  slab: '"Zilla Slab", Georgia, serif',
  hand: '"Caveat", "Segoe Script", cursive',
  mono: "ui-monospace, monospace",
  sans: '"Nunito Sans", system-ui, sans-serif',
} as const;

// ── Data ──────────────────────────────────────────────────────────

const CATS = {
  mains:     { label: "Mains",     tone: C.accent,    cls: "stamp-mains" },
  sides:     { label: "Sides",     tone: C.secondary, cls: "stamp-sides" },
  desserts:  { label: "Desserts",  tone: "#cf8a6a",   cls: "stamp-desserts" },
  breakfast: { label: "Breakfast", tone: C.honey,     cls: "stamp-breakfast" },
  holiday:   { label: "Holiday",   tone: "#a8503f",   cls: "stamp-holiday" },
  drinks:    { label: "Drinks",    tone: "#5f8a82",   cls: "stamp-drinks" },
  baking:    { label: "Baking",    tone: "#b0844c",   cls: "stamp-baking" },
} as const;

type Category = keyof typeof CATS;

interface Recipe {
  id: number;
  title: string;
  category: Category;
  contributor: string;
  initials: string;
  ingredients: string[];
}

const RECIPES: Recipe[] = [
  { id: 1,  title: "Grandma's Apple Pie",     category: "desserts",  contributor: "Grandma Rose",  initials: "GR", ingredients: ["4 Granny Smiths, peeled", "1 cup brown sugar", "2 tsp cinnamon", "Butter crust"] },
  { id: 2,  title: "Sunday Pot Roast",         category: "mains",     contributor: "Uncle Steve",   initials: "US", ingredients: ["3 lb chuck roast", "Carrots & potatoes", "Fresh rosemary", "Beef broth, 2 cups"] },
  { id: 3,  title: "Blueberry Muffins",        category: "baking",    contributor: "Aunt Nancy",    initials: "AN", ingredients: ["2 cups flour", "1 cup blueberries", "Buttermilk", "Lemon zest"] },
  { id: 4,  title: "Chicken Noodle Soup",      category: "mains",     contributor: "Mom",           initials: "MK", ingredients: ["1 whole chicken", "Egg noodles", "Celery & carrots", "Bay leaves"] },
  { id: 5,  title: "Banana Bread",             category: "baking",    contributor: "Grandma Rose",  initials: "GR", ingredients: ["3 ripe bananas", "½ cup butter", "1 cup sugar", "1 tsp vanilla"] },
  { id: 6,  title: "Lemon Bars",               category: "desserts",  contributor: "Aunt Nancy",    initials: "AN", ingredients: ["Shortbread crust", "4 lemons, zested", "3 eggs", "Powdered sugar"] },
  { id: 7,  title: "French Toast Casserole",   category: "breakfast", contributor: "Uncle Steve",   initials: "US", ingredients: ["1 loaf brioche", "6 eggs", "Maple syrup", "Cinnamon sugar"] },
  { id: 8,  title: "Creamy Tomato Bisque",     category: "sides",     contributor: "Mom",           initials: "MK", ingredients: ["San Marzano tomatoes", "Heavy cream", "Fresh basil", "Gruyère"] },
  { id: 9,  title: "Christmas Sugar Cookies",  category: "holiday",   contributor: "Grandma Rose",  initials: "GR", ingredients: ["2¼ cups flour", "1 cup butter", "Royal icing", "Sprinkles"] },
  { id: 10, title: "Aunt Rosa's Lemonade",     category: "drinks",    contributor: "Aunt Nancy",    initials: "AN", ingredients: ["6 lemons, juiced", "1 cup simple syrup", "Sparkling water", "Fresh mint"] },
];

// ── Shared primitives ─────────────────────────────────────────────

function Ornament({ size = 24, color = C.ink }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d="M12 3c0 4.2-2.8 6-6 6 3.2 0 6 2.8 6 6 0-3.2 2.8-6 6-6-3.2 0-6-2.8-6-6z" />
      <path d="M12 9c0 2.4-2.4 3-3 3 .6 0 3 .6 3 3 0-2.4 2.4-3 3-3-.6 0-3-.6-3-3z" opacity=".3" />
    </svg>
  );
}

function CbAvatar({
  initials,
  size = 32,
  tone = C.accent,
  ring = false,
}: {
  initials: string;
  size?: number;
  tone?: string;
  ring?: boolean;
}) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%", background: tone,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: Math.round(size * 0.38), fontWeight: 700, color: "#fff7ec",
        fontFamily: F.slab, flexShrink: 0, boxSizing: "border-box",
        border: ring ? `2px solid ${C.cream1}` : "none",
      }}
    >
      {initials}
    </div>
  );
}

function RecipeCard({
  recipe,
  variant,
  compact,
}: {
  recipe: Recipe;
  variant: "photo" | "text";
  compact?: boolean;
}) {
  const cat = CATS[recipe.category];
  return (
    <div
      style={{
        background: C.cream0,
        borderRadius: 3,
        boxShadow: "0 1px 0 #fff inset, 0 2px 5px rgba(58,44,32,.10), 0 14px 28px -18px rgba(58,44,32,.45)",
        position: "relative",
      }}
    >
      {!compact && (
        <div className="tape" style={{ top: -11, left: "calc(50% - 43px)" }} />
      )}

      {variant === "photo" && (
        <div
          className="photo-slot"
          style={{ height: compact ? 100 : 140, width: "100%", borderRadius: "3px 3px 0 0" }}
        />
      )}

      <div style={{ padding: compact ? "10px 12px 12px" : "14px 16px 18px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: variant === "text" ? 10 : 8 }}>
          <p style={{ flex: 1, margin: 0, fontSize: compact ? 14 : 19, color: C.ink, lineHeight: 1.2, fontFamily: F.hand, fontWeight: 600 }}>
            {recipe.title}
          </p>
          <span className={`cat-stamp ${cat.cls}`} style={{ flexShrink: 0, marginTop: 2 }}>
            {cat.label}
          </span>
        </div>

        {variant === "text" && (
          <div className="ruled" style={{ padding: "4px 0" }}>
            <ul style={{ margin: 0, padding: "0 0 0 4px", listStyle: "none" }}>
              {recipe.ingredients.map((ing) => (
                <li key={ing} style={{ fontSize: 11, color: C.inkSoft, lineHeight: "22px", fontFamily: F.sans }}>
                  {ing}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!compact && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
            <CbAvatar initials={recipe.initials} size={18} tone={cat.tone} />
            <span style={{ fontSize: 11, color: C.inkFaint, letterSpacing: "0.08em", fontFamily: F.mono }}>
              {recipe.contributor}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Landing sections ──────────────────────────────────────────────

function LandingNav() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "22px 56px", borderBottom: `1px solid ${C.cream3}`, background: C.cream0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        <div style={{ width: 38, height: 38, borderRadius: 9, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 2px 0 ${C.accentDeep}` }}>
          <Ornament size={20} color="#fff7ec" />
        </div>
        <span style={{ fontSize: 21, fontWeight: 700, color: C.ink, fontFamily: F.slab }}>myfamilyrecipes</span>
      </div>
      <div style={{ flex: 1 }} />
      <nav style={{ display: "flex", gap: 30 }}>
        {["How it works", "Stories", "Pricing"].map((l) => (
          <span key={l} style={{ fontSize: 16, color: C.inkSoft, fontWeight: 500, fontFamily: F.slab, cursor: "pointer" }}>{l}</span>
        ))}
      </nav>
      <Link href="/login" style={{ fontSize: 16, color: C.ink, fontWeight: 600, marginLeft: 10, fontFamily: F.slab, textDecoration: "none" }}>
        Log in
      </Link>
      <Link href="/login">
        <button style={{ fontSize: 15, padding: "11px 20px", background: C.accent, color: "#fff7ec", border: "none", borderRadius: 6, fontFamily: F.slab, fontWeight: 700, cursor: "pointer", boxShadow: `0 2px 0 ${C.accentDeep}, 0 6px 16px -6px ${C.accentDeep}` }}>
          Start your cookbook
        </button>
      </Link>
    </div>
  );
}

function StepCard({ n, Icon: IconComp, title, body, tone }: { n: string; Icon: LucideIcon; title: string; body: string; tone: string }) {
  return (
    <div style={{ flex: 1, textAlign: "center", padding: "0 18px" }}>
      <div style={{ position: "relative", width: 78, height: 78, margin: "0 auto 20px" }}>
        <div style={{ width: 78, height: 78, borderRadius: "50%", background: tone, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 0 rgba(0,0,0,.12)" }}>
          <IconComp size={32} color="#fff7ec" strokeWidth={1.8} />
        </div>
        <div style={{ position: "absolute", top: -10, right: -6, fontSize: 40, color: C.ink, opacity: 0.22, fontWeight: 700, fontFamily: F.hand, lineHeight: 1 }}>
          {n}
        </div>
      </div>
      <h3 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 700, color: C.ink, fontFamily: F.slab }}>{title}</h3>
      <p style={{ margin: 0, fontSize: 16, color: C.inkSoft, lineHeight: 1.55, maxWidth: 280, marginInline: "auto" }}>{body}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────

export function LandingPage() {
  const heroCards = [RECIPES[0], RECIPES[6], RECIPES[2]];
  const wallCards = [RECIPES[0], RECIPES[1], RECIPES[6], RECIPES[8]];
  const avatarRows: { initials: string; tone: string }[] = [
    { initials: "GR", tone: CATS.desserts.tone },
    { initials: "US", tone: CATS.mains.tone },
    { initials: "AN", tone: CATS.baking.tone },
    { initials: "MK", tone: CATS.sides.tone },
  ];

  const btnPrimary: CSSProperties = {
    fontSize: 18, padding: "15px 26px", background: C.accent, color: "#fff7ec",
    border: "none", borderRadius: 6, fontFamily: F.slab, fontWeight: 700,
    cursor: "pointer", boxShadow: `0 2px 0 ${C.accentDeep}, 0 6px 16px -6px ${C.accentDeep}`,
    display: "inline-flex", alignItems: "center", gap: 8,
  };
  const btnGhost: CSSProperties = {
    fontSize: 17, padding: "15px 22px", background: "transparent", color: C.ink,
    border: `1px solid ${C.cream3}`, borderRadius: 6, fontFamily: F.slab,
    fontWeight: 600, cursor: "pointer",
  };

  return (
    <div className="paper" style={{ minWidth: 320, background: C.cream1 }}>
      <LandingNav />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, padding: "64px 56px 70px", alignItems: "center" }}>
        {/* Left */}
        <div>
          <p className="eyebrow" style={{ marginBottom: 16 }}>A private cookbook for your family</p>
          <h1 style={{ margin: 0, lineHeight: 0.96 }}>
            <span style={{ display: "block", fontSize: 58, fontWeight: 700, color: C.ink, letterSpacing: "-.01em", fontFamily: F.slab }}>
              Every family has a recipe
            </span>
            <span style={{ display: "block", fontSize: 86, fontWeight: 700, color: C.accent, lineHeight: 0.9, marginTop: 4, fontFamily: F.hand }}>
              worth keeping.
            </span>
          </h1>
          <p style={{ margin: "24px 0 32px", fontSize: 19, lineHeight: 1.6, color: C.inkSoft, maxWidth: 470 }}>
            Start a private cookbook, invite the people you cook for, and gather the recipes that get passed around the table — stories, splatters and all — in one warm place.
          </p>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <Link href="/login">
              <button style={btnPrimary}>
                Start your cookbook <ArrowRight size={19} color="#fff7ec" />
              </button>
            </Link>
            <button style={btnGhost}>See how it works</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 30 }}>
            <div style={{ display: "flex" }}>
              {avatarRows.map((a, i) => (
                <div key={a.initials} style={{ marginLeft: i ? -10 : 0 }}>
                  <CbAvatar initials={a.initials} size={34} tone={a.tone} ring />
                </div>
              ))}
            </div>
            <span style={{ fontSize: 15, fontStyle: "italic", color: C.inkSoft, fontFamily: F.slab }}>
              Loved by 12,000+ families keeping the good stuff.
            </span>
          </div>
        </div>

        {/* Right: card collage */}
        <div style={{ position: "relative", height: 460 }}>
          <div style={{ position: "absolute", top: 0, left: 30, width: 300, transform: "rotate(-4deg)" }}>
            <RecipeCard recipe={heroCards[0]} variant="photo" />
          </div>
          <div style={{ position: "absolute", top: 70, right: 8, width: 300, transform: "rotate(5deg)", zIndex: 2 }}>
            <RecipeCard recipe={heroCards[1]} variant="text" />
          </div>
          <div style={{ position: "absolute", bottom: -36, left: 70, width: 290, transform: "rotate(2deg)", zIndex: 3 }}>
            <RecipeCard recipe={heroCards[2]} variant="photo" />
          </div>
        </div>
      </div>

      {/* ── How it works ─────────────────────────────────────── */}
      <div style={{ background: C.cream2, padding: "60px 56px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p className="eyebrow" style={{ marginBottom: 10 }}>How it works</p>
          <h2 style={{ margin: 0, fontSize: 40, fontWeight: 700, color: C.ink, fontFamily: F.slab }}>Three steps to a fuller table</h2>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <StepCard n="1" Icon={Bookmark} tone={C.accent}    title="Create"         body="Name your cookbook and claim your family's link in under a minute." />
          <StepCard n="2" Icon={Mail}     tone={C.secondary} title="Invite"          body="Bring in parents, cousins and that one aunt who never shares her secret." />
          <StepCard n="3" Icon={Users}    tone={C.honey}     title="Cook together"   body="Add recipes with the stories behind them, and cook from any kitchen." />
        </div>
      </div>

      {/* ── Wall preview ──────────────────────────────────────── */}
      <div style={{ padding: "70px 56px 40px", textAlign: "center" }}>
        <p className="eyebrow" style={{ marginBottom: 10 }}>Your family&apos;s wall</p>
        <h2 style={{ margin: "0 0 8px", fontSize: 40, fontWeight: 700, color: C.ink, fontFamily: F.slab }}>Everything in one warm place</h2>
        <p style={{ margin: "0 auto 40px", fontSize: 18, color: C.inkSoft, maxWidth: 540 }}>
          A wall of index cards you can search, filter and scale — each one carrying a recipe and the memory attached to it.
        </p>
        {/* Browser mockup */}
        <div style={{ borderRadius: 14, overflow: "hidden", boxShadow: `0 30px 60px -30px rgba(58,44,32,.5), 0 0 0 1px ${C.cream3}`, textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: C.cream0, borderBottom: `1px solid ${C.cream3}` }}>
            <div style={{ display: "flex", gap: 7 }}>
              {["#d98b76", "#d9c07a", "#9fae7e"].map((col) => (
                <div key={col} style={{ width: 12, height: 12, borderRadius: "50%", background: col }} />
              ))}
            </div>
            <div style={{ margin: "0 auto", fontSize: 12, color: C.inkFaint, background: C.cream1, padding: "4px 16px", borderRadius: 6, fontFamily: F.mono }}>
              myfamilyrecipes.com/hartwell
            </div>
          </div>
          <div style={{ background: C.cream1, padding: 28, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {wallCards.map((r) => (
              <RecipeCard key={r.id} recipe={r} variant="photo" compact />
            ))}
          </div>
        </div>
      </div>

      {/* ── Testimonial quote ────────────────────────────────── */}
      <div style={{ padding: "40px 56px 76px" }}>
        <div
          className="idxcard ruled"
          style={{ maxWidth: 760, margin: "0 auto", padding: "40px 48px", textAlign: "center", position: "relative" }}
        >
          <div className="tape" style={{ top: -11, left: "50%", marginLeft: -43, transform: "rotate(-2deg)" }} />
          <p style={{ margin: 0, fontSize: 26, lineHeight: 1.45, color: C.ink, fontStyle: "italic", fontFamily: F.slab }}>
            &ldquo;My grandmother&apos;s handwriting was fading on the index cards. Now her apple pie lives where my whole family can find it — splatters and all.&rdquo;
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 22 }}>
            <CbAvatar initials="MK" size={36} tone={C.accent} />
            <span style={{ fontSize: 26, color: C.accentDeep, fontFamily: F.hand, fontWeight: 600 }}>
              Maggie, The Hartwell Family Kitchen
            </span>
          </div>
        </div>
      </div>

      {/* ── Closing CTA ──────────────────────────────────────── */}
      <div style={{ background: C.accentDeep, padding: "64px 56px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <h2 style={{ margin: 0, fontSize: 60, fontWeight: 700, color: "#fff", lineHeight: 0.92, fontFamily: F.hand }}>
          Start the cookbook your family will keep.
        </h2>
        <p style={{ margin: "16px auto 30px", fontSize: 18, color: "rgba(251,238,222,.85)", maxWidth: 480 }}>
          Free to start. Private by default. Yours forever.
        </p>
        <Link href="/login">
          <button style={{ fontSize: 18, padding: "16px 30px", background: C.cream0, color: C.accentDeep, border: "none", borderRadius: 6, fontFamily: F.slab, fontWeight: 700, cursor: "pointer", boxShadow: "0 3px 0 rgba(0,0,0,.2)", display: "inline-flex", alignItems: "center", gap: 8 }}>
            Create your free cookbook <ArrowRight size={19} color={C.accentDeep} />
          </button>
        </Link>
      </div>

      {/* ── Footer ───────────────────────────────────────────── */}
      <div style={{ padding: "44px 56px", background: C.cream0, borderTop: `1px solid ${C.cream3}`, display: "flex", gap: 40 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <Ornament size={22} color={C.ink} />
            <span style={{ fontSize: 18, fontWeight: 700, color: C.ink, fontFamily: F.slab }}>myfamilyrecipes</span>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: C.inkFaint, maxWidth: 260 }}>
            Keeping family recipes — and the stories behind them — since 2026.
          </p>
        </div>
        {([
          ["Product", ["How it works", "Pricing", "Sign up", "Log in"]],
          ["Company", ["Our story", "Journal", "Contact"]],
          ["Legal",   ["Privacy", "Terms"]],
        ] as [string, string[]][]).map(([h, links]) => (
          <div key={h} style={{ minWidth: 130 }}>
            <p className="eyebrow" style={{ marginBottom: 12 }}>{h}</p>
            {links.map((l) => (
              <div key={l} style={{ fontSize: 15, color: C.inkSoft, marginBottom: 9, fontFamily: F.slab }}>{l}</div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ padding: "16px 56px", background: C.cream0, borderTop: `1px solid ${C.cream3}` }}>
        <span style={{ fontSize: 12, color: C.inkFaint, fontFamily: F.mono }}>
          © 2026 myfamilyrecipes.com · Made at the kitchen table
        </span>
      </div>
    </div>
  );
}
