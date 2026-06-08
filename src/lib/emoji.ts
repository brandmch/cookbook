export const categoryEmojis: Record<string, string> = {
  desserts:  "🍰",
  mains:     "🍽️",
  sides:     "🥗",
  holiday:   "🎄",
  drinks:    "🍹",
  breakfast: "🥞",
  soups:     "🍲",
  snacks:    "🍿",
  bbq:       "🔥",
  seafood:   "🦞",
  pasta:     "🍝",
  salads:    "🥙",
  baking:    "🧁",
  other:     "🍴",
}

export function getEmojiForCategory(category: string): string {
  return categoryEmojis[category.toLowerCase()] ?? "🍴"
}
