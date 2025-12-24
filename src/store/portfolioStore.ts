export type Position = {
  symbol: string;
  quantity: number; // positive for long; support decimals
  avgCost: number; // per-share average cost
  /** Optional note. Omit property if empty for exactOptionalPropertyTypes */
  note?: string;
  createdAt: number;
  updatedAt: number;
};

export type PortfolioState = {
  positions: Record<string, Position>;
  order: string[]; // simple order for listing
  /** Mock last prices map; editable by user on the Portfolio page. */
  lastPrices: Record<string, number>;
};

export type PortfolioSortMode = "symbol" | "pnl";

/**
 * LocalStorage key for portfolio persistence.
 */
export const PORTFOLIO_STORAGE_KEY = "portfolio.v1";

const SYMBOL_REGEX = /^[A-Z0-9.\-]+$/;

/**
 * Normalize symbol by trimming and uppercasing.
 */
function normalizeSymbol(input: string): string {
  return input.trim().toUpperCase();
}

/**
 * Validate symbol format against rules.
 */
// PUBLIC_INTERFACE
export function validatePortfolioSymbol(input: string): { valid: boolean; reason?: string } {
  /** Validates portfolio symbol string. */
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
 * Safe read/write LocalStorage helpers.
 */
function readLS(): PortfolioState {
  try {
    const raw = window.localStorage.getItem(PORTFOLIO_STORAGE_KEY);
    if (!raw) return { positions: {}, order: [], lastPrices: {} };
    const parsed = JSON.parse(raw) as Partial<PortfolioState>;
    const positions = (parsed?.positions && typeof parsed.positions === "object" ? parsed.positions : {}) as Record<
      string,
      Position
    >;
    const order = Array.isArray(parsed?.order) ? parsed!.order : Object.keys(positions);
    const lastPrices = (parsed?.lastPrices && typeof parsed.lastPrices === "object"
      ? parsed.lastPrices
      : {}) as Record<string, number>;

    // tidy order to existing keys
    const unique = Array.from(new Set(order.filter((s) => s in positions)));
    const missing = Object.keys(positions).filter((k) => !unique.includes(k));
    return { positions, order: [...unique, ...missing], lastPrices };
  } catch {
    return { positions: {}, order: [], lastPrices: {} };
  }
}

function writeLS(state: PortfolioState): void {
  try {
    window.localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // swallow
  }
}

/**
 * PUBLIC_INTERFACE
 * Returns the current portfolio state (from LocalStorage).
 */
// PUBLIC_INTERFACE
export function getPortfolioState(): PortfolioState {
  /** Load portfolio state from LocalStorage with shape guards. */
  return readLS();
}

/**
 * PUBLIC_INTERFACE
 * Add a position. If symbol exists, this will merge by recalculating weighted avg cost and quantity.
 */
// PUBLIC_INTERFACE
export function addOrMergePosition(input: {
  symbol: string;
  quantity: number;
  avgCost: number;
  note?: string;
}): { ok: true; state: PortfolioState } | { ok: false; error: string } {
  /** Adds a position or merges into existing by computing weighted average. */
  const symbol = normalizeSymbol(input.symbol);
  const v = validatePortfolioSymbol(symbol);
  if (!v.valid) return { ok: false, error: v.reason ?? "Invalid symbol." };

  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    return { ok: false, error: "Quantity must be a positive number." };
  }
  if (!Number.isFinite(input.avgCost) || input.avgCost <= 0) {
    return { ok: false, error: "Average cost must be a positive number." };
  }

  const state = readLS();
  const now = Date.now();
  const existing = state.positions[symbol];

  let nextPositions = { ...state.positions };
  let nextOrder = [...state.order];

  if (existing) {
    // Merge: new total qty and recalculated avg cost
    const newQty = existing.quantity + input.quantity;
    const newInvested = existing.quantity * existing.avgCost + input.quantity * input.avgCost;
    const newAvgCost = newInvested / newQty;
    const trimmedNote = input.note?.trim();
    const base = {
      symbol,
      quantity: newQty,
      avgCost: Number(newAvgCost.toFixed(6)),
      createdAt: existing.createdAt,
      updatedAt: now,
    } as Position;

    nextPositions[symbol] = trimmedNote ? { ...base, note: trimmedNote } : base;
  } else {
    const trimmedNote = input.note?.trim();
    const base = {
      symbol,
      quantity: input.quantity,
      avgCost: input.avgCost,
      createdAt: now,
      updatedAt: now,
    } as Position;
    nextPositions[symbol] = trimmedNote ? { ...base, note: trimmedNote } : base;
    nextOrder = [...nextOrder, symbol];
  }

  const nextState: PortfolioState = { positions: nextPositions, order: nextOrder, lastPrices: state.lastPrices };
  writeLS(nextState);
  return { ok: true, state: nextState };
}

