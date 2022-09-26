import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    error: null,
  };

  public static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      // You can render any custom fallback UI
      return (
        <div className="w-screen h-screen flex items-center justify-center">
          <div className="flex flex-col items-center">
            <img alt="..." src="/image/error.svg" className="w-16" />
            <p className="mt-2">Sorry.. something went wrong</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
