'use client';

import { Component, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="max-w-md mx-auto mt-20 text-center space-y-4">
          <div className="w-14 h-14 rounded-xl bg-danger/15 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7 text-danger" />
          </div>
          <h2 className="text-lg font-bold text-surface-800">Something went wrong</h2>
          <p className="text-sm text-surface-500">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/15 text-primary text-sm font-medium hover:bg-primary/25 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