/**
 * PUBLIC_INTERFACE
 * Update a position: allows renaming symbol, changing quantity/avgCost/note.
 */
// PUBLIC_INTERFACE
export function updatePosition(
  currentSymbol: string,
  updates: Partial<Pick<Position, "symbol" | "quantity" | "avgCost" | "note">>
): { ok: true; state: PortfolioState } | { ok: false; error: string } {
  /** Updates a position with validation; supports renaming with duplicate prevention. */
  const state = readLS();
  const curr = normalizeSymbol(currentSymbol);
  const existing = state.positions[curr];
  if (!existing) return { ok: false, error: "Position not found." };

  let targetSymbol = curr;
  if (typeof updates.symbol === "string" && normalizeSymbol(updates.symbol) !== curr) {
    const ns = normalizeSymbol(updates.symbol);
    const v = validatePortfolioSymbol(ns);
    if (!v.valid) return { ok: false, error: v.reason ?? "Invalid symbol." };
    if (state.positions[ns]) return { ok: false, error: "Another position already uses this symbol." };
    targetSymbol = ns;
  }

  if (typeof updates.quantity !== "undefined") {
    if (!Number.isFinite(updates.quantity) || updates.quantity <= 0) {
      return { ok: false, error: "Quantity must be a positive number." };
    }
  }
  if (typeof updates.avgCost !== "undefined") {
    if (!Number.isFinite(updates.avgCost) || updates.avgCost <= 0) {
      return { ok: false, error: "Average cost must be a positive number." };
    }
  }

  const now = Date.now();

  const nextPositions: Record<string, Position> = { ...state.positions };
  const newNote =
    typeof updates.note === "string"
      ? updates.note.trim()
      : typeof existing.note === "string"
      ? existing.note
      : undefined;
  const base = {
    symbol: targetSymbol,
    quantity: typeof updates.quantity === "number" ? updates.quantity : existing.quantity,
    avgCost: typeof updates.avgCost === "number" ? updates.avgCost : existing.avgCost,
    createdAt: existing.createdAt,
    updatedAt: now,
  } as Position;
  const updated: Position = newNote ? { ...base, note: newNote } : base;

  let nextOrder = [...state.order];
  if (targetSymbol !== curr) {
    delete nextPositions[curr];
    nextPositions[targetSymbol] = updated;
    nextOrder = nextOrder.map((s) => (s === curr ? targetSymbol : s));
  } else {
    nextPositions[curr] = updated;
  }

  const nextState: PortfolioState = { positions: nextPositions, order: nextOrder, lastPrices: state.lastPrices };
  writeLS(nextState);
  return { ok: true, state: nextState };
}

/**
 * PUBLIC_INTERFACE
 * Delete a position.
 */
// PUBLIC_INTERFACE
export function deletePosition(symbolRaw: string): { ok: true; state: PortfolioState } | { ok: false; error: string } {
  /** Deletes a position and returns updated state. */
  const symbol = normalizeSymbol(symbolRaw);
  const state = readLS();
  if (!state.positions[symbol]) return { ok: false, error: "Position not found." };

  const nextPositions = { ...state.positions };
  delete nextPositions[symbol];

  const nextOrder = state.order.filter((s) => s !== symbol);
  const { [symbol]: _, ...nextLast } = state.lastPrices;

  const nextState: PortfolioState = { positions: nextPositions, order: nextOrder, lastPrices: nextLast };
  writeLS(nextState);
  return { ok: true, state: nextState };
}

/**
 * PUBLIC_INTERFACE
 * Set or update last price for a symbol (mock price map).
 */
// PUBLIC_INTERFACE
export function setLastPrice(symbolRaw: string, price: number): { ok: true; state: PortfolioState } | { ok: false; error: string } {
  /** Sets a mock last price for a symbol to recalc P&L. */
  const symbol = normalizeSymbol(symbolRaw);
  const v = validatePortfolioSymbol(symbol);
  if (!v.valid) return { ok: false, error: v.reason ?? "Invalid symbol." };
  if (!Number.isFinite(price) || price < 0) return { ok: false, error: "Price must be a non-negative number." };

  const state = readLS();
  const next: PortfolioState = {
    ...state,
    lastPrices: { ...state.lastPrices, [symbol]: price },
  };
  writeLS(next);
  return { ok: true, state: next };
}

