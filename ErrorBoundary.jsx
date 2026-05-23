import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Algo salió mal.</h2>
          <p style={{ color: 'var(--text2)', marginBottom: '2rem' }}>Ocurrió un error inesperado al cargar la plataforma.</p>
          <button 
            className="btn btn--primary" 
            onClick={() => window.location.reload()}
          >
            Intentar de nuevo
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
