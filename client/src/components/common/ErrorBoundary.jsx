import { Component } from 'react'

/**
 * Catches runtime errors in child components and renders a recoverable
 * fallback UI instead of a blank screen. Used at the router level in
 * AppRouter.jsx so a broken page component cannot crash the entire app.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info?.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FBFD] flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg border border-gray-100 space-y-6">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 mx-auto flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
              <p className="text-gray-500 text-sm">
                An unexpected error occurred. Your data is safe — please try returning to the home page.
              </p>
            </div>
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-block w-full bg-[#0F4C81] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#0F4C81]/90 transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
