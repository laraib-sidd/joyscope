# UX Flows & Information Architecture

## Key Personas
- **QA Engineer** – runs validation against multiple controller batches.
- **Gamer** – tests controller drift and responsiveness.
- **Support Agent** – uses quick health check with customers during live sessions.

## Primary Journey
1. **Landing Overview**
   - Reads compatibility banner and prerequisites (USB/Bluetooth, supported browsers).
   - Sees controller connection status in real-time.
   - Clicks "Start Testing" to begin diagnostics.
2. **Connect & Identify**
   - Grants Gamepad API permissions after interacting with page.
   - Sees detected controllers with metadata in the navigation bar.
3. **Live Diagnostics Dashboard**
   - Watches real-time visualization: button matrix, stick plots, trigger meters.
   - Tests haptic feedback with adjustable intensity.
   - Views current latency metrics.
4. **Settings & Calibration**
   - Sets dead zones per stick to compensate for drift.
   - Enables simulation mode for testing without hardware.
   - Toggles reduced motion for accessibility.

## Secondary Journeys
- **Quick Smoke Test**: Landing → Live Diagnostics → Verify all inputs work.
- **Drift Investigation**: Live Diagnostics → Monitor stick values → Adjust dead zones.

## Information Architecture

| Section | Purpose | Key components |
| --- | --- | --- |
| Landing (`/`) | Orientation, prerequisites, CTA. | Compatibility banner, status badge, feature cards. |
| Dashboard (`/live`) | Real-time input view. | Controller info, button matrix, stick visualizers, trigger meters, haptics controls, latency display. |
| Settings (`/settings`) | Preferences + calibration. | Dead-zone slider, simulation toggle, reduced motion toggle, about section. |

## Interaction Notes
- Multi-device: support multiple controllers with automatic switching.
- Responsive layout: works on desktop browsers.
- Accessibility: full keyboard navigation, high-contrast design, and WCAG AA color ratios.
