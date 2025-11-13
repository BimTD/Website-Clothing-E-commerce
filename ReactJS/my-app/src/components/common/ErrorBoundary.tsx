import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}


// Xử lý lỗi toàn cục
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-5">
          <div className="text-center bg-white p-10 rounded-lg shadow-soft max-w-md">
            <h2 className="text-2xl font-bold text-red-600 mb-5">Something went wrong</h2>
            <p className="text-gray-600 mb-8">We're sorry, but something unexpected happened.</p>
            <button 
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="btn btn-primary"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
