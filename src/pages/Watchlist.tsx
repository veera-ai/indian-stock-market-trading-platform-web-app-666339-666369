import type { JSX } from 'react';

/**
 * Watchlist page placeholder with a simple accessible heading.
 */
// PUBLIC_INTERFACE
export default function Watchlist(): JSX.Element {
  return (
    <section aria-labelledby="watchlist-heading">
      <h1 id="watchlist-heading" style={{ marginTop: 0 }}>Watchlist</h1>
      <p>Track your favorite stocks here.</p>
    </section>
  );
}
