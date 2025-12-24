import type { JSX } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Watchlist from './pages/Watchlist';
import Portfolio from './pages/Portfolio';

/**
 * Minimal React entry for TypeScript strict mode with router.
 * Provides simple navigation between Dashboard, Watchlist, and Portfolio.
 */
function App(): JSX.Element {
  return (
    <BrowserRouter>
      <header
        role="banner"
        style={{
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '1rem',
          padding: '0.75rem 1rem',
          display: 'flex',
          gap: '1rem',
        }}
      >
        <strong aria-label="Application Name">Indian Stock Market</strong>
        <nav aria-label="Primary">
          <ul style={{ display: 'flex', gap: '0.75rem', listStyle: 'none', margin: 0, padding: 0 }}>
            <li>
              <Link to="/">Dashboard</Link>
            </li>
            <li>
              <Link to="/watchlist">Watchlist</Link>
            </li>
            <li>
              <Link to="/portfolio">Portfolio</Link>
            </li>
          </ul>
        </nav>
      </header>

      <main role="main" aria-label="Application Root" style={{ padding: '0 1rem' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/portfolio" element={<Portfolio />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}

// PUBLIC_INTERFACE
export function bootstrap(): void {
  /** This function is a public interface to allow external bootstrapping if needed. */
}
