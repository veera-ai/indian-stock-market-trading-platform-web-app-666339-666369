import type { JSX } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  addOrMergePosition,
  deletePosition,
  getPortfolioState,
  selectPositionsSorted,
  selectTotals,
  setLastPrice,
  type PortfolioSortMode,
  updatePosition,
  validatePortfolioSymbol,
  type PositionComputed,
} from "../store/portfolioStore";

/**
 * PUBLIC_INTERFACE
 * Portfolio page implements:
 * - CRUD for positions (symbol, quantity, avgCost, optional note)
 * - Editable mock last prices (per-row) to recalc P&L
 * - Derived per-position P&L and overall totals
 * - Sorting by symbol and P&L
 * - LocalStorage persistence with strict TypeScript
 * - Accessible labels and aria-live status messaging
 */
export default function Portfolio(): JSX.Element {
  const [stateVersion, setStateVersion] = useState<number>(0);
  const [sortMode, setSortMode] = useState<PortfolioSortMode>("symbol");

  // Add form
  const [newSymbol, setNewSymbol] = useState<string>("");
  const [newQty, setNewQty] = useState<string>("");
  const [newAvgCost, setNewAvgCost] = useState<string>("");
  const [newNote, setNewNote] = useState<string>("");

  // Messaging
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Edit row tracking
  const [editingSymbol, setEditingSymbol] = useState<string | null>(null);
  const [editSymbol, setEditSymbol] = useState<string>("");
  const [editQty, setEditQty] = useState<string>("");
  const [editAvgCost, setEditAvgCost] = useState<string>("");
  const [editNote, setEditNote] = useState<string>("");

  // Price edit tracking (per row)
  const [priceEdits, setPriceEdits] = useState<Record<string, string>>({});

  const addSymbolRef = useRef<HTMLInputElement>(null);
  const editSymbolRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    addSymbolRef.current?.focus();
  }, []);

  function refresh(): void {
    setStateVersion((v) => v + 1);
  }

  const currentState = useMemo(() => getPortfolioState(), [stateVersion]);
  const positions = useMemo<PositionComputed[]>(
    () => selectPositionsSorted(currentState, sortMode),
    [currentState, sortMode]
  );
  const totals = useMemo(() => selectTotals(currentState), [currentState]);

  function handleAdd(): void {
    setStatus("");
    setError("");
    const symbol = newSymbol.trim().toUpperCase();
    const val = validatePortfolioSymbol(symbol);
    if (!val.valid) {
      setError(val.reason ?? "Invalid symbol.");
      return;
    }
    const qty = Number(newQty);
    const avg = Number(newAvgCost);
    if (!Number.isFinite(qty) || qty <= 0) {
      setError("Quantity must be a positive number.");
      return;
    }
    if (!Number.isFinite(avg) || avg <= 0) {
      setError("Average cost must be a positive number.");
      return;
    }

    const res = addOrMergePosition({ symbol, quantity: qty, avgCost: avg, note: newNote });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setStatus(`Position added/merged for ${symbol}.`);
    setNewSymbol("");
    setNewQty("");
    setNewAvgCost("");
    setNewNote("");
    refresh();
    addSymbolRef.current?.focus();
  }

  function startEdit(symbol: string): void {
    const s = getPortfolioState();
    const p = s.positions[symbol];
    if (!p) return;
    setEditingSymbol(symbol);
    setEditSymbol(p.symbol);
    setEditQty(String(p.quantity));
    setEditAvgCost(String(p.avgCost));
    setEditNote(p.note ?? "");
    setTimeout(() => {
      editSymbolRef.current?.focus();
    }, 0);
  }

  function cancelEdit(): void {
    setEditingSymbol(null);
    setEditSymbol("");
    setEditQty("");
    setEditAvgCost("");
    setEditNote("");
    setStatus("Edit canceled.");
    setError("");
  }

  function saveEdit(): void {
    if (!editingSymbol) return;
    setStatus("");
    setError("");

    const symbol = editSymbol.trim().toUpperCase();
    const val = validatePortfolioSymbol(symbol);
    if (!val.valid) {
      setError(val.reason ?? "Invalid symbol.");
      return;
    }

    const qty = Number(editQty);
    const avg = Number(editAvgCost);
    if (!Number.isFinite(qty) || qty <= 0) {
      setError("Quantity must be a positive number.");
      return;
    }
    if (!Number.isFinite(avg) || avg <= 0) {
      setError("Average cost must be a positive number.");
      return;
    }

    const res = updatePosition(editingSymbol, { symbol, quantity: qty, avgCost: avg, note: editNote });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setStatus(`Saved ${symbol}.`);
    setEditingSymbol(null);
    setEditSymbol("");
    setEditQty("");
    setEditAvgCost("");
    setEditNote("");
    refresh();
  }

  function confirmDelete(symbol: string): void {
    const ok = window.confirm(`Delete position ${symbol}?`);
    if (!ok) return;
    const res = deletePosition(symbol);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setStatus(`Deleted ${symbol}.`);
    if (editingSymbol === symbol) cancelEdit();
    refresh();
  }

  function handlePriceChange(symbol: string, v: string): void {
    setPriceEdits((prev) => ({ ...prev, [symbol]: v }));
  }

  function savePrice(symbol: string): void {
    const raw = priceEdits[symbol];
    const price = Number(raw);
    if (!Number.isFinite(price) || price < 0) {
      setError("Price must be a non-negative number.");
      return;
    }
    const res = setLastPrice(symbol, price);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setStatus(`Updated last price for ${symbol}.`);
    refresh();
  }

  return (
    <section aria-labelledby="portfolio-heading">
      <h1 id="portfolio-heading" style={{ marginTop: 0 }}>
        Portfolio
      </h1>

      {/* Status and error messages */}
      <div aria-live="polite" style={{ minHeight: "1.25rem", color: "green" }}>
        {status}
      </div>
      <div aria-live="assertive" style={{ minHeight: "1.25rem", color: "crimson" }}>
        {error}
      </div>

      {/* Add form */}
      <form
        aria-labelledby="add-position-title"
        onSubmit={(e) => {
          e.preventDefault();
          handleAdd();
        }}
        style={{
          display: "grid",
          gap: "0.5rem",
          gridTemplateColumns: "1fr 1fr 1fr 2fr auto",
          alignItems: "end",
          marginBottom: "1rem",
          maxWidth: 1080,
        }}
      >
        <h2
          id="add-position-title"
          style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}
        >
          Add position
        </h2>

        <div style={{ display: "grid" }}>
          <label htmlFor="new-symbol">Symbol</label>
          <input
            id="new-symbol"
            ref={addSymbolRef}
            type="text"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.currentTarget.value)}
            placeholder='e.g., "TCS", "RELIANCE"'
            aria-describedby="symbol-help"
            aria-invalid={Boolean(error)}
          />
          <small id="symbol-help">Uppercase letters/numbers, dot and dash allowed.</small>
        </div>

        <div style={{ display: "grid" }}>
          <label htmlFor="new-qty">Quantity</label>
          <input
            id="new-qty"
            type="number"
            inputMode="decimal"
            step="any"
            value={newQty}
            onChange={(e) => setNewQty(e.currentTarget.value)}
            placeholder="e.g., 10"
          />
        </div>

        <div style={{ display: "grid" }}>
          <label htmlFor="new-avg">Avg cost</label>
          <input
            id="new-avg"
            type="number"
            inputMode="decimal"
            step="any"
            value={newAvgCost}
            onChange={(e) => setNewAvgCost(e.currentTarget.value)}
            placeholder="e.g., 3250.5"
          />
        </div>

        <div style={{ display: "grid" }}>
          <label htmlFor="new-note">Note (optional)</label>
          <input
            id="new-note"
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.currentTarget.value)}
            placeholder="Add a brief note"
          />
        </div>

        <div>
          <button type="submit" aria-label="Add position">
            Add
          </button>
        </div>
      </form>

      {/* Sort controls */}
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.75rem" }}>
        <label htmlFor="sort-mode">Sort by</label>
        <select
          id="sort-mode"
          value={sortMode}
          onChange={(e) => setSortMode(e.currentTarget.value as PortfolioSortMode)}
          aria-label="Sort positions"
        >
          <option value="symbol">Symbol (A–Z)</option>
          <option value="pnl">P&L (High→Low)</option>
        </select>
      </div>

      {/* Table or empty state */}
      {positions.length === 0 ? (
        <div
          role="status"
          aria-live="polite"
          style={{ padding: "0.75rem", border: "1px dashed #e5e7eb", borderRadius: 6, maxWidth: 1080 }}
        >
          Your portfolio is empty. Add a position above to get started.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              maxWidth: 1200,
              borderCollapse: "collapse",
              border: "1px solid #e5e7eb",
              borderRadius: 6,
            }}
          >
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: "1px solid #e5e7eb" }}>Symbol</th>
                <th style={{ textAlign: "right", padding: "0.5rem", borderBottom: "1px solid #e5e7eb" }}>Qty</th>
                <th style={{ textAlign: "right", padding: "0.5rem", borderBottom: "1px solid #e5e7eb" }}>Avg Cost</th>
                <th style={{ textAlign: "right", padding: "0.5rem", borderBottom: "1px solid #e5e7eb" }}>
                  Last Price
                </th>
                <th style={{ textAlign: "right", padding: "0.5rem", borderBottom: "1px solid #e5e7eb" }}>
                  Invested
                </th>
                <th style={{ textAlign: "right", padding: "0.5rem", borderBottom: "1px solid #e5e7eb" }}>
                  Current Value
                </th>
                <th style={{ textAlign: "right", padding: "0.5rem", borderBottom: "1px solid #e5e7eb" }}>P&amp;L</th>
                <th style={{ textAlign: "right", padding: "0.5rem", borderBottom: "1px solid #e5e7eb" }}>
                  P&amp;L %
                </th>
                <th style={{ textAlign: "right", padding: "0.5rem", borderBottom: "1px solid #e5e7eb" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => {
                const isEditing = editingSymbol === p.symbol;
                const priceInput = priceEdits[p.symbol] ?? (p.lastPrice != null ? String(p.lastPrice) : "");
                const pnlColor =
                  p.pnl == null ? undefined : p.pnl > 0 ? "green" : p.pnl < 0 ? "crimson" : undefined;

                return (
                  <tr key={p.symbol}>
                    <td style={{ padding: "0.5rem", borderBottom: "1px solid #f3f4f6" }}>
                      {isEditing ? (
                        <div style={{ display: "grid" }}>
                          <label htmlFor={`edit-symbol-${p.symbol}`}>Symbol</label>
                          <input
                            id={`edit-symbol-${p.symbol}`}
                            ref={editSymbolRef}
                            type="text"
                            value={editSymbol}
                            onChange={(e) => setEditSymbol(e.currentTarget.value.toUpperCase())}
                            aria-label={`Edit symbol for ${p.symbol}`}
                          />
                        </div>
                      ) : (
                        <strong aria-label="Symbol">{p.symbol}</strong>
                      )}
                    </td>

                    <td style={{ padding: "0.5rem", borderBottom: "1px solid #f3f4f6", textAlign: "right" }}>
                      {isEditing ? (
                        <div style={{ display: "grid" }}>
                          <label htmlFor={`edit-qty-${p.symbol}`}>Quantity</label>
                          <input
                            id={`edit-qty-${p.symbol}`}
                            type="number"
                            inputMode="decimal"
                            step="any"
                            value={editQty}
                            onChange={(e) => setEditQty(e.currentTarget.value)}
                          />
                        </div>
                      ) : (
                        <span>{p.quantity}</span>
                      )}
                    </td>

                    <td style={{ padding: "0.5rem", borderBottom: "1px solid #f3f4f6", textAlign: "right" }}>
                      {isEditing ? (
                        <div style={{ display: "grid" }}>
                          <label htmlFor={`edit-avg-${p.symbol}`}>Avg cost</label>
                          <input
                            id={`edit-avg-${p.symbol}`}
                            type="number"
                            inputMode="decimal"
                            step="any"
                            value={editAvgCost}
                            onChange={(e) => setEditAvgCost(e.currentTarget.value)}
                          />
                        </div>
                      ) : (
                        <span>{p.avgCost}</span>
                      )}
                    </td>

                    <td style={{ padding: "0.5rem", borderBottom: "1px solid #f3f4f6", textAlign: "right" }}>
                      <div style={{ display: "grid" }}>
                        <label htmlFor={`edit-price-${p.symbol}`}>Last price</label>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          <input
                            id={`edit-price-${p.symbol}`}
                            type="number"
                            inputMode="decimal"
                            step="any"
                            value={priceInput}
                            onChange={(e) => handlePriceChange(p.symbol, e.currentTarget.value)}
                            style={{ width: 120 }}
                          />
                          <button
                            type="button"
                            onClick={() => savePrice(p.symbol)}
                            aria-label={`Save last price for ${p.symbol}`}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "0.5rem", borderBottom: "1px solid #f3f4f6", textAlign: "right" }}>
                      {p.invested.toFixed(2)}
                    </td>

                    <td style={{ padding: "0.5rem", borderBottom: "1px solid #f3f4f6", textAlign: "right" }}>
                      {p.currentValue != null ? p.currentValue.toFixed(2) : "—"}
                    </td>

                    <td
                      style={{
                        padding: "0.5rem",
                        borderBottom: "1px solid #f3f4f6",
                        textAlign: "right",
                        color: pnlColor,
                        fontWeight: 600,
                      }}
                    >
                      {p.pnl != null ? p.pnl.toFixed(2) : "—"}
                    </td>

                    <td style={{ padding: "0.5rem", borderBottom: "1px solid #f3f4f6", textAlign: "right" }}>
                      {p.pnlPercent != null ? `${p.pnlPercent.toFixed(2)}%` : "—"}
                    </td>

                    <td style={{ padding: "0.5rem", borderBottom: "1px solid #f3f4f6", textAlign: "right" }}>
                      {isEditing ? (
                        <>
                          <button type="button" onClick={saveEdit} aria-label={`Save changes for ${p.symbol}`}>
                            Save
                          </button>
                          <button type="button" onClick={cancelEdit} aria-label={`Cancel edit for ${p.symbol}`}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => startEdit(p.symbol)} aria-label={`Edit ${p.symbol}`}>
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmDelete(p.symbol)}
                            aria-label={`Delete ${p.symbol}`}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Totals row */}
            <tfoot>
              <tr>
                <td style={{ padding: "0.5rem", borderTop: "2px solid #e5e7eb" }} colSpan={4}>
                  Totals
                </td>
                <td style={{ padding: "0.5rem", borderTop: "2px solid #e5e7eb", textAlign: "right" }}>
                  {totals.totalInvested.toFixed(2)}
                </td>
                <td style={{ padding: "0.5rem", borderTop: "2px solid #e5e7eb", textAlign: "right" }}>
                  {totals.currentValue != null ? totals.currentValue.toFixed(2) : "—"}
                </td>
                <td
                  style={{
                    padding: "0.5rem",
                    borderTop: "2px solid #e5e7eb",
                    textAlign: "right",
                    color:
                      totals.totalPnL == null
                        ? undefined
                        : totals.totalPnL > 0
                        ? "green"
                        : totals.totalPnL < 0
                        ? "crimson"
                        : undefined,
                    fontWeight: 700,
                  }}
                >
                  {totals.totalPnL != null ? totals.totalPnL.toFixed(2) : "—"}
                </td>
                <td style={{ padding: "0.5rem", borderTop: "2px solid #e5e7eb", textAlign: "right" }}>
                  {totals.pnlPercent != null ? `${totals.pnlPercent.toFixed(2)}%` : "—"}
                </td>
                <td style={{ padding: "0.5rem", borderTop: "2px solid #e5e7eb" }} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  );
}
