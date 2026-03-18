'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'Something went wrong.';
      try {
        const parsed = JSON.parse(this.state.error?.message || '{}');
        if (parsed.error) {
          errorMessage = `Firestore Error: ${parsed.error}`;
        }
      } catch {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-black p-8 text-center">
          <div className="max-w-md w-full glass-card p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-apple-red/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
            
            <div className="w-20 h-20 bg-apple-red/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-apple-red/20 shadow-xl">
              <AlertTriangle className="w-10 h-10 text-apple-red" />
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Упс! Ошибка</h2>
            <p className="text-white/40 mb-10 leading-relaxed font-medium">
              {errorMessage}
            </p>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-3 red-gradient text-white py-5 px-8 rounded-3xl font-bold shadow-xl red-glow hover:brightness-110 transition-all active:scale-95"
            >
              <RefreshCw className="w-5 h-5" />
              Перезагрузить
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
