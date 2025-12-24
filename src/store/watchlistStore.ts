export type WatchlistItem = {
  symbol: string;
  /**
   * Optional note. With exactOptionalPropertyTypes enabled, absence and undefined differ.
   * We will omit the property when empty; when present, it will be a string.
   */
  note?: string;
  createdAt: number;
  updatedAt: number;
};

export type WatchlistState = {
  items: Record<string, WatchlistItem>;
  order: string[];
};

export type SortMode = "symbol" | "createdAt";

/**
 * LocalStorage key for watchlist persistence versioning.
 */
export const WATCHLIST_STORAGE_KEY = "watchlist.v1";

/**
 * Acceptable symbol regex: uppercase alphanumerics, dot and dash allowed.
 * Trim spaces and coerce to uppercase before validating.
 */
const SYMBOL_REGEX = /^[A-Z0-9.\-]+$/;

/**
 * Read LocalStorage safely with JSON guard and fallback to default state.
 */
function readLS(): WatchlistState {
  try {
    const raw = window.localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!raw) return { items: {}, order: [] };
    const parsed = JSON.parse(raw) as Partial<WatchlistState>;
    // Migration/shape guard
    const items = parsed?.items && typeof parsed.items === "object" ? parsed.items : {};
    const order = Array.isArray(parsed?.order) ? parsed!.order : Object.keys(items);
    // Ensure order contains only keys present in items and without duplicates
    const unique = Array.from(new Set(order.filter((s) => s in (items as Record<string, WatchlistItem>))));
    // Add any missing keys at the end
    const missing = Object.keys(items).filter((k) => !unique.includes(k));
    return { items: items as Record<string, WatchlistItem>, order: [...unique, ...missing] };
  } catch {
    // Corrupted JSON or other error
    return { items: {}, order: [] };
  }
}

/**
 * Write LocalStorage safely, swallowing errors (e.g., quota).
 */
function writeLS(state: WatchlistState): void {
  try {
    window.localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore write errors; consumers may handle UI messaging if needed.
  }
}

/**
 * Normalize symbol by trimming and uppercasing.
 */
function normalizeSymbol(input: string): string {
  return input.trim().toUpperCase();
}

/**
 * Validate symbol format against rules.
 */
export function validateSymbol(input: string): { valid: boolean; reason?: string } {
  const sym = normalizeSymbol(input);
  if (!sym) return { valid: false, reason: "Symbol is required." };
  if (!SYMBOL_REGEX.test(sym)) {
    return {
      valid: false,
      reason: 'Invalid symbol. Use letters, numbers, dot or dash only (e.g., "TCS", "TCS.NS", "M&M").',
    };
  }
  return { valid: true };
}

/**
 * PUBLIC_INTERFACE
 * Get current watchlist state from LocalStorage.
 */
export function getState(): WatchlistState {
  /** Returns the current watchlist state loaded from LocalStorage, migrating mismatched shapes if necessary. */
  return readLS();
}

/**
 * PUBLIC_INTERFACE
 * Add a symbol with an optional note. Prevents duplicates (case-insensitive).
 */
export function addSymbol(rawSymbol: string, note?: string): { ok: true; state: WatchlistState } | { ok: false; error: string } {
  /** Adds a new symbol to the watchlist with validation, returning updated state or an error. */
  const symbol = normalizeSymbol(rawSymbol);
  const v = validateSymbol(symbol);
  if (!v.valid) return { ok: false, error: v.reason ?? "Invalid symbol." };

  const state = readLS();
  if (state.items[symbol]) {
    return { ok: false, error: "This symbol is already in your watchlist." };
  }

  const now = Date.now();
  // Build item without undefined note to satisfy exactOptionalPropertyTypes
  const itemBase = { symbol, createdAt: now, updatedAt: now } as WatchlistItem;
  const trimmed = note?.trim();
  const item: WatchlistItem = trimmed ? { ...itemBase, note: trimmed } : itemBase;
  const next: WatchlistState = {
    items: { ...state.items, [symbol]: item },
    order: [...state.order, symbol],
  };
  writeLS(next);
  return { ok: true, state: next };
}

