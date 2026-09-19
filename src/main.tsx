import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

type ErrorBoundaryState = {
  error: Error | null;
  info: string;
};

class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    error: null,
    info: '',
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      error,
      info: '',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('GOLEM React crash:', error);
    console.error(info.componentStack);

    this.setState({
      error,
      info: info.componentStack || '',
    });
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#020617',
          color: '#e2e8f0',
          padding: '20px',
          fontFamily: 'monospace',
          overflow: 'auto',
        }}
      >
        <h2 style={{ color: '#fb7185' }}>
          GOLEM RUNTIME ERROR
        </h2>

        <pre
          style={{
            whiteSpace: 'pre-wrap',
            overflowWrap: 'anywhere',
            border: '1px solid #ef4444',
            padding: '12px',
          }}
        >
          {this.state.error.name}: {this.state.error.message}

          {'\n\n'}
          {this.state.error.stack}

          {'\n\nCOMPONENT STACK:\n'}
          {this.state.info}
        </pre>
      </div>
    );
  }
}

window.addEventListener('error', (event) => {
  console.error('GOLEM window error:', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('GOLEM unhandled rejection:', event.reason);
});

const root = document.getElementById('root');

if (!root) {
  document.body.innerHTML =
    '<pre style="color:red;background:black;padding:20px">GOLEM ERROR: #root element missing</pre>';
  throw new Error('#root element missing');
}

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((error) => console.error('GOLEM service worker:', error));
  });
}
