import { Component, ErrorInfo, ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] items-center justify-center p-8">
          <div className="max-w-md rounded-3xl border border-rose-400/30 bg-rose-500/10 p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
            <p className="mt-2 text-white/70">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20"
              >
                Try again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-6 py-3 text-sm font-semibold text-rose-200 hover:bg-rose-500/20"
              >
                Reload page
              </button>
            </div>
            {this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-white/50 hover:text-white/70">
                  Technical details
                </summary>
                <pre className="mt-2 overflow-auto rounded-xl bg-slate-950/50 p-4 text-xs text-white/60">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