/**
 * PUBLIC_INTERFACE
 * Update an existing symbol's note and/or rename the symbol (with validation and duplicate prevention).
 */
export function updateSymbol(
  currentSymbol: string,
  updates: { newSymbol?: string; note?: string }
): { ok: true; state: WatchlistState } | { ok: false; error: string } {
  /** Updates the specified symbol's data; supports renaming with validation while preserving timestamps appropriately. */
  const state = readLS();
  const curr = normalizeSymbol(currentSymbol);
  const existing = state.items[curr];
  if (!existing) return { ok: false, error: "Symbol not found." };

  let targetSymbol = curr;
  if (typeof updates.newSymbol === "string" && normalizeSymbol(updates.newSymbol) !== curr) {
    const ns = normalizeSymbol(updates.newSymbol);
    const v = validateSymbol(ns);
    if (!v.valid) return { ok: false, error: v.reason ?? "Invalid symbol." };
    if (state.items[ns]) return { ok: false, error: "Another item already uses this symbol." };
    targetSymbol = ns;
  }

  const nextItems: Record<string, WatchlistItem> = { ...state.items };
  const now = Date.now();

  // Prepare updated item; omit note when empty
  const trimmedNote = typeof updates.note === "string" ? updates.note.trim() : undefined;
  const updatedBase = {
    symbol: targetSymbol,
    createdAt: existing.createdAt,
    updatedAt: now,
  } as WatchlistItem;
  const updated: WatchlistItem =
    typeof trimmedNote === "string"
      ? trimmedNote
        ? { ...updatedBase, note: trimmedNote }
        : updatedBase
      : typeof existing.note === "string"
      ? { ...updatedBase, note: existing.note }
      : updatedBase;

  // If renaming, move key and update order
  let nextOrder = [...state.order];
  if (targetSymbol !== curr) {
    delete nextItems[curr];
    nextItems[targetSymbol] = updated;
    nextOrder = nextOrder.map((s) => (s === curr ? targetSymbol : s));
  } else {
    nextItems[curr] = updated;
  }

  const next: WatchlistState = { items: nextItems, order: nextOrder };
  writeLS(next);
  return { ok: true, state: next };
}

/**
 * PUBLIC_INTERFACE
 * Delete a symbol from the watchlist.
 */
export function deleteSymbol(rawSymbol: string): { ok: true; state: WatchlistState } | { ok: false; error: string } {
  /** Deletes a symbol and returns the updated state or an error if not found. */
  const symbol = normalizeSymbol(rawSymbol);
  const state = readLS();
  if (!state.items[symbol]) return { ok: false, error: "Symbol not found." };

  const nextItems = { ...state.items };
  delete nextItems[symbol];
  const nextOrder = state.order.filter((s) => s !== symbol);
  const next: WatchlistState = { items: nextItems, order: nextOrder };
  writeLS(next);
  return { ok: true, state: next };
}

/**
 * PUBLIC_INTERFACE
 * Reorder the items using a provided array of symbols.
 */
export function reorder(nextOrder: string[]): { ok: true; state: WatchlistState } | { ok: false; error: string } {
  /** Sets a new manual order for the watchlist, ignoring symbols not present and preserving only existing ones. */
  const state = readLS();
  const set = new Set(Object.keys(state.items));
  const filtered = nextOrder.map(normalizeSymbol).filter((s) => set.has(s));
  // Append any missing ones at the end
  for (const k of state.order) {
    if (!filtered.includes(k) && set.has(k)) filtered.push(k);
  }
  const next: WatchlistState = { items: state.items, order: filtered };
  writeLS(next);
  return { ok: true, state: next };
}

/**
 * Helper: Get items in arrays with a given sort mode.
 */
export function selectItemsSorted(state: WatchlistState, mode: SortMode): WatchlistItem[] {
  const items: WatchlistItem[] = state.order
    .map((k) => state.items[k])
    .filter((it): it is WatchlistItem => Boolean(it));
  if (mode === "createdAt") {
    return [...items].sort((a, b) => b.createdAt - a.createdAt);
  }
  // Default: sort by symbol A-Z
  return [...items].sort((a, b) => a.symbol.localeCompare(b.symbol));
}
