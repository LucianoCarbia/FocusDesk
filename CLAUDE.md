# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

FocusDesk is a React + TypeScript + Vite project currently at its initial scaffold stage — `src/App.tsx` still contains the default Vite starter markup (hero image, counter button, docs/social links). There is no application logic, routing, state management, or component structure yet. Treat any architectural decisions as unmade; don't assume patterns exist beyond what's in `src/`.

## Product vision (v0.1 roadmap — not yet built)

FocusDesk is planned as a personal, offline-first, **mobile-first** app combining a **Calendario** module (monthly view, CRUD events, categories, colors/icons, event types: Tareas, Pagos, Turnos, Facultad, Trabajo, Actividad personal, Recordatorios) and a **Finanzas** module (CRUD income/expense/savings movements, categories, monthly balance = `ingresos - gastos - ahorros`, % used, % saved, category breakdown, filters/history). v0.1 targets installable Android and desktop (Windows/Linux) builds — no app store, no backend server, no cross-device sync; each device keeps its own local SQLite database. Manual export/import backup is required, with format validation and confirm-before-overwrite.

**Planned stack** (not yet added to this repo): **Tauri 2** for desktop/Android packaging + **SQLite** for local persistence + CSS Modules for styling, on top of the current React/TS/Vite base. Don't add these dependencies or restructure the project until the user explicitly starts that phase — technical initialization (stack setup, Tauri config, SQLite migrations) is its own planned step before module development begins.

**Planned folder structure** (once initialization starts):
```
src/
├── assets/ components/ pages/ features/ domain/
├── database/ hooks/ routes/ services/ styles/ types/ utils/
src-tauri/   # Tauri native config/code
```

**Data-access rule for future code:** UI components must never touch SQLite directly. Required flow:
```
Interfaz → caso de uso / servicio → repositorio → SQLite
```

## Git workflow (planned, once repo has a remote)

This project is not yet a git repository, but the intended workflow is a strict multi-tier branch hierarchy. Once adopted: never develop directly on `main` or `testing`.

```
main                          # stable, installable only
└── testing                   # full pre-release QA (Android/Windows/Linux)
    └── rc/mejoras-v0.1        # integration branch for the v0.1 release
        └── feat/mejoras-v0.1  # umbrella dev branch; issue branches fork from here
            └── feat|fix|refactor|docs|style|test/mejoras-v0.1-issues/<n>-<slug>
```

Per-issue flow: branch from `feat/mejoras-v0.1` → small descriptive commits **in Spanish**, imperative mood (e.g. "Agrega formulario para crear eventos", never "Cambios"/"Arreglos") → PR **into `rc/mejoras-v0.1`** (not `main`, not `testing`) referencing `Closes #n`. Bugs found in `testing` become new `fix/...` issues looping back through `rc/mejoras-v0.1` — never fixed directly on `testing`. Only `testing` → `main` after full QA, then tag `v0.1.0`.

## Commands

- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — type-check (`tsc -b`) then production build via Vite
- `npm run lint` — run ESLint over the project
- `npm run preview` — preview the production build locally

There is no test runner configured yet (no test script, no test framework in `package.json`).

## Structure

- `src/main.tsx` — entry point, mounts `<App />` into `#root` under `StrictMode`
- `src/App.tsx` — root component (currently the default scaffold content)
- `src/App.css`, `src/index.css` — styling
- `public/icons.svg` — sprite sheet referenced via `<use href="/icons.svg#...">` for inline icons

## TypeScript / build config

- Split tsconfig: `tsconfig.json` is a references-only root pointing at `tsconfig.app.json` (app code, targets `src/`) and `tsconfig.node.json` (Vite config itself).
- `tsconfig.app.json` has strict unused-locals/params checks and `erasableSyntaxOnly` enabled — TypeScript-only syntax that requires emitted runtime code (e.g. enums, parameter properties) will fail the build.
- Module resolution is `bundler` mode with `verbatimModuleSyntax: true`, so type-only imports must use `import type`.

## Lint config

ESLint (flat config in `eslint.config.js`) applies `js.configs.recommended`, `tseslint.configs.recommended`, `eslint-plugin-react-hooks` recommended rules, and `eslint-plugin-react-refresh`'s Vite preset. This is the base template config — no project-specific rule overrides yet.
