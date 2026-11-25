import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('GramVerse AI caught unexpected UI error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('gramverse_current_role');
      localStorage.removeItem('gramverse_selected_village');
    } catch {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
          <div className="max-w-md w-full bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold">GramVerse-AI Ready to Resume</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                A temporary display conflict was safely intercepted to keep the application stable.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                onClick={this.handleReset}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-xs text-slate-950 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Reload GramVerse Dashboard
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                }}
                className="w-full py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 font-semibold text-xs text-white transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" /> Try Continuing Session
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
