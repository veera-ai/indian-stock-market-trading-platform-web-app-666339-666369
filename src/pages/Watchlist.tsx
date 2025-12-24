import type { JSX } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  addSymbol,
  deleteSymbol,
  getState,
  selectItemsSorted,
  type SortMode,
  updateSymbol,
  validateSymbol,
  type WatchlistItem,
} from "../store/watchlistStore";

/**
 * PUBLIC_INTERFACE
 * Watchlist page implementing client-side CRUD with LocalStorage persistence.
 * - Add symbol with optional note
 * - Inline edit for symbol rename and note update
 * - Delete with confirmation
 * - Sort by symbol (A-Z) or createdAt (newest)
 * - Accessible labels and aria-live status messaging
 */
export default function Watchlist(): JSX.Element {
  const [stateVersion, setStateVersion] = useState<number>(0); // triggers re-render after store mutations
  const [sortMode, setSortMode] = useState<SortMode>("symbol");

  // Add form fields
  const [newSymbol, setNewSymbol] = useState<string>("");
  const [newNote, setNewNote] = useState<string>("");

  // Messaging
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Inline edit states
  const [editingSymbol, setEditingSymbol] = useState<string | null>(null);
  const [editSymbolValue, setEditSymbolValue] = useState<string>("");
  const [editNoteValue, setEditNoteValue] = useState<string>("");

  // Read store state on each render via version
  const currentState = useMemo(() => getState(), [stateVersion]);

  const items = useMemo<WatchlistItem[]>(() => selectItemsSorted(currentState, sortMode), [currentState, sortMode]);

  const addSymbolInputRef = useRef<HTMLInputElement>(null);
  const editSymbolInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus new symbol input on mount for better UX
    addSymbolInputRef.current?.focus();
  }, []);

  function refresh() {
    setStateVersion((v) => v + 1);
  }

  function handleAdd(): void {
    setError("");
    setStatus("");
    const norm = newSymbol.trim().toUpperCase();
    const v = validateSymbol(norm);
    if (!v.valid) {
      setError(v.reason ?? "Invalid symbol.");
      return;
    }
    const result = addSymbol(norm, newNote);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setStatus(`Added ${norm}.`);
    setNewSymbol("");
    setNewNote("");
    refresh();
    addSymbolInputRef.current?.focus();
  }

  function startEdit(symbol: string): void {
    const s = getState();
    const item = s.items[symbol];
    if (!item) return;
    setEditingSymbol(symbol);
    setEditSymbolValue(item.symbol);
    setEditNoteValue(item.note ?? "");
    // focus happens after render
    setTimeout(() => {
      editSymbolInputRef.current?.focus();
    }, 0);
  }

  function cancelEdit(): void {
    setEditingSymbol(null);
    setEditSymbolValue("");
    setEditNoteValue("");
    setStatus("Edit canceled.");
    setError("");
  }

  function saveEdit(): void {
    if (!editingSymbol) return;
    setError("");
    setStatus("");
    const res = updateSymbol(editingSymbol, { newSymbol: editSymbolValue, note: editNoteValue });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    const savedKey = (editSymbolValue || editingSymbol).trim().toUpperCase();
    const savedItem = res.state.items[savedKey];
    setStatus(`Saved ${savedItem ? savedItem.symbol : savedKey}.`);
    setEditingSymbol(null);
    setEditSymbolValue("");
    setEditNoteValue("");
    refresh();
  }

  function confirmDelete(symbol: string): void {
    // Simple confirm dialog per requirements
    const ok = window.confirm(`Delete ${symbol} from your watchlist?`);
    if (!ok) return;
    const res = deleteSymbol(symbol);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setStatus(`Deleted ${symbol}.`);
    if (editingSymbol === symbol) {
      setEditingSymbol(null);
    }
    refresh();
  }

  return (
    <section aria-labelledby="watchlist-heading">
      <h1 id="watchlist-heading" style={{ marginTop: 0 }}>
        Watchlist
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
        aria-labelledby="add-symbol-form-title"
        onSubmit={(e) => {
          e.preventDefault();
          handleAdd();
        }}
        style={{
          display: "grid",
          gap: "0.5rem",
          gridTemplateColumns: "1fr 2fr auto",
          alignItems: "end",
          marginBottom: "1rem",
          maxWidth: 720,
        }}
      >
        <h2 id="add-symbol-form-title" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          Add to Watchlist
        </h2>

        <div style={{ display: "grid" }}>
          <label htmlFor="new-symbol">Symbol</label>
          <input
            id="new-symbol"
            ref={addSymbolInputRef}
            type="text"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.currentTarget.value)}
            placeholder='e.g., "TCS", "RELIANCE", "SBIN", "TCS.NS"'
            aria-describedby="symbol-help"
            aria-invalid={Boolean(error)}
          />
          <small id="symbol-help">Uppercase letters/numbers, dot and dash allowed.</small>
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
          <button type="submit" aria-label="Add symbol to watchlist">
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
          onChange={(e) => setSortMode(e.currentTarget.value as SortMode)}
          aria-label="Sort watchlist items"
        >
          <option value="symbol">Symbol (A–Z)</option>
          <option value="createdAt">Created (Newest)</option>
        </select>
      </div>

      {/* Empty state */}
      {items.length === 0 ? (
        <div role="status" aria-live="polite" style={{ padding: "0.75rem", border: "1px dashed #e5e7eb", borderRadius: 6, maxWidth: 720 }}>
          Your watchlist is empty. Add a symbol above to get started.
        </div>
      ) : (
        <ul role="list" style={{ padding: 0, margin: 0, maxWidth: 900 }}>
          {items.map((item) => {
            const isEditing = editingSymbol === item.symbol;
            return (
              <li
                key={item.symbol}
                style={{
                  listStyle: "none",
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr 1fr auto",
                  gap: "0.5rem",
                  alignItems: "center",
                  padding: "0.5rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                  marginBottom: "0.5rem",
                }}
              >
                {/* Symbol and note (or edit inputs) */}
                <div>
                  {isEditing ? (
                    <div style={{ display: "grid" }}>
                      <label htmlFor={`edit-symbol-${item.symbol}`}>Symbol</label>
                      <input
                        id={`edit-symbol-${item.symbol}`}
                        ref={editSymbolInputRef}
                        type="text"
                        value={editSymbolValue}
                        onChange={(e) => setEditSymbolValue(e.currentTarget.value.toUpperCase())}
                        aria-label={`Edit symbol for ${item.symbol}`}
                      />
                    </div>
                  ) : (
                    <strong aria-label="Symbol">{item.symbol}</strong>
                  )}
                </div>

                <div>
                  {isEditing ? (
                    <div style={{ display: "grid" }}>
                      <label htmlFor={`edit-note-${item.symbol}`}>Note</label>
                      <input
                        id={`edit-note-${item.symbol}`}
                        type="text"
                        value={editNoteValue}
                        onChange={(e) => setEditNoteValue(e.currentTarget.value)}
                        aria-label={`Edit note for ${item.symbol}`}
                      />
                    </div>
                  ) : (
                    <span aria-label="Note">{item.note || "—"}</span>
                  )}
                </div>

                <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                  <div title={new Date(item.createdAt).toLocaleString()}>
                    Created: {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                  <div title={new Date(item.updatedAt).toLocaleString()}>
                    Updated: {new Date(item.updatedAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.5rem", justifySelf: "end" }}>
                  {isEditing ? (
                    <>
                      <button type="button" onClick={saveEdit} aria-label={`Save changes for ${item.symbol}`}>
                        Save
                      </button>
                      <button type="button" onClick={cancelEdit} aria-label={`Cancel edit for ${item.symbol}`}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => startEdit(item.symbol)} aria-label={`Edit ${item.symbol}`}>
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmDelete(item.symbol)}
                        aria-label={`Delete ${item.symbol}`}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
