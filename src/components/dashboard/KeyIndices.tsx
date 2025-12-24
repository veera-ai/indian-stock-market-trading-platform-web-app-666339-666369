import type { JSX } from "react";
import type { IndexQuote } from "../../data/marketMocks";
import { trendClass, formatNumber, signed } from "../../utils/format";

/**
 * PUBLIC_INTERFACE
 * KeyIndices renders a responsive grid of index quote cards with change styling.
 * Props:
 * - data: strictly-typed array of IndexQuote
 */
export default function KeyIndices({ data }: { data: IndexQuote[] }): JSX.Element {
  return (
    <section aria-labelledby="key-indices-title">
      <h2 id="key-indices-title" style={{ margin: "0 0 0.5rem 0" }}>
        Key Indices
      </h2>
      <div
        role="list"
        aria-label="Key indices list"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "0.75rem",
        }}
      >
        {data.map((q) => {
          const cls = trendClass(q.change);
          const changeText = `${signed(Number(q.change.toFixed(2)))} (${signed(Number(q.percent.toFixed(2)))}%)`;
          const aria = `${q.name} ${formatNumber(q.last, { maximumFractionDigits: 2 })}, ${changeText}`;
          return (
            <article
              role="listitem"
              key={q.id}
              aria-label={aria}
              className={`index-card ${cls}`}
              style={{
                border: `1px solid var(--color-border)`,
                borderRadius: "var(--radius-sm)",
                padding: "0.75rem",
                display: "grid",
                gap: "0.25rem",
                background: "#fff",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "0.5rem" }}>
                <h3 style={{ margin: 0, fontSize: "1rem" }}>{q.name}</h3>
                <span
                  aria-label="Symbol"
                  style={{ color: "#6b7280", fontSize: "0.85rem" }}
                  title={q.symbol}
                >
                  {q.symbol}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: "0.5rem",
                }}
              >
                <strong style={{ fontSize: "1.25rem" }} aria-label="Last">
                  {formatNumber(q.last, { maximumFractionDigits: 2 })}
                </strong>
                <span
                  aria-label="Change and percent"
                  className={`index-change ${cls}`}
                  style={{
                    fontWeight: 600,
                    color: cls === "trend-up" ? "green" : cls === "trend-down" ? "crimson" : "#374151",
                  }}
                >
                  {changeText}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
