/**
 * Navigation - Top navigation bar with CtrlLab PRO branding
 */

import { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';

type NavigationProps = {
  controllerCount: number;
};

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/live', label: 'Diagnostics' },
  { path: '/settings', label: 'Settings' },
];

export const Navigation = memo(function Navigation({ controllerCount }: NavigationProps) {
  const location = useLocation();

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-[#0d0d12]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
              <circle cx="8" cy="12" r="2" fill="currentColor" />
              <circle cx="16" cy="12" r="2" fill="currentColor" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-white">CtrlLab</span>
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs font-medium text-white/60">
              PRO
            </span>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-violet-500" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Controller Status */}
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2">
          <svg
            className="h-4 w-4 text-white/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <circle cx="8" cy="12" r="2" />
            <circle cx="16" cy="12" r="2" />
          </svg>
          <span className="text-sm text-white/60">
            {controllerCount > 0
              ? `${controllerCount} Connected`
              : 'Waiting for Controller'}
          </span>
        </div>
      </div>
    </nav>
  );
});

Navigation.displayName = 'Navigation';
