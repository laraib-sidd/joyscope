/**
 * LiveDiagnostics - Real-time controller monitoring
 * New Figma-based layout
 */

import React, { memo, useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/shallow';

import { useControllerStore } from '@/state/controllerSlice';
import { usePreferencesStore } from '@/state/preferencesSlice';
import { triggerRumble, triggerPulse } from '@/services/gamepadService';
import { reportError } from '@/lib/errorReporter';
import {
  DEFAULT_DEAD_ZONE,
  DEFAULT_RUMBLE_DURATION_MS,
  DEFAULT_WEAK_INTENSITY,
  DEFAULT_STRONG_INTENSITY,
  RUMBLE_DEBOUNCE_MS,
} from '@/lib/constants';
import { STANDARD_BUTTONS, AXIS_INDICES } from '@/utils/buttonIndices';
import type { ButtonReading, NormalizedGamepad } from '@/types/gamepad';

// ============================================================================
// Sub-components
// ============================================================================

type PanelProps = {
  children: React.ReactNode;
  className?: string;
};

const Panel = memo(function Panel({ children, className = '' }: PanelProps) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-[#12121a] p-5 ${className}`}>
      {children}
    </div>
  );
});

Panel.displayName = 'Panel';

// Stick Visualizer
type StickVisualizerProps = {
  label: string;
  x: number;
  y: number;
  deadZone: number;
};

