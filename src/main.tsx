import type { JSX } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Watchlist from './pages/Watchlist';
import Portfolio from './pages/Portfolio';
import Layout from './components/Layout';
import './styles/global.css';

/**
 * Minimal React entry for TypeScript strict mode with router.
 * Updated to use a shared Layout (header + sidebar) wrapping all pages.
 */
function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/portfolio" element={<Portfolio />} />
        </Route>
      </Routes>
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
