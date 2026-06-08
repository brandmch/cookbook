import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    cookbook: {
      findUnique: vi.fn(),
    },
  },
}));

import { generateSlug, createUniqueSlug } from "./slug";
import { db } from "@/lib/db";

const mockFindUnique = db.cookbook.findUnique as ReturnType<typeof vi.fn>;

describe("generateSlug", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(generateSlug("Smith Family Cookbook")).toBe("smith-family-cookbook");
  });

  it("strips apostrophes and punctuation", () => {
    expect(generateSlug("Grandma Rose's Kitchen")).toBe("grandma-roses-kitchen");
  });

  it("strips accent marks via NFD normalization", () => {
    expect(generateSlug("The García Family")).toBe("the-garcia-family");
  });

  it("collapses repeated special chars and trims hyphens", () => {
    expect(generateSlug("  weird---name  ")).toBe("weird-name");
  });

  it("handles leading numbers", () => {
    expect(generateSlug("123 Main Street")).toBe("123-main-street");
  });
});

describe("createUniqueSlug", () => {
  beforeEach(() => {
    mockFindUnique.mockReset();
  });

  it("returns the clean slug when no collision", async () => {
    mockFindUnique.mockResolvedValue(null);
    const slug = await createUniqueSlug("Smith Family Cookbook");
    expect(slug).toBe("smith-family-cookbook");
  });

  it("appends a 4-char suffix on collision", async () => {
    mockFindUnique.mockResolvedValue({ slug: "smith-family-cookbook" });
    const slug = await createUniqueSlug("Smith Family Cookbook");
    expect(slug).toMatch(/^smith-family-cookbook-[a-z0-9]{4}$/);
  });

  it("suffix is alphanumeric only", async () => {
    mockFindUnique.mockResolvedValue({ slug: "test" });
    const slug = await createUniqueSlug("test");
    const suffix = slug.split("-").pop()!;
    expect(suffix).toMatch(/^[a-z0-9]+$/);
    expect(suffix).toHaveLength(4);
  });
});
