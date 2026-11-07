import React from 'react';
import { Container } from 'react-bootstrap';
import { RefreshCw, WifiOff } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorType: 'general' };
  }

  static getDerivedStateFromError(error) {
    const errorText = error.message || '';
    const isChunkError =
      error.name === 'ChunkLoadError' ||
      errorText.includes('Failed to fetch dynamically imported module') ||
      errorText.includes('loading chunk');

    return {
      hasError: true,
      errorType: isChunkError ? 'network' : 'general'
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isNetwork = this.state.errorType === 'network';

      return (
        <div
          className="d-flex align-items-center justify-content-center text-center"
          style={{ minHeight: '80vh', padding: '20px' }}
        >
          <Container>
            {isNetwork ? (
              <WifiOff className="text-accent mb-4" size={56} strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <RefreshCw className="text-accent mb-4" size={56} strokeWidth={1.75} aria-hidden="true" />
            )}

            <h1 className="kb-h2 mb-3">
              {isNetwork ? 'Connection interrupted' : 'Something went wrong'}
            </h1>

            <p className="kb-body-lg mx-auto mb-5" style={{ maxWidth: '480px' }}>
              {isNetwork
                ? 'We had trouble downloading the page. This usually happens when the internet connection is unstable or drops for a moment.'
                : 'An unexpected error occurred. Reload the page to try again.'}
            </p>

            <button onClick={this.handleReload} className="moto-btn">
              <RefreshCw size={18} strokeWidth={1.75} aria-hidden="true" />
              Reload page
            </button>
          </Container>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
