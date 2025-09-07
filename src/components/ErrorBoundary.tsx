'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<{error: Error}>;
}

interface State {
  hasError: boolean;
  error?: Error;
}

const DefaultErrorFallback = ({ error }: { error: Error }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md mx-auto text-center p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
      <p className="text-gray-600 mb-4">
        There was an error loading this page. Please refresh to try again.
      </p>
      <details className="text-sm text-gray-500 text-left">
        <summary className="cursor-pointer mb-2">Error details</summary>
        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
          {error.message}
        </pre>
      </details>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Refresh Page
      </button>
    </div>
  </div>
);

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service in production
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} />;
    }

    return this.props.children;
  }
}
