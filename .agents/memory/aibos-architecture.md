---
name: AI BOS Architecture
description: Key architectural decisions for the AI BOS project — proxy pattern, port config, design system.
---

## Proxy Pattern
All Anthropic API calls go through `POST /api/ai` on the Express server (port 3001).
Frontend uses `src/utils/ai.ts` helpers: `callAI(system, message, maxTokens)` and `callAIWithHistory(system, messages, maxTokens)`.
Vite proxies `/api` → `localhost:3001` in `vite.config.ts`.

**Why:** ANTHROPIC_API_KEY must never be exposed in client-side code.

**How to apply:** Any new AI feature must call `/api/ai` via the helpers — never call Anthropic directly from the browser.

## Port Config
- Vite frontend: port 5000 (required for Replit webview)
- Express backend: port 3001
- npm run dev uses `concurrently` to start both

## Design System
All colors in `src/design.ts` as the `C` object. Agents array in `AGENTS`.
Shared UI components in `src/components/ui.tsx`: Pill, Card, Btn, Badge, Spin, Tab, SectionHeader, KpiGrid, SparkLine.

## Module Structure
All app pages are in `src/app/`. AppShell.tsx imports all of them and renders based on `view` state string.
Landing page is in `src/pages/Landing.tsx` — no router library, just state-based routing in App.tsx.
