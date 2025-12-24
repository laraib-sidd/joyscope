# JoyScope – Scope & Success Criteria

## Objectives
- Provide a browser-based harness that validates whether a standard Gamepad API controller works end-to-end (connection, input, feedback).
- Surface actionable diagnostics for users *within 3 interactions* (plug in controller → confirm detection → view live inputs).

## Capabilities & Acceptance Criteria

| Capability | What we verify | Acceptance criteria |
| --- | --- | --- |
| Connection lifecycle | Detects controller connection/disconnection, exposes metadata (id, mapping, index). | Within 500 ms of plug/unplug, visual status updates and controller info displays. |
| Button states | Every digital input maps to a label with live pressed/released visualization. | All buttons report boolean + pressure (if supported); latency < 16 ms difference between hardware event and UI update. |
| Analog axes & triggers | Sticks/triggers show raw value, normalized [-1,1], and dead-zone overlay. | Default dead zone 8%, user can recalibrate per stick, drift detection visual indicator. |
| D-pad diagonals | Recognize discrete directions, including diagonal combinations. | Rendering clearly shows all 8 directions with visual feedback. |
| Vibration/rumble | Trigger standard dual-motor rumble command and report success/failure. | Intensity slider with Low/Medium/High presets; unsupported browsers/controllers show actionable warning. |
| Latency display | Display current input latency measurement. | Display running latency value; warn if > 50 ms. |
| Vendor layout normalization | Apply mapping profiles for Xbox, DualShock, Switch, Generic. | Labeling always matches physical button names; unknown controllers fall back to generic layout. |

## Browser Support Matrix

| Browser | Min version | Gamepad API status | Rumble support | Notes |
| --- | --- | --- | --- | --- |
| Chrome (desktop) | 118 | Full Gamepad API, standard mapping on USB/Bluetooth. | Yes (GamepadHapticActuator). | Requires user interaction before accessing inputs; enforce HTTPS. |
| Edge (desktop) | 118 | Matches Chromium behavior. | Yes. | Same constraints as Chrome. |
| Firefox (desktop) | 119 | Gamepad API enabled but no haptics. | No. | Warn users about limited rumble support. |

Mobile browsers and Safari lack consistent support; show unsupported banner and disable advanced tests.

## Hardware Quirks & Mitigations
- **DualShock 4 Bluetooth**: axes drift spikes when battery < 20%. Provide calibration and highlight when raw values jitter > 0.02.
- **Nintendo Switch Pro**: Reports `standard` mapping but swaps `B/A`. Apply vendor override when `id` contains `"Nintendo Switch Pro Controller"`.
- **Xbox Elite paddles**: Exposed as extra buttons > 15; treat as optional and allow custom labels.
- **8BitDo legacy firmware**: Does not expose rumble; auto-skip vibration step to avoid false failures.
