"use client";

import { Component, ErrorInfo, ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error boundary caught render error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[220px] items-center justify-center px-4 py-8 text-center">
          <div className="max-w-sm rounded-lg border border-slate-200 bg-slate-50 p-6 text-slate-700 shadow-sm">
            <p className="text-lg font-semibold text-slate-800">Something went wrong. Try refreshing the page.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
