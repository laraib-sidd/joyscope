# Technical Architecture

## Stack Overview
- **Frontend**: React 19 + Vite + TypeScript for fast dev cycle and SPA routing.
- **State**: Zustand stores in `src/state/` coordinating controller metadata and calibration preferences.
- **Visualization**: Custom React components with Framer Motion for stick plots, button matrix, and latency displays.
- **Build/Deploy**: GitHub Actions → GitHub Pages static hosting.

## Module Map

| Layer | Responsibilities | Key files |
| --- | --- | --- |
| Services | Browser API abstraction (Gamepad, localStorage, haptics) | `src/services/gamepadService.ts` |
| Data Access | Subscribe to `navigator.getGamepads()`, map vendor quirks, expose typed models. | `src/hooks/useGamepads.ts`, `src/utils/gamepadMapping.ts` |
| Calibration & Settings | Persist user overrides (dead zones, simulation mode) in localStorage. | `src/state/preferencesSlice.ts`, `src/pages/Settings.tsx` |
| Live Diagnostics | Render current state, button grid, stick visualizers, haptics controls. | `src/pages/LiveDiagnostics.tsx` |
| Simulation | Inject mock gamepad stream for local dev without hardware. | `src/simulators/virtualGamepad.ts` |
| Constants | Centralized thresholds and magic numbers. | `src/lib/constants.ts` |
| Error Handling | Centralized error reporting and safe storage access. | `src/lib/errorReporter.ts` |

## Data Flow
1. `useGamepads` hook polls the browser via `gamepadService` (requestAnimationFrame) and emits normalized payloads.
2. `normalizeGamepad()` rewrites vendor-specific indices to canonical layout + metadata (buttons, axes, haptics).
3. Store slices (`controllerSlice`, `preferencesSlice`) persist state and expose selectors to UI components.
4. Button/axis events are rendered in real-time on the diagnostics page.

## Simulation Layer
- `virtualGamepad.ts` mimics the Gamepad API surface (buttons, axes, timestamps).
- A development toggle (Settings → Simulation Mode) swaps data source in `useGamepads`.

## Observability
- Error logging via `src/lib/errorReporter.ts`
- Console-based error reporting with severity levels

## Deployment Steps
1. Run `pnpm install && pnpm build`.
2. GitHub Actions enforces lint/build/test gates and deploys to GitHub Pages.
3. Production deploy uses zero-downtime atomic uploads.

## File Structure

```
src/
├── components/           # React components
│   ├── ErrorBoundary.tsx
│   ├── Navigation.tsx
│   └── UnsupportedBanner.tsx
├── hooks/               # Custom React hooks
│   └── useGamepads.ts
├── lib/                 # Business logic & utilities
│   ├── constants.ts
│   └── errorReporter.ts
├── pages/               # Route-level components
│   ├── Landing.tsx
│   ├── LiveDiagnostics.tsx
│   ├── NotFound.tsx
│   └── Settings.tsx
├── services/            # Browser API abstractions
│   └── gamepadService.ts
├── simulators/          # Mock/virtual gamepad
│   └── virtualGamepad.ts
├── state/               # Zustand store slices
│   ├── controllerSlice.ts
│   └── preferencesSlice.ts
├── types/               # TypeScript definitions
│   ├── gamepad.ts
│   └── gamepadExtended.d.ts
└── utils/               # Pure utility functions
    ├── buttonConstants.ts
    ├── buttonIndices.ts
    └── gamepadMapping.ts
```

## Accessibility Features
- WCAG 2.1 AA compliant
- Full keyboard navigation
- ARIA labels on all interactive elements
- Focus visible indicators
- Skip to main content link
- Respects prefers-reduced-motion
- Screen reader friendly live regions for dynamic updates