/**
 * PUBLIC_INTERFACE
 * Bulk set prices (replace specific provided keys).
 */
// PUBLIC_INTERFACE
export function setLastPrices(prices: Record<string, number>): { ok: true; state: PortfolioState } | { ok: false; error: string } {
  /** Bulk update multiple last prices. Invalid entries are ignored. */
  const state = readLS();
  const next = { ...state.lastPrices };
  for (const [k, v] of Object.entries(prices)) {
    const sym = normalizeSymbol(k);
    if (!SYMBOL_REGEX.test(sym)) continue;
    if (!Number.isFinite(v) || v < 0) continue;
    next[sym] = v;
  }
  const nextState: PortfolioState = { ...state, lastPrices: next };
  writeLS(nextState);
  return { ok: true, state: nextState };
}

/**
 * Derived calculations
 */
export type PositionComputed = Position & {
  lastPrice: number | null;
  invested: number; // quantity * avgCost
  currentValue: number | null; // quantity * lastPrice
  pnl: number | null; // currentValue - invested
  pnlPercent: number | null; // pnl / invested * 100
};

/**
 * PUBLIC_INTERFACE
 * Compute PositionComputed list using current state and mock prices.
 */
// PUBLIC_INTERFACE
export function selectPositionsComputed(state: PortfolioState): PositionComputed[] {
  /** Returns computed positions including P&L based on lastPrices. */
  return state.order
    .map((s) => state.positions[s])
    .filter((p): p is Position => Boolean(p))
    .map((p) => {
      const lp = state.lastPrices[p.symbol];
      const invested = Number((p.quantity * p.avgCost).toFixed(2));
      if (typeof lp === "number") {
        const currentValue = Number((p.quantity * lp).toFixed(2));
        const pnl = Number((currentValue - invested).toFixed(2));
        const pnlPercent = invested > 0 ? Number(((pnl / invested) * 100).toFixed(2)) : null;
        return {
          ...p,
          lastPrice: lp,
          invested,
          currentValue,
          pnl,
          pnlPercent,
        } as PositionComputed;
      }
      return {
        ...p,
        lastPrice: null,
        invested,
        currentValue: null,
        pnl: null,
        pnlPercent: null,
      } as PositionComputed;
    });
}

/**
 * PUBLIC_INTERFACE
 * Totals for the portfolio.
 */
// PUBLIC_INTERFACE
export function selectTotals(state: PortfolioState): {
  totalInvested: number;
  currentValue: number | null;
  totalPnL: number | null;
  pnlPercent: number | null;
} {
  /** Compute totals across all positions; returns nulls if any price missing for proper semantics. */
  const computed = selectPositionsComputed(state);
  const totalInvested = Number(
    computed.reduce((acc, p) => acc + p.invested, 0).toFixed(2)
  );

  // If any currentValue is null -> totals (except invested) are null; alternatively, compute only for those with price.
  // Requirement: totals across all -> using strict, if any missing price, mark as null to avoid partial misleading totals.
  const hasMissing = computed.some((p) => p.currentValue === null);
  if (hasMissing) {
    return {
      totalInvested,
      currentValue: null,
      totalPnL: null,
      pnlPercent: null,
    };
  }

  const currentValue = Number(
    computed.reduce((acc, p) => acc + (p.currentValue ?? 0), 0).toFixed(2)
  );
  const totalPnL = Number((currentValue - totalInvested).toFixed(2));
  const pnlPercent = totalInvested > 0 ? Number(((totalPnL / totalInvested) * 100).toFixed(2)) : null;
  return { totalInvested, currentValue, totalPnL, pnlPercent };
}

/**
 * PUBLIC_INTERFACE
 * Get positions array sorted by specified mode.
 */
// PUBLIC_INTERFACE
export function selectPositionsSorted(
  state: PortfolioState,
  mode: PortfolioSortMode
): PositionComputed[] {
  /** Returns computed positions sorted by symbol (A-Z) or P&L descending. */
  const items = selectPositionsComputed(state);
  if (mode === "pnl") {
    return [...items].sort((a, b) => {
      const av = a.pnl ?? Number.NEGATIVE_INFINITY;
      const bv = b.pnl ?? Number.NEGATIVE_INFINITY;
      return bv - av; // desc
    });
  }
  return [...items].sort((a, b) => a.symbol.localeCompare(b.symbol));
}
