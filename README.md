# JoyScope 🎮

Professional browser-based gamepad diagnostics and testing tool for Xbox, PlayStation, Switch, and standard gamepads.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)

## ✨ Features

- **Real-time Input Visualization** - See button presses, stick movements, and trigger values in real-time
- **Dead Zone Calibration** - Adjust dead zones to compensate for stick drift
- **Haptic Feedback Testing** - Test vibration/rumble with adjustable intensity
- **Latency Monitoring** - Track input latency for performance testing
- **Multi-Controller Support** - Connect and switch between multiple controllers
- **Simulation Mode** - Test UI without a physical controller connected

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ 
- [pnpm](https://pnpm.io/) 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/joyscope.git
cd joyscope

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Connect a Controller

1. Plug in your gamepad via USB or connect via Bluetooth
2. Press any button on the controller to activate it
3. The app will automatically detect and display your controller

## 📦 Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build locally |
| `pnpm test` | Run tests |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Check formatting with Prettier |
| `pnpm format:fix` | Fix formatting issues |

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Routing**: React Router v7
- **Testing**: Vitest + jsdom

## 📁 Project Structure

```
src/
├── components/       # React components
│   ├── Navigation.tsx
│   ├── ErrorBoundary.tsx
│   └── UnsupportedBanner.tsx
├── hooks/            # Custom React hooks
│   └── useGamepads.ts
├── lib/              # Business logic & utilities
│   ├── constants.ts
│   └── errorReporter.ts
├── pages/            # Route-level page components
│   ├── Landing.tsx
│   ├── LiveDiagnostics.tsx
│   ├── Settings.tsx
│   └── NotFound.tsx
├── services/         # Browser API abstractions
│   └── gamepadService.ts
├── simulators/       # Mock/virtual gamepad
│   └── virtualGamepad.ts
├── state/            # Zustand store slices
│   ├── controllerSlice.ts
│   └── preferencesSlice.ts
├── types/            # TypeScript types
│   ├── gamepad.ts
│   └── gamepadExtended.d.ts
└── utils/            # Pure utility functions
    ├── buttonConstants.ts
    ├── buttonIndices.ts
    └── gamepadMapping.ts
```

## 🌐 Browser Support

This app uses the [Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API) which requires:

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Recommended - includes haptics |
| Edge | ✅ Full | Same as Chrome |
| Firefox | ⚠️ Partial | No haptic support |
| Safari | ⚠️ Limited | Basic support only |

**Note**: HTTPS is required for the Gamepad API in production. localhost works for development.

## 🎮 Supported Controllers

- Xbox One / Series X|S controllers
- PlayStation DualShock 4 / DualSense
- Nintendo Switch Pro Controller
- Generic XInput/DirectInput gamepads

## 🚀 Deployment

This project is configured for GitHub Pages deployment:

```bash
# Build and deploy
pnpm build
# Then push to GitHub and enable Pages from Settings
```

The GitHub Actions workflow will automatically build and deploy on push to `main`.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Made with ❤️ for the gaming community
