"use client";
import React from "react";
import Link from "next/link";
import ErrorPage from "./ErrorPage";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom error page based on error type
      const getErrorType = () => {
        if (this.state.error?.message?.includes('404')) return '404';
        if (this.state.error?.message?.includes('500')) return '500';
        if (this.state.error?.message?.includes('403')) return '403';
        if (this.state.error?.message?.includes('network')) return 'network';
        return '500'; // Default to server error for component errors
      };

      const customActions = (
        <div className="error-actions">
          <button 
            className="btn btn-outline-secondary me-2"
            onClick={() => window.history.back()}
          >
            ← Go Back
          </button>
          <button 
            className="btn btn-outline-primary me-2"
            onClick={this.handleRetry}
          >
            🔄 Try Again
          </button>
          <Link 
            title="Go to Dashboard"
            href="/portal/dashboard"
            className="btn btn-primary"
          >
            🏠 Go to Dashboard
          </Link>
        </div>
      );

      return (
        <ErrorPage
          errorType={getErrorType()}
          title="Portal Error"
          message="Something went wrong while loading the portal. Please try again."
          showRetry={false}
          showHome={false}
          customActions={customActions}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
