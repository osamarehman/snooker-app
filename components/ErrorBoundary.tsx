"use client"

import { Component, ErrorInfo, ReactNode } from 'react'
import { toast } from 'sonner'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(_: Error): State {
    // eslint-disable-line react-hooks/exhaustive-deps
    console.log(_)
    return { hasError: true }
  }

  public componentDidCatch(_unusedError: Error, _: ErrorInfo) {
    console.error('Uncaught error:', _unusedError, _)
    toast.error("Something went wrong")
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-red-800 font-semibold">Something went wrong</h2>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
} 