export type NumberFormatOptions = {
  style?: "decimal" | "percent" | "currency";
  currency?: string; // e.g., "INR" when style=currency
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
};

const DEFAULT_DECIMALS = 2;

// PUBLIC_INTERFACE
export function formatNumber(value: number, opts: NumberFormatOptions = {}): string {
  /** Formats a number as decimal/percent/currency using Intl with sane defaults. */
  const { style = "decimal", currency, maximumFractionDigits = DEFAULT_DECIMALS, minimumFractionDigits } = opts;

  const options: Intl.NumberFormatOptions = {
    maximumFractionDigits,
  };
  if (typeof minimumFractionDigits === "number") {
    options.minimumFractionDigits = minimumFractionDigits;
  }
  if (style === "percent") {
    options.style = "percent";
  } else if (style === "currency") {
    options.style = "currency";
    options.currency = currency ?? "INR";
  }

  return new Intl.NumberFormat(undefined, options).format(value);
}

// PUBLIC_INTERFACE
export function signed(value: number, padZero = false): string {
  /** Returns number with explicit sign (+/-) and optional zero sign handling. */
  if (value > 0) return `+${value}`;
  if (value < 0) return `${value}`;
  return padZero ? "+0" : "0";
}

// PUBLIC_INTERFACE
export function trendClass(value: number | null | undefined): "trend-up" | "trend-down" | "trend-flat" {
  /** Maps numeric change to a CSS-friendly trend class. */
  if (typeof value !== "number" || Number.isNaN(value)) return "trend-flat";
  if (value > 0) return "trend-up";
  if (value < 0) return "trend-down";
  return "trend-flat";
}
