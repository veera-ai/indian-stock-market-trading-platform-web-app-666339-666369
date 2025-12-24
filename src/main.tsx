import type { JSX } from 'react';
import ReactDOM from 'react-dom/client';

/**
 * Minimal React entry for TypeScript type-checking in strict mode.
 * This can be used by any bundler (e.g., Vite, CRA, Webpack) once configured.
 */
function App(): JSX.Element {
  return (
    <main role="main" aria-label="Application Root">
      Indian Stock Market Trading Platform
    </main>
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
