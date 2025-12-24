import type { JSX } from "react";
import type { MoversData, TopMover } from "../../data/marketMocks";
import { trendClass, formatNumber, signed } from "../../utils/format";

function MoversList({ title, items }: { title: string; items: TopMover[] }): JSX.Element {
  return (
    <section aria-labelledby={`${title}-title`} style={{ flex: 1, minWidth: 260 }}>
      <h3 id={`${title}-title`} style={{ margin: "0 0 0.5rem 0" }}>
        {title}
      </h3>
      <ul
        role="list"
        aria-label={title}
        style={{
          margin: 0,
          padding: 0,
          listStyle: "none",
          display: "grid",
          gap: "0.5rem",
        }}
      >
        {items.map((m) => {
          const cls = trendClass(m.percent);
          const percentText = `${signed(Number(m.percent.toFixed(2)))}%`;
          return (
            <li
              key={m.symbol}
              className={`mover-row ${cls}`}
              style={{
                border: `1px solid var(--color-border)`,
                borderRadius: "var(--radius-sm)",
                padding: "0.5rem 0.75rem",
                background: "#fff",
                display: "grid",
                gridTemplateColumns: "1fr auto auto",
                gap: "0.5rem",
                alignItems: "center",
              }}
              aria-label={`${m.symbol}${m.name ? `, ${m.name}` : ""}, price ${formatNumber(m.price)}, ${percentText}`}
            >
              <div style={{ minWidth: 0 }}>
                <strong>{m.symbol}</strong>
                <div style={{ color: "#6b7280", fontSize: "0.85rem", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                  {m.name ?? "—"}
                </div>
              </div>
              <div style={{ justifySelf: "end", fontVariantNumeric: "tabular-nums" }}>
                {formatNumber(m.price, { maximumFractionDigits: 2 })}
              </div>
              <div
                className={`percent ${cls}`}
                style={{
                  justifySelf: "end",
                  fontWeight: 700,
                  color: cls === "trend-up" ? "green" : cls === "trend-down" ? "crimson" : "#374151",
                }}
                aria-label="Percent change"
              >
                {percentText}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * PUBLIC_INTERFACE
 * TopMovers renders a two-column responsive block with Top Gainers and Top Losers.
 * Props:
 * - data: MoversData containing gainers and losers arrays
 */
export default function TopMovers({ data }: { data: MoversData }): JSX.Element {
  return (
    <section aria-labelledby="top-movers-title">
      <h2 id="top-movers-title" style={{ margin: "1rem 0 0.5rem 0" }}>
        Top Movers
      </h2>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <MoversList title="Top Gainers" items={data.gainers} />
        <MoversList title="Top Losers" items={data.losers} />
      </div>
    </section>
  );
}
