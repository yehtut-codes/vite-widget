import React, { Component } from 'react'
import type { ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: React.ComponentType<{ error?: Error }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

// Default fallback component
const DefaultErrorFallback: React.FC<{ error?: Error }> = ({ error }) => (
  <div style={{
    padding: '1rem',
    border: '2px solid #ff6b6b',
    borderRadius: '8px',
    backgroundColor: '#ffe0e0',
    color: '#d63031',
    textAlign: 'center',
    fontFamily: 'system-ui, sans-serif'
  }}>
    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
      Widget Error
    </h3>
    <p style={{ margin: '0', fontSize: '0.9rem' }}>
      {error?.message || 'Something went wrong while loading the widget.'}
    </p>
    <button
      onClick={() => window.location.reload()}
      style={{
        marginTop: '0.5rem',
        padding: '0.25rem 0.5rem',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: '#d63031',
        color: 'white',
        cursor: 'pointer',
        fontSize: '0.8rem'
      }}
    >
      Reload Page
    </button>
  </div>
)

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details
    console.error('Widget Error Boundary caught an error:', error)
    console.error('Error Info:', errorInfo)

    // Call custom error handler
    this.props.onError?.(error, errorInfo)

    // Report to external error tracking (if available)
    if (typeof window !== 'undefined') {
      // Sentry
      if ((window as any).Sentry) {
        (window as any).Sentry.captureException(error, {
          contexts: { 
            react: { 
              componentStack: errorInfo.componentStack 
            } 
          }
        })
      }

      // Custom error reporting
      if ((window as any).reportWidgetError) {
        (window as any).reportWidgetError(error, errorInfo)
      }
    }
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error} />
    }

    return this.props.children
  }
}

export default ErrorBoundary