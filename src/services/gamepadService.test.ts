/**
 * Tests for gamepadService module
 */

import { describe, it, expect } from 'vitest';
import {
  detectVendor,
  getBrowserCompatibility,
  isGamepadApiSupported,
  isSecureContext,
} from './gamepadService';

describe('detectVendor', () => {
  it('detects Xbox controllers', () => {
    expect(detectVendor('Xbox Wireless Controller')).toBe('xbox');
    expect(detectVendor('Microsoft Controller')).toBe('xbox');
    expect(detectVendor('xinput compatible device')).toBe('xbox');
  });

  it('detects PlayStation controllers', () => {
    expect(detectVendor('DualShock 4')).toBe('dualshock');
    expect(detectVendor('PlayStation Controller')).toBe('dualshock');
    expect(detectVendor('Wireless Controller')).toBe('dualshock');
    expect(detectVendor('DualSense')).toBe('dualshock');
  });

  it('detects Nintendo controllers', () => {
    expect(detectVendor('Nintendo Switch Pro Controller')).toBe('switch');
    expect(detectVendor('Pro Controller')).toBe('switch');
  });

  it('returns generic for unknown controllers', () => {
    expect(detectVendor('Unknown Gamepad')).toBe('generic');
    expect(detectVendor('8BitDo Controller')).toBe('generic');
    expect(detectVendor('')).toBe('generic');
  });

  it('is case insensitive', () => {
    expect(detectVendor('XBOX')).toBe('xbox');
    expect(detectVendor('nintendo')).toBe('switch');
  });
});

describe('isGamepadApiSupported', () => {
  it('returns boolean', () => {
    const result = isGamepadApiSupported();
    expect(typeof result).toBe('boolean');
  });
});

describe('isSecureContext', () => {
  it('returns boolean (may be undefined in test environment)', () => {
    const result = isSecureContext();
    // In jsdom test environment, window.isSecureContext may be undefined
    expect(result === true || result === false || result === undefined).toBe(true);
  });
});

describe('getBrowserCompatibility', () => {
  it('returns compatibility info object', () => {
    const compat = getBrowserCompatibility();
    
    expect(compat).toHaveProperty('isSupported');
    expect(compat).toHaveProperty('isSecure');
    expect(compat).toHaveProperty('hasGamepadApi');
    expect(compat).toHaveProperty('browserName');
    expect(compat).toHaveProperty('hasHapticsSupport');
    expect(compat).toHaveProperty('warnings');
    
    expect(typeof compat.isSupported).toBe('boolean');
    expect(typeof compat.browserName).toBe('string');
    expect(Array.isArray(compat.warnings)).toBe(true);
  });
});

