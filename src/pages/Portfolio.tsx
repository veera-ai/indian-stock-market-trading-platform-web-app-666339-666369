import type { JSX } from 'react';

/**
 * Portfolio page placeholder with a simple accessible heading.
 */
// PUBLIC_INTERFACE
export default function Portfolio(): JSX.Element {
  return (
    <section aria-labelledby="portfolio-heading">
      <h1 id="portfolio-heading">Portfolio</h1>
      <p>View your holdings and performance.</p>
    </section>
  );
}
