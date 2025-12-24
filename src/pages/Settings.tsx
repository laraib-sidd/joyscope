/**
 * Settings Page - Calibration and preferences
 * New Figma-based layout
 */

import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/shallow';

import { useControllerStore } from '@/state/controllerSlice';
import { usePreferencesStore } from '@/state/preferencesSlice';
import { AXIS_INDICES } from '@/utils/buttonIndices';
import { MIN_DEAD_ZONE } from '@/lib/constants';

// ============================================================================
// Sub-components
// ============================================================================

type PanelProps = {
  children: React.ReactNode;
  className?: string;
};

const Panel = memo(function Panel({ children, className = '' }: PanelProps) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-[#12121a] p-6 ${className}`}>
      {children}
    </div>
  );
});

Panel.displayName = 'Panel';

// Dead Zone Preview
type DeadZonePreviewProps = {
  deadZone: number;
  currentX: number;
  currentY: number;
};

const DeadZonePreview = memo(function DeadZonePreview({
  deadZone,
  currentX,
  currentY,
}: DeadZonePreviewProps) {
  const magnitude = Math.sqrt(currentX * currentX + currentY * currentY);
  const isInDeadZone = magnitude < deadZone;

  // Calculate filtered values
  const filteredX = isInDeadZone ? 0 : currentX;
  const filteredY = isInDeadZone ? 0 : currentY;

  return (
    <div className="mt-6 rounded-xl border border-white/5 bg-[#0a0a10] p-6">
      {/* Visualization */}
      <div className="relative mx-auto aspect-square w-48">
        {/* Background */}
        <div className="absolute inset-0 rounded-full border border-white/10 bg-[#0d0d14]" />

        {/* Dead zone circle */}
        <div
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed transition-colors ${
            isInDeadZone ? 'border-violet-400/60' : 'border-white/20'
          }`}
          style={{
            width: `${deadZone * 100}%`,
            height: `${deadZone * 100}%`,
          }}
        />

        {/* Position indicator */}
        <motion.div
          className={`absolute h-6 w-6 rounded-full shadow-lg ${
            isInDeadZone
              ? 'bg-amber-500 shadow-amber-500/40'
              : 'bg-gradient-to-br from-violet-400 to-cyan-400 shadow-violet-500/40'
          }`}
          style={{
            // Use margin offsets instead of translate transforms.
            // Framer Motion sets `transform` for animations (e.g. scale), which can override
            // Tailwind's translate utilities and cause subtle off-centering.
            left: `calc(50% + ${currentX * 45}%)`,
            top: `calc(50% + ${currentY * 45}%)`,
            marginLeft: '-0.75rem', // -12px = half of 24px (h-6 / w-6)
            marginTop: '-0.75rem',
          }}
          animate={{ scale: isInDeadZone ? 0.85 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      </div>

      {/* Values */}
      <div className="mt-6 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-white/50">Raw:</span>
          <span className="font-mono text-violet-400">
            ({currentX.toFixed(2)}, {currentY.toFixed(2)})
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/50">Filtered:</span>
          <span className="font-mono text-white">
            ({filteredX.toFixed(2)}, {filteredY.toFixed(2)})
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/50">Magnitude:</span>
          <span className="font-mono text-white">{Math.round(magnitude * 100)}%</span>
        </div>
      </div>

      {/* Status */}
      {isInDeadZone && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Input filtered
        </div>
      )}
    </div>
  );
});

DeadZonePreview.displayName = 'DeadZonePreview';

// Toggle Switch
type ToggleSwitchProps = {
  enabled: boolean;
  onToggle: () => void;
  label: string;
  description: string;
};

const ToggleSwitch = memo(function ToggleSwitch({
  enabled,
  onToggle,
  label,
  description,
}: ToggleSwitchProps) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4 text-left transition-colors hover:bg-white/[0.04]"
    >
      <div>
        <p className="font-medium text-white">{label}</p>
        <p className="text-sm text-white/40">{description}</p>
      </div>
      <div
        className={`relative h-6 w-11 rounded-full transition-colors ${
          enabled ? 'bg-violet-500' : 'bg-white/20'
        }`}
      >
        <motion.div
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md"
          animate={{ left: enabled ? '22px' : '2px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  );
});

ToggleSwitch.displayName = 'ToggleSwitch';

// ============================================================================
// Main Component
// ============================================================================

export const SettingsPage = memo(function SettingsPage() {
  const {
    deadZone,
    setDeadZone,
    simulationMode,
    toggleSimulation,
    reducedMotion,
    toggleReducedMotion,
  } = usePreferencesStore(
    useShallow((state) => ({
      deadZone: state.deadZone,
      setDeadZone: state.setDeadZone,
      simulationMode: state.simulationMode,
      toggleSimulation: state.toggleSimulation,
      reducedMotion: state.reducedMotion,
      toggleReducedMotion: state.toggleReducedMotion,
    }))
  );

  const controllers = useControllerStore((state) => state.controllers);
  const activeSlot = useControllerStore((state) => state.activeSlot);

  const controller =
    activeSlot !== undefined ? controllers[activeSlot] : Object.values(controllers)[0];

  const currentX = controller?.axes[AXIS_INDICES.LEFT_X]?.value ?? 0;
  const currentY = controller?.axes[AXIS_INDICES.LEFT_Y]?.value ?? 0;

  const deadZonePercent = useMemo(() => Math.round(deadZone * 100), [deadZone]);

  return (
    <div className="min-h-screen px-6 pb-8 pt-24">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="mt-1 text-white/40">Configure calibration and preferences</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Dead Zone Calibration */}
          <Panel>
            <h2 className="text-lg font-semibold text-white">Dead Zone Calibration</h2>
            <p className="mt-1 text-sm text-white/40">
              Offset minor stick drift without losing precision.
            </p>

            {/* Slider with labels */}
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-white/40">Dead Zone</span>
                <span className="text-lg font-semibold text-violet-400">{deadZonePercent}%</span>
              </div>
              <input
                type="range"
                min={MIN_DEAD_ZONE}
                max={0.35}
                step={0.01}
                value={deadZone}
                onChange={(e) => setDeadZone(parseFloat(e.target.value))}
                className="w-full"
                style={{
                  ['--range-progress' as string]: `${((deadZone - MIN_DEAD_ZONE) / (0.35 - MIN_DEAD_ZONE)) * 100}%`,
                }}
                aria-label="Dead zone threshold"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-white/30">
                <span>0%</span>
                <span>35%</span>
              </div>
            </div>

            {/* Preview */}
            <DeadZonePreview
              deadZone={deadZone}
              currentX={currentX}
              currentY={currentY}
            />
          </Panel>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Display Modes */}
            <Panel>
              <h2 className="mb-4 text-lg font-semibold text-white">Display Modes</h2>
              <div className="space-y-3">
                <ToggleSwitch
                  enabled={simulationMode}
                  onToggle={toggleSimulation}
                  label="Simulation Mode"
                  description="Virtual controller"
                />
                <ToggleSwitch
                  enabled={reducedMotion}
                  onToggle={toggleReducedMotion}
                  label="Reduced Motion"
                  description="Minimize animations"
                />
              </div>
            </Panel>

            {/* About */}
            <Panel>
              <h2 className="mb-2 text-lg font-semibold text-white">About</h2>
              <h3 className="text-xl font-bold text-white">CtrlLab Pro</h3>
              <p className="mt-2 text-sm text-white/50">
                Professional controller diagnostics for Xbox, PlayStation, Switch, and standard
                gamepads.
              </p>

              <div className="mt-4 flex items-center gap-2">
                <span className="rounded-lg bg-white/10 px-3 py-1 text-xs font-medium text-white/60">
                  v1.0.0
                </span>
                <span className="flex items-center gap-1 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Stable
                </span>
              </div>

              <div className="mt-6">
                <a
                  href="https://buymeacoffee.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-amber-500/40 hover:scale-[1.02]"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-1.001-1.379-.197-.069-.42-.098-.57-.241-.152-.143-.196-.366-.231-.572-.065-.378-.125-.756-.192-1.133-.057-.325-.102-.69-.25-.987-.195-.4-.597-.634-.996-.788a5.723 5.723 0 00-.626-.194c-1-.263-2.05-.36-3.077-.416a25.834 25.834 0 00-3.7.062c-.915.083-1.88.184-2.75.5-.318.116-.646.256-.888.501-.297.302-.393.77-.177 1.146.154.267.415.456.692.58.36.162.737.284 1.123.366 1.075.238 2.189.331 3.287.37 1.218.05 2.437.01 3.65-.118.299-.033.598-.073.896-.119.352-.054.578-.513.474-.834-.124-.383-.457-.531-.834-.473-.466.074-.96.108-1.382.146-1.177.08-2.358.082-3.536.006a22.228 22.228 0 01-1.157-.107c-.086-.01-.18-.025-.258-.036-.243-.036-.484-.08-.724-.13-.111-.027-.111-.185 0-.212h.005c.277-.06.557-.108.838-.147h.002c.131-.009.263-.032.394-.048a25.076 25.076 0 013.426-.12c.674.019 1.347.067 2.017.144l.228.031c.267.04.533.088.798.145.392.085.895.113 1.07.542.055.137.08.288.111.431l.319 1.484a.237.237 0 01-.199.284h-.003c-.037.006-.075.01-.112.015a36.704 36.704 0 01-4.743.295 37.059 37.059 0 01-4.699-.304c-.14-.017-.293-.042-.417-.06-.326-.048-.649-.108-.973-.161-.393-.065-.768-.032-1.123.161-.29.16-.527.404-.675.701-.154.316-.199.66-.267 1-.069.34-.176.707-.135 1.056.087.753.613 1.365 1.37 1.502a39.69 39.69 0 0011.343.376.483.483 0 01.535.53l-.071.697-1.018 9.907c-.041.41-.047.832-.125 1.237-.122.637-.553 1.028-1.182 1.171-.577.131-1.165.2-1.756.205-.656.004-1.31-.025-1.966-.022-.699.004-1.556-.06-2.095-.58-.475-.458-.54-1.174-.605-1.793l-.731-7.013-.322-3.094c-.037-.351-.286-.695-.678-.678-.336.015-.718.3-.678.679l.228 2.185.949 9.112c.147 1.344 1.174 2.068 2.446 2.272.742.12 1.503.144 2.257.156.966.016 1.942.053 2.892-.122 1.408-.258 2.465-1.198 2.616-2.657.34-3.332.683-6.663 1.024-9.995l.215-2.087a.484.484 0 01.39-.426c.402-.078.787-.212 1.074-.518.455-.488.546-1.124.385-1.766zm-1.478.772c-.145.137-.363.201-.578.233-2.416.359-4.866.54-7.308.46-1.748-.06-3.477-.254-5.207-.498-.17-.024-.353-.055-.47-.18-.22-.236-.111-.71-.054-.995.052-.26.152-.609.463-.646.484-.057 1.046.148 1.526.22.577.088 1.156.159 1.737.212 2.48.226 5.002.19 7.472-.14.45-.06.899-.13 1.345-.21.399-.072.84-.206 1.08.206.166.281.188.657.162.974a.544.544 0 01-.169.364z"/>
                  </svg>
                  <span>Buy me a coffee</span>
                </a>
              </div>
            </Panel>
          </div>
        </div>
      </div>

      {/* Help Button */}
      <button
        className="fixed bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
        aria-label="Help"
      >
        ?
      </button>
    </div>
  );
});

SettingsPage.displayName = 'SettingsPage';
