# Test Matrix & Scenario Catalog

## Core Diagnostics

| Test | Purpose | Inputs | Pass conditions |
| --- | --- | --- | --- |
| Connection Health | Verify Gamepad API events fire for connect/disconnect. | Plug/unplug controller. | UI updates within 500 ms; metadata captured. |
| Button Sweep | Confirm each button toggles with correct label & value. | Press each button in guided order. | Boolean + analog value logged; miss-count = 0. |
| Trigger Pressure | Measure analog trigger curves. | Slowly squeeze LT/RT (or equivalents). | Value ramps smoothly 0 → 1; max ≥ 0.98. |
| Stick Range & Dead Zone | Detect drift and full deflection. | Rotate sticks clockwise twice. | Circle traces stay within tolerance, drift < 0.05. |
| D-pad Diagonals | Validate diagonals register as combined inputs. | Press up-right, down-left, etc. | Combined states recorded; no ghost inputs. |
| Rumble Feedback | Exercise haptic actuators. | Fire low/high intensity pulses. | Haptics API resolves `fulfilled`; unsupported surfaces warning. |
| Latency Probe | Capture event-to-render latency. | Tap A/B repeatedly while visual timer runs. | Avg < 30 ms, p95 < 50 ms. |

## Scripted Scenarios

1. **Baseline Sanity** – Runs connection, button sweep, stick range, rumble, latency.
2. **Precision Aim** – Focuses on stick micro-movements, trigger feathering, drift detection.
3. **Combo Input** – Ensures rapid alternating button presses and d-pad combos register without loss.
4. **Accessibility Friendly** – Confirms remapped buttons/paddles and single-handed operation macros.

## Result Logging
- Each step writes structured `event`, `expected`, `observed`, `status`, `timestamp`.
- Failures trigger remediation tips pulled from the scenario metadata (`troubleshooting` field).
- Final export bundles raw stream + scenario summary for reproducibility.

