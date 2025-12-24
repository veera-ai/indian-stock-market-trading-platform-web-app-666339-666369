import type { JSX } from 'react';

/**
 * Dashboard page placeholder with a simple accessible heading.
 * Keep minimal and idiomatic for initial scaffold.
 */
// PUBLIC_INTERFACE
export default function Dashboard(): JSX.Element {
  return (
    <section aria-labelledby="dashboard-heading">
      <h1 id="dashboard-heading" style={{ marginTop: 0 }}>Dashboard</h1>
      <p>Welcome to the Indian Stock Market Trading Platform dashboard.</p>
    </section>
  );
}
