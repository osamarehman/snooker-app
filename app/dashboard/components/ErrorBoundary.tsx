"use client"

import { Component, ErrorInfo, ReactNode } from 'react'
import { toast } from 'sonner'

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    toast.error("Something went wrong")
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <h2 className="text-xl font-semibold text-red-600">Something went wrong</h2>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 