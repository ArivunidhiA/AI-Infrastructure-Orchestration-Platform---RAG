import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './components/Dashboard';
import APITest from './components/APITest';
import DetailedDebug from './components/DetailedDebug';
import WorkloadManager from './components/WorkloadManager';
import CostOptimizer from './components/CostOptimizer';
import MonitoringPage from './components/MonitoringPage';
import RAGAssistant from './components/RAGAssistant';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './components/LandingPage';
import { ShaderBackground } from './components/ui/shaders-hero-section';

function App() {
  const [showDemo, setShowDemo] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Open by default
  const [currentPage, setCurrentPage] = useState('dashboard');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSidebarOpen(false);
  };

  const handleEnterDemo = () => {
    setShowDemo(true);
  };

  const handleBackToLanding = () => {
    setShowDemo(false);
    setCurrentPage('dashboard');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'workloads':
        return <WorkloadManager />;
      case 'optimization':
        return <CostOptimizer />;
      case 'monitoring':
        return <MonitoringPage />;
      case 'rag':
        return <RAGAssistant />;
      default:
        return <Dashboard />;
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.4
  };

  // Show landing page if demo hasn't been entered
  if (!showDemo) {
    return (
      <ErrorBoundary>
        <LandingPage onEnterDemo={handleEnterDemo} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ShaderBackground>
        <motion.div 
          className="min-h-screen relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(0, 0, 0, 0.9)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
            },
          }}
        />
        
        <div className="flex h-screen">
          {/* Sidebar */}
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header onToggleSidebar={toggleSidebar} onBackToLanding={handleBackToLanding} />
            
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 pl-24">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  {renderCurrentPage()}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
        </motion.div>
      </ShaderBackground>
    </ErrorBoundary>
  );
}

export default App;