const StickVisualizer = memo(function StickVisualizer({
  label,
  x,
  y,
  deadZone,
}: StickVisualizerProps) {
  const magnitude = Math.sqrt(x * x + y * y);
  const isInDeadZone = magnitude < deadZone;
  const percentMag = Math.round(Math.min(magnitude, 1) * 100);

  // Calculate position as percentages - the indicator moves within 45% of the container radius
  // Using calc() to properly center the 32px (2rem) indicator
  const indicatorStyle = {
    left: `calc(50% + ${x * 45}%)`,
    top: `calc(50% + ${y * 45}%)`,
  };

  return (
    <Panel>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium text-white">{label}</h3>
        <span className="text-sm text-white/50">{percentMag}%</span>
      </div>
      <div className="mb-2 flex gap-4 font-mono text-sm">
        <span className="text-white/50">
          X: <span className="text-amber-400">{x.toFixed(2)}</span>
        </span>
        <span className="text-white/50">
          Y: <span className="text-amber-400">{y.toFixed(2)}</span>
        </span>
      </div>

      {/* Stick visualization */}
      <div className="relative mx-auto aspect-square w-full max-w-[280px]">
        {/* Background */}
        <div className="absolute inset-0 rounded-2xl border border-white/10 bg-[#0a0a10]" />

        {/* Grid lines */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-px w-full bg-white/5" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-full w-px bg-white/5" />
        </div>

        {/* Dead zone circle */}
        {deadZone > 0 && (
          <div
            className="absolute left-1/2 top-1/2 rounded-full border border-dashed border-white/20"
            style={{
              width: `${deadZone * 100}%`,
              height: `${deadZone * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}

        {/* Position indicator - using margin offset to center the 32px element */}
        <motion.div
          className={`absolute h-8 w-8 rounded-full shadow-lg ${
            isInDeadZone
              ? 'bg-amber-500 shadow-amber-500/40'
              : 'bg-gradient-to-br from-violet-400 to-cyan-400 shadow-violet-500/40'
          }`}
          style={{
            ...indicatorStyle,
            marginLeft: '-1rem', // -16px = half of 32px width
            marginTop: '-1rem',  // -16px = half of 32px height
          }}
          animate={{ scale: isInDeadZone ? 0.85 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-white/50">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span>Dead Zone</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-gradient-to-br from-violet-400 to-cyan-400" />
          <span>Active</span>
        </div>
      </div>
    </Panel>
  );
});

StickVisualizer.displayName = 'StickVisualizer';

// Button display
type ButtonItemProps = {
  button: ButtonReading;
  label: string;
  circular?: boolean;
};

const XBOX_COLORS: Record<string, { bg: string; activeBg: string; text: string }> = {
  A: { bg: 'bg-emerald-500/20', activeBg: 'bg-emerald-500', text: 'text-emerald-400' },
  B: { bg: 'bg-rose-500/20', activeBg: 'bg-rose-500', text: 'text-rose-400' },
  X: { bg: 'bg-blue-500/20', activeBg: 'bg-blue-500', text: 'text-blue-400' },
  Y: { bg: 'bg-amber-500/20', activeBg: 'bg-amber-500', text: 'text-amber-400' },
};

const ButtonItem = memo(function ButtonItem({
  button,
  label,
  circular = false,
}: ButtonItemProps) {
  const xboxColor = XBOX_COLORS[label];

  // Circular face button style (A, B, X, Y)
  if (circular && xboxColor) {
    return (
      <motion.div
        className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
          button.pressed
            ? `${xboxColor.activeBg} border-transparent text-white shadow-lg`
            : `${xboxColor.bg} border-white/10 ${xboxColor.text}`
        }`}
        animate={{ scale: button.pressed ? 0.9 : 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        role="status"
        aria-label={`${label}: ${button.pressed ? 'pressed' : 'released'}`}
      >
        {label}
      </motion.div>
    );
  }

  // Rectangular button style (bumpers, triggers, menu, etc.)
  return (
    <motion.div
      className={`flex h-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
        button.pressed
          ? 'border-violet-400/50 bg-violet-500 text-white'
          : 'border-white/10 bg-white/5 text-white/50'
      }`}
      animate={{ scale: button.pressed ? 0.95 : 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      role="status"
      aria-label={`${label}: ${button.pressed ? 'pressed' : 'released'}`}
    >
      {label}
    </motion.div>
  );
});

ButtonItem.displayName = 'ButtonItem';

// Buttons Panel
type ButtonsPanelProps = {
  buttons: ButtonReading[];
};

const ButtonsPanel = memo(function ButtonsPanel({ buttons }: ButtonsPanelProps) {
  const getButton = (index: number): ButtonReading =>
    buttons[index] ?? { index, label: `B${index}`, pressed: false, value: 0 };

  const pressedCount = buttons.filter((b) => b.pressed || b.value > 0.2).length;

  return (
    <Panel>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium text-white">Buttons</h3>
        <span className="text-sm text-white/50">{pressedCount}/{buttons.length}</span>
      </div>

      {/* Bumpers */}
      <div className="mb-3 grid grid-cols-2 gap-2">
        <ButtonItem button={getButton(4)} label="LB" />
        <ButtonItem button={getButton(5)} label="RB" />
      </div>

      {/* Face buttons diamond - Xbox layout */}
      <div className="relative mx-auto my-6 h-28 w-28">
        {/* Y - Top */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1">
          <ButtonItem button={getButton(3)} label="Y" circular />
        </div>
        {/* X - Left */}
        <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2">
          <ButtonItem button={getButton(2)} label="X" circular />
        </div>
        {/* B - Right */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1">
          <ButtonItem button={getButton(1)} label="B" circular />
        </div>
        {/* A - Bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1">
          <ButtonItem button={getButton(0)} label="A" circular />
        </div>
      </div>

      {/* Menu buttons */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <ButtonItem button={getButton(8)} label="View" />
        <ButtonItem button={getButton(9)} label="Menu" />
      </div>

      {/* Stick buttons */}
      <div className="mt-2 grid grid-cols-2 gap-2">
        <ButtonItem button={getButton(10)} label="L3" />
        <ButtonItem button={getButton(11)} label="R3" />
      </div>
    </Panel>
  );
});

ButtonsPanel.displayName = 'ButtonsPanel';

// D-Pad
type DPadProps = {
  buttons: ButtonReading[];
};

const DPad = memo(function DPad({ buttons }: DPadProps) {
  const up = buttons[12]?.pressed ?? false;
  const down = buttons[13]?.pressed ?? false;
  const left = buttons[14]?.pressed ?? false;
  const right = buttons[15]?.pressed ?? false;

  const btnClass = (pressed: boolean): string =>
    `flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
      pressed
        ? 'border-violet-400/50 bg-violet-500/30 text-white'
        : 'border-white/10 bg-white/5 text-white/30'
    }`;

  return (
    <Panel>
      <h3 className="mb-4 font-medium text-white">D-Pad</h3>
      <div className="mx-auto grid w-fit grid-cols-3 gap-1">
        <div />
        <button className={btnClass(up)} aria-label="D-Pad Up">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <div />
        <button className={btnClass(left)} aria-label="D-Pad Left">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="h-10 w-10 rounded-lg border border-white/5 bg-white/[0.02]" />
        <button className={btnClass(right)} aria-label="D-Pad Right">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div />
        <button className={btnClass(down)} aria-label="D-Pad Down">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div />
      </div>
    </Panel>
  );
});

DPad.displayName = 'DPad';

// Haptics Control
type HapticsProps = {
  gamepadIndex?: number;
  hasRumble: boolean;
};

const HapticsControl = memo(function HapticsControl({ gamepadIndex, hasRumble }: HapticsProps) {
  const [intensity, setIntensity] = useState(0.5);
  const [activePreset, setActivePreset] = useState<'low' | 'medium' | 'high' | null>('medium');
  const lastTriggerRef = useRef<number>(0);

  const handlePreset = useCallback(async (preset: 'low' | 'medium' | 'high') => {
    if (gamepadIndex === undefined || !hasRumble) return;
    const now = Date.now();
    if (now - lastTriggerRef.current < RUMBLE_DEBOUNCE_MS) return;
    lastTriggerRef.current = now;
    setActivePreset(preset);
    await triggerPulse(gamepadIndex, preset);
  }, [gamepadIndex, hasRumble]);

  const handleTest = useCallback(async () => {
    if (gamepadIndex === undefined || !hasRumble) return;
    const now = Date.now();
    if (now - lastTriggerRef.current < RUMBLE_DEBOUNCE_MS) return;
    lastTriggerRef.current = now;

    const result = await triggerRumble(gamepadIndex, {
      duration: DEFAULT_RUMBLE_DURATION_MS,
      weakMagnitude: intensity * DEFAULT_WEAK_INTENSITY,
      strongMagnitude: intensity * DEFAULT_STRONG_INTENSITY,
    });

    if (!result.success) {
      reportError(new Error(result.error), 'warning', { action: 'triggerRumble' });
    }
  }, [gamepadIndex, hasRumble, intensity]);

  return (
    <Panel>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-medium text-white">Haptics</h3>
          <p className="text-xs text-white/40">Vibration intensity</p>
        </div>
        <span className="text-lg font-semibold text-white">{Math.round(intensity * 100)}%</span>
      </div>

      <input
        type="range"
        min="0.1"
        max="1"
        step="0.1"
        value={intensity}
        onChange={(e) => {
          setIntensity(parseFloat(e.target.value));
          setActivePreset(null);
        }}
        className="mb-4 w-full"
        style={{
          // Calculate progress percentage: (value - min) / (max - min) * 100
          ['--range-progress' as string]: `${((intensity - 0.1) / (1 - 0.1)) * 100}%`,
        }}
        disabled={!hasRumble}
        aria-label="Vibration intensity"
      />

      <div className="grid grid-cols-4 gap-2">
        {(['low', 'medium', 'high'] as const).map((preset) => (
          <button
            key={preset}
            onClick={() => void handlePreset(preset)}
            disabled={!hasRumble}
            className={`rounded-lg py-2.5 text-sm font-medium capitalize transition-colors ${
              activePreset === preset
                ? 'bg-violet-500 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            } disabled:opacity-40`}
          >
            {preset}
          </button>
        ))}
        <button
          onClick={() => void handleTest()}
          disabled={!hasRumble}
          className="rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Test
        </button>
      </div>

      {!hasRumble && (
        <p className="mt-3 text-center text-xs text-white/40">
          Haptics not supported on this controller
        </p>
      )}
    </Panel>
  );
});

HapticsControl.displayName = 'HapticsControl';

// Dead Zone Control
type DeadZoneControlProps = {
  leftDeadZone: number;
  rightDeadZone: number;
  onLeftChange: (value: number) => void;
  onRightChange: (value: number) => void;
  onReset: () => void;
};

const DeadZoneControl = memo(function DeadZoneControl({
  leftDeadZone,
  rightDeadZone,
  onReset,
}: DeadZoneControlProps) {
  return (
    <Panel>
      <div className="mb-4">
        <h3 className="font-medium text-white">Dead Zone</h3>
        <p className="text-xs text-white/40">Adjust to compensate for stick drift</p>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <button className="rounded-xl border border-white/10 bg-white/5 py-3 text-sm text-white/70">
          Left: {Math.round(leftDeadZone * 100)}%
        </button>
        <button className="rounded-xl border border-white/10 bg-white/5 py-3 text-sm text-white/70">
          Right: {Math.round(rightDeadZone * 100)}%
        </button>
      </div>

      <button
        onClick={onReset}
        className="w-full rounded-xl bg-violet-500/20 py-3 text-sm font-medium text-violet-300 transition-colors hover:bg-violet-500/30"
      >
        Reset to Default
      </button>
    </Panel>
  );
});

DeadZoneControl.displayName = 'DeadZoneControl';

// Trigger Meter
type TriggerMeterProps = {
  label: string;
  value: number;
};

const TriggerMeter = memo(function TriggerMeter({ label, value }: TriggerMeterProps) {
  const percent = Math.round(value * 100);
  
  return (
    <Panel className="py-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium text-white">{label}</span>
        <span className="text-sm text-white/50">{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>
    </Panel>
  );
});

TriggerMeter.displayName = 'TriggerMeter';

// Latency Display
type LatencyDisplayProps = {
  latencyMs: number;
  isSimulation: boolean;
  hasController: boolean;
};

const LatencyDisplay = memo(function LatencyDisplay({
  latencyMs,
  isSimulation,
  hasController,
}: LatencyDisplayProps) {
  const showLatency = hasController && !isSimulation && latencyMs > 0;

  return (
    <Panel>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium text-white">Latency</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            showLatency
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'bg-amber-500/20 text-amber-300'
          }`}
        >
          {showLatency ? 'MEASURING' : 'WAITING'}
        </span>
      </div>

      <div className="mb-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-white">
          {showLatency ? latencyMs.toFixed(0) : '—'}
        </span>
        <span className="text-xl text-white/50">ms</span>
      </div>

      <button className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm text-white/60 transition-colors hover:bg-white/10">
        Connect New Controller
      </button>
    </Panel>
  );
});

LatencyDisplay.displayName = 'LatencyDisplay';

// ============================================================================
// Main Component
// ============================================================================

export const LiveDiagnosticsPage = memo(function LiveDiagnosticsPage() {
  const { controllers, activeSlot } = useControllerStore(
    useShallow((state) => ({
      controllers: state.controllers,
      activeSlot: state.activeSlot,
    }))
  );
  const { simulationMode, deadZone, setDeadZone } = usePreferencesStore(
    useShallow((state) => ({
      simulationMode: state.simulationMode,
      deadZone: state.deadZone,
      setDeadZone: state.setDeadZone,
    }))
  );

  const controller: NormalizedGamepad | undefined =
    activeSlot !== undefined ? controllers[activeSlot] : Object.values(controllers)[0];

  // Latency tracking
  const [latencyMs, setLatencyMs] = useState(0);
  const prevTimestampRef = useRef<number>(0);

  useEffect(() => {
    setLatencyMs(0);
    prevTimestampRef.current = 0;
  }, [simulationMode]);

  useEffect(() => {
    if (!controller || simulationMode) return;
    const gamepadTimestamp = controller.timestamp;
    const now = performance.now();

    if (prevTimestampRef.current > 0 && gamepadTimestamp !== prevTimestampRef.current) {
      const latency = now - gamepadTimestamp;
      if (latency > 0 && latency < 100) {
        setLatencyMs((prev) => (prev === 0 ? latency : prev * 0.8 + latency * 0.2));
      }
    }
    prevTimestampRef.current = gamepadTimestamp;
  }, [controller, simulationMode]);

  // Controller data
  const buttons = controller?.buttons ?? [];
  const leftStick = {
    x: controller?.axes[AXIS_INDICES.LEFT_X]?.value ?? 0,
    y: controller?.axes[AXIS_INDICES.LEFT_Y]?.value ?? 0,
  };
  const rightStick = {
    x: controller?.axes[AXIS_INDICES.RIGHT_X]?.value ?? 0,
    y: controller?.axes[AXIS_INDICES.RIGHT_Y]?.value ?? 0,
  };
  const leftTrigger = buttons[STANDARD_BUTTONS.TRIGGER_LEFT]?.value ?? 0;
  const rightTrigger = buttons[STANDARD_BUTTONS.TRIGGER_RIGHT]?.value ?? 0;
  const hasRumble = controller?.haptics?.hasRumble ?? false;
  const hasController = !!controller;

  const handleResetDeadZone = useCallback(() => {
    setDeadZone(DEFAULT_DEAD_ZONE);
  }, [setDeadZone]);

  return (
    <div className="min-h-screen px-6 pb-8 pt-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Live Diagnostics</h1>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                hasController
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-white/10 text-white/50'
              }`}
            >
              {hasController ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
          <p className="mt-1 font-mono text-sm text-white/40">
            {controller?.id ?? 'No controller connected'}
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid gap-4 lg:grid-cols-12">
          {/* Left Column - Sticks */}
          <div className="space-y-4 lg:col-span-4">
            <StickVisualizer
              label="Left Stick"
              x={leftStick.x}
              y={leftStick.y}
              deadZone={deadZone}
            />
            <StickVisualizer
              label="Right Stick"
              x={rightStick.x}
              y={rightStick.y}
              deadZone={deadZone}
            />
          </div>

          {/* Middle Column - Controls */}
          <div className="space-y-4 lg:col-span-4">
            <HapticsControl gamepadIndex={controller?.slot} hasRumble={hasRumble} />
            <DeadZoneControl
              leftDeadZone={deadZone}
              rightDeadZone={deadZone}
              onLeftChange={setDeadZone}
              onRightChange={setDeadZone}
              onReset={handleResetDeadZone}
            />
          </div>

          {/* Right Column - Buttons, D-Pad, Triggers, Latency */}
          <div className="space-y-4 lg:col-span-4">
            <ButtonsPanel buttons={buttons} />
            <DPad buttons={buttons} />
            <TriggerMeter label="LT" value={leftTrigger} />
            <TriggerMeter label="RT" value={rightTrigger} />
            <LatencyDisplay
              latencyMs={latencyMs}
              isSimulation={simulationMode}
              hasController={hasController}
            />
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

LiveDiagnosticsPage.displayName = 'LiveDiagnosticsPage';
