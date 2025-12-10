import React from 'react';
import ReactDOM from 'react-dom/client';

const DebugApp = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-green-600 mb-4">🚀 Tivro Debug Page</h1>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">System Status</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-green-500">✅</span>
              <span className="ml-2">React is working</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500">✅</span>
              <span className="ml-2">TypeScript is working</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500">✅</span>
              <span className="ml-2">Vite is working</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500">✅</span>
              <span className="ml-2">Tailwind CSS is working</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Next Steps</h3>
          <ul className="space-y-2">
            <li><a href="/" className="text-blue-600 hover:underline">🏠 Go to Home Page</a></li>
            <li><a href="/#admin" className="text-blue-600 hover:underline">⚙️ Go to Admin Panel</a></li>
            <li><a href="/test.html" className="text-blue-600 hover:underline">🧪 Go to Test HTML Page</a></li>
          </ul>
        </div>
        
        <div className="mt-6 bg-yellow-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Debug Information</h3>
          <div className="text-sm space-y-1">
            <p><strong>URL:</strong> {window.location.href}</p>
            <p><strong>User Agent:</strong> {navigator.userAgent}</p>
            <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(<DebugApp />);
