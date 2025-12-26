# Project Repository

This is the initial README file for the project.

## Development Tooling

This repository includes TypeScript, ESLint (strict), and Prettier. Run all npm commands from this directory:

- Install dependencies:
  - npm install
- Start Vite dev server:
  - npm run dev
- Build for production:
  - npm run build
- Preview built app:
  - npm run preview
- TypeScript type-check:
  - npm run type-check
- Lint:
  - npm run lint
- Prettier check:
  - npm run format
- Prettier write:
  - npm run format:write
- Dependency check:
  - npm run depcheck

Note: Running npm commands from the repo root (outside this folder) will fail because package.json is located here.

### Type Checking
Run strict TypeScript checks (no emit) with:
- npm run type-check

### Environment variables
- The current code references CRA-style environment variables prefixed with REACT_APP_* (e.g., REACT_APP_API_BASE).
- Vite conventionally exposes variables that start with VITE_*.
- We will migrate to VITE_* later; for now, do not rename existing env usages. Access via import.meta.env still works, but only variables starting with VITE_ are automatically exposed by Vite at runtime. If you need a value in the browser and it's currently REACT_APP_*, mirror it to a VITE_* variable in your .env during development.

### Helpful Tips
- The Watchlist and Portfolio pages persist to LocalStorage; clear your browser site data if you want to reset.
- Sorting is available on both pages. Portfolio supports P&L-based sorting.
- Prices on the Portfolio page are mock values stored locally; update them per row to recalculate P&L.