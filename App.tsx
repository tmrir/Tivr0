import React from 'react';
import { AppProvider } from './context/AppContext';
import { Home } from './pages/Home';
import { Admin } from './pages/Admin';
import { useApp } from './context/AppContext';

// Simple hash-based router implementation since we can't use react-router-dom's BrowserRouter on some previews
const Router = () => {
  const [route, setRoute] = React.useState(window.location.hash || '#');

  React.useEffect(() => {
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
    <AppProvider>
      <Router />
    </AppProvider>
  );
}

export default App;