import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallbackMessage?: string;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-full w-full p-8 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">
                        Something went wrong
                    </h3>
                    <p className="text-xs text-slate-500 mb-4 text-center max-w-xs">
                        {this.props.fallbackMessage || 'An unexpected error occurred in this section.'}
                    </p>
                    <button
                        onClick={this.handleReset}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Try Again
                    </button>
                    {this.state.error && (
                        <details className="mt-4 w-full max-w-sm">
                            <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">
                                Error details
                            </summary>
                            <pre className="mt-2 text-xs text-red-600 bg-red-50 p-3 rounded-md overflow-auto max-h-32 border border-red-100">
                                {this.state.error.message}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
