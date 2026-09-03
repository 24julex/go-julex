import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#fedddd]">
          <div className="max-w-lg w-full bg-white p-6 sm:p-8 rounded-3xl border border-[#FBCBCB] shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold font-serif text-[#0F172A]">Master Portal Recovery</h2>
            <p className="text-xs text-[#475569]">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="px-4 py-2.5 rounded-xl bg-[#9F1239] text-white font-bold text-xs flex items-center gap-2 cursor-pointer hover:bg-[#881337] transition"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reload Portal
              </button>
              <a
                href="/admin/login"
                className="px-4 py-2.5 rounded-xl bg-[#fedddd] text-[#881337] font-bold text-xs border border-[#F8B4B4] flex items-center gap-2 hover:bg-rose-100 transition"
              >
                <Home className="w-3.5 h-3.5" /> Back to Unified Login
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
