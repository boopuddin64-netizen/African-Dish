import React from 'react';

interface State {
  error: Error | null;
}

/** Catches render-time errors anywhere below it and shows a recoverable fallback instead of a blank page. */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="min-h-screen flex items-center justify-center bg-[#FAF7F0] dark:bg-[#141210] p-6">
        <div className="max-w-md w-full bg-white dark:bg-[#1E1B18] border border-[#EAE4DC] dark:border-stone-800 rounded-3xl p-6 text-center shadow-lg">
          <h1 className="text-lg font-extrabold text-[#241A17] dark:text-stone-100">Something went wrong</h1>
          <p className="text-xs text-[#807872] dark:text-stone-400 mt-2">
            The app hit an unexpected error. Your cart and orders are safe. Try again, or reload the page.
          </p>
          <pre className="mt-3 text-[11px] text-left text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 rounded-xl p-2 overflow-auto max-h-32">
            {this.state.error.message}
          </pre>
          <div className="mt-4 flex gap-2 justify-center">
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              className="px-4 py-2 rounded-full bg-[#C85C43] text-white text-xs font-bold"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-full border border-[#EAE4DC] dark:border-stone-700 text-xs font-bold text-[#241A17] dark:text-stone-100"
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }
}
