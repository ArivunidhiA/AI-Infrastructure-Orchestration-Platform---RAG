import React, { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { isBackendHealthy } from '../services/health';

const DemoModeBanner = () => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check backend health on mount
    const checkHealth = () => {
      setIsDemoMode(!isBackendHealthy());
    };
    
    checkHealth();
    
    // Listen for backend status changes
    const handleStatusChange = (event) => {
      setIsDemoMode(!event.detail.available);
    };
    
    window.addEventListener('backend-status-changed', handleStatusChange);
    window.addEventListener('demo-mode-active', () => setIsDemoMode(true));
    
    return () => {
      window.removeEventListener('backend-status-changed', handleStatusChange);
      window.removeEventListener('demo-mode-active', () => setIsDemoMode(true));
    };
  }, []);

  if (!isDemoMode || !isVisible) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500/90 backdrop-blur-sm border-b border-yellow-400/50">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-900" />
            <p className="text-sm font-medium text-yellow-900">
              <span className="font-bold">Demo Mode:</span> Backend unavailable. Showing sample data for portfolio demonstration.
            </p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-yellow-900 hover:text-yellow-950 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoModeBanner;

