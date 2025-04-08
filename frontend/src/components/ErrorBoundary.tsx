import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';

interface Props {
  children: ReactNode;
  name?: string; // Optional name to identify which component caused the error
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error(`Error in component ${this.props.name || 'unknown'}:`, error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" gutterBottom>
            Something went wrong{this.props.name ? ` in ${this.props.name}` : ''}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Typography>
          {process.env.NODE_ENV === 'development' && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 1,
                maxWidth: '100%',
                overflow: 'auto',
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Error Details:
              </Typography>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {this.state.error?.toString()}
                {'\n\n'}
                {this.state.errorInfo?.componentStack}
              </pre>
            </Box>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleReset}
            sx={{ mt: 3 }}
          >
            Try Again
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 