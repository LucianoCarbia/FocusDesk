export const CATEGORY_PALETTE = [
  '#6366f1', // indigo
  '#f59e0b', // amber
  '#f97316', // orange
  '#8b5cf6', // violet
  '#10b981', // emerald
  '#ec4899', // pink
  '#64748b', // slate
  '#0ea5e9', // sky
  '#ef4444', // red
  '#14b8a6', // teal
]

export function nextPaletteColor(usedColors: string[]): string {
  const unused = CATEGORY_PALETTE.find((color) => !usedColors.includes(color))
  if (unused) return unused
  return CATEGORY_PALETTE[usedColors.length % CATEGORY_PALETTE.length]
}
