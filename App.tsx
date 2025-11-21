import React, { ReactNode, useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { Home } from './pages/Home';
import { Admin } from './pages/Admin';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Simple Error Boundary to catch rendering errors
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-8 text-center">
          <div className="bg-white p-8 rounded-xl shadow-xl max-w-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-slate-600 mb-4">The application encountered an error. Please check the console for details.</p>
            <pre className="bg-slate-100 p-4 rounded text-xs text-left overflow-auto text-red-500">
              {this.state.error?.toString()}
            </pre>
            <button onClick={() => window.location.reload()} className="mt-6 bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800">
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple hash-based router implementation
const Router = () => {
  const [route, setRoute] = useState(window.location.hash || '#');

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash || '#');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (route.startsWith('#admin')) {
    return <Admin />;
  }
  
  if (route.startsWith('#login')) {
    return <Admin />; // Reuse Admin component which handles login state
  }

  return <Home />;
};

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;