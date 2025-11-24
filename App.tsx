import React, { Component, ReactNode, useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { Home } from './pages/Home';
import { Admin } from './pages/Admin';
import { Legal } from './pages/Legal';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

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
            <pre className="bg-slate-100 p-4 rounded text-xs text-left overflow-auto text-red-500">
              {this.state.error?.toString()}
            </pre>
            <button onClick={() => window.location.reload()} className="mt-6 bg-slate-900 text-white px-6 py-2 rounded-lg">Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const Router = () => {
  const [route, setRoute] = useState(window.location.hash || '#');

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash || '#');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (route.startsWith('#admin') || route.startsWith('#login')) return <Admin />;
  if (route === '#privacy') return <Legal type="privacy" />;
  if (route === '#terms') return <Legal type="terms" />;

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