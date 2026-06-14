/**
 * Filename: ErrorBoundary.tsx
 * Folder: /components/ui/
 */

import React, { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error);
      }

      return (
        <box
          style={{
            border: true,
            borderColor: "red",
            padding: 2,
            flexDirection: "column",
            gap: 1,
          }}
        >
          <text fg="red">
            <strong>Error occurred</strong>
          </text>
          <text>{this.state.error.message}</text>
          <text fg="gray">Press R to reload</text>
        </box>
      );
    }

    return this.props.children;
  }
}
