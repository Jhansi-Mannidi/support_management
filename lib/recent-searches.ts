const STORAGE_KEY = 'voltuswave-recent-searches'
const MAX_ITEMS = 8

export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : []
  } catch {
    return []
  }
}

export function addRecentSearch(query: string): string[] {
  const trimmed = query.trim()
  if (!trimmed || typeof window === 'undefined') return getRecentSearches()
  const next = [trimmed, ...getRecentSearches().filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_ITEMS)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export function clearRecentSearches(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
