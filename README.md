# Project Repository

This is the initial README file for the project.

## Development Tooling

This repository includes TypeScript, ESLint (strict), and Prettier. Run all npm commands from this directory:

- Install dependencies:
  - npm install
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