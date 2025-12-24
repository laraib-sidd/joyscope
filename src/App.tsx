/**
 * App - Main application layout
 */

import { Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Route, Routes, useLocation } from 'react-router-dom';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Navigation } from '@/components/Navigation';
import { UnsupportedBanner } from '@/components/UnsupportedBanner';
import { useGamepads } from '@/hooks/useGamepads';
import { useControllerStore } from '@/state/controllerSlice';

// Lazy load pages
const LandingPage = lazy(() =>
  import('@/pages/Landing').then((m) => ({ default: m.LandingPage }))
);
const LiveDiagnosticsPage = lazy(() =>
  import('@/pages/LiveDiagnostics').then((m) => ({ default: m.LiveDiagnosticsPage }))
);
const SettingsPage = lazy(() =>
  import('@/pages/Settings').then((m) => ({ default: m.SettingsPage }))
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFound').then((m) => ({ default: m.NotFoundPage }))
);

// Loading fallback
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      className="h-8 w-8 rounded-full border-2 border-white/20 border-t-violet-400"
    />
  </div>
);

const App = () => {
  const location = useLocation();
  const controllers = useControllerStore((state) => state.controllers);
  const controllerCount = Object.keys(controllers).length;

  // Initialize gamepad polling
  useGamepads();

  return (
    <div className="flex h-screen flex-col bg-[#0a0a0f]">
      {/* Skip link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Browser compatibility banner */}
      <UnsupportedBanner />

      {/* Navigation */}
      <Navigation controllerCount={controllerCount} />

      {/* Main content - scrollable area with visible scrollbar */}
      <main
        id="main-content"
        role="main"
        aria-label="Main content"
        className="app-scroll flex-1"
      >
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/live" element={<LiveDiagnosticsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default App;
