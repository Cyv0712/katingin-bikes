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
          style={{
            minHeight: '80vh',
            backgroundColor: '#080808',
            color: '#f0f0f0',
            padding: '20px'
          }}
        >
          <Container>
            {isNetwork ? (
              <WifiOff className="text-accent mb-4 animate-bounce" size={64} strokeWidth={1.5} />
            ) : (
              <RefreshCw className="text-accent mb-4" size={64} strokeWidth={1.5} />
            )}
            
            <h1 className="moto-heading mb-3" style={{ fontSize: '2rem', letterSpacing: '2px' }}>
              {isNetwork ? 'CONNECTION INTERRUPTED' : 'SOMETHING WENT WRONG'}
            </h1>
            
            <p className="text-secondary mx-auto mb-5" style={{ maxWidth: '480px', fontSize: '0.95rem', lineHeight: '1.6' }}>
              {isNetwork 
                ? 'We encountered an issue downloading the page assets. This usually happens when the internet connection is unstable or temporarily drops.' 
                : 'An unexpected application error occurred. Let\'s reload to resolve the layout.'}
            </p>

            <button 
              onClick={this.handleReload} 
              className="moto-btn px-5 py-3 d-inline-flex align-items-center gap-2"
              style={{ letterSpacing: '2px', fontWeight: 700 }}
            >
              <RefreshCw size={18} />
              RELOAD PAGE
            </button>
          </Container>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
