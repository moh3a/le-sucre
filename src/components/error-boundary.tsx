"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback UI - overrides the default error card */
  fallback?: ReactNode;
  /** Called when the error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

function DefaultErrorFallback({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="flex min-h-[300px] items-center justify-center p-6">
      <Card className="max-w-md text-center">
        <CardContent className="space-y-4 pt-6">
          <AlertTriangle className="text-crimson-violet mx-auto size-10 opacity-80" />
          <CardTitle className="text-lg">Something went wrong</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            {error.message || "An unexpected error occurred. Please try again."}
          </CardDescription>
          <div className="flex justify-center gap-2">
            <Button size="sm" onClick={onRetry} className="gap-1.5">
              <RefreshCw className="size-3.5" />
              Retry
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.history.back()}
              className="gap-1.5"
            >
              <ArrowLeft className="size-3.5" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
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
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <DefaultErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
export type { ErrorBoundaryProps };
