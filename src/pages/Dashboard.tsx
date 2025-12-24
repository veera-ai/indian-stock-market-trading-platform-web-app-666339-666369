import type { JSX } from 'react';
import KeyIndices from '../components/dashboard/KeyIndices';
import TopMovers from '../components/dashboard/TopMovers';
import { getMockIndices, getMockMovers } from '../data/marketMocks';

/**
 * PUBLIC_INTERFACE
 * Dashboard renders market overview widgets (Key Indices and Top Movers) using strictly typed mock data.
 * These components are modular and isolated to allow future replacement with real APIs.
 */
export default function Dashboard(): JSX.Element {
  const indices = getMockIndices();
  const movers = getMockMovers();

  return (
    <section aria-labelledby="dashboard-heading">
      <h1 id="dashboard-heading" style={{ marginTop: 0 }}>Dashboard</h1>

      <div
        style={{
          display: 'grid',
          gap: '1rem',
          maxWidth: 1280,
        }}
      >
        <KeyIndices data={indices} />
        <TopMovers data={movers} />
      </div>
    </section>
  );
}
