import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Server, 
  TrendingUp, 
  BarChart3, 
  MessageSquare, 
  X,
  Settings,
  HelpCircle
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose, currentPage, onPageChange }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/' },
    { id: 'workloads', label: 'Workloads', icon: Server, path: '/workloads' },
    { id: 'optimization', label: 'Cost Optimizer', icon: TrendingUp, path: '/optimization' },
    { id: 'monitoring', label: 'Monitoring', icon: BarChart3, path: '/monitoring' },
    { id: 'rag', label: 'AI Assistant', icon: MessageSquare, path: '/rag' },
  ];

  const handleItemClick = (item) => {
    onPageChange(item.id);
    onClose();
  };

  const handleSettingsClick = () => {
    setShowSettings(!showSettings);
    setShowHelp(false);
  };

  const handleHelpClick = () => {
    setShowHelp(!showHelp);
    setShowSettings(false);
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <motion.div 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-black/95 backdrop-blur-lg border-r border-gray-800/50
          lg:translate-x-0 lg:static lg:inset-0 sidebar-desktop
        `}
        initial={{ x: -256 }}
        animate={{ x: isOpen ? 0 : -256 }}
        transition={{ 
          type: "spring", 
          damping: 25, 
          stiffness: 200 
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Server className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">AI Infra</h1>
                <p className="text-xs text-gray-400">Orchestration Platform</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-white text-black' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                    }
                  `}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ 
                    scale: 1.02,
                    x: 5,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    animate={{ 
                      rotate: isActive ? 360 : 0,
                      scale: isActive ? 1.1 : 1
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-gray-400'}`} />
                  </motion.div>
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      className="ml-auto w-2 h-2 bg-black rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-700/50">
            <div className="space-y-2">
              <button 
                onClick={handleSettingsClick}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-400" />
                <span className="font-medium">Settings</span>
              </button>
              <button 
                onClick={handleHelpClick}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
              >
                <HelpCircle className="w-5 h-5 text-gray-400" />
                <span className="font-medium">Help</span>
              </button>
            </div>

            {/* Settings Modal */}
            {showSettings && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div 
                  className="bg-gray-900/95 backdrop-blur-lg border border-gray-700/50 rounded-xl shadow-2xl max-w-md w-full"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-white">Settings</h3>
                      <button 
                        onClick={() => setShowSettings(false)}
                        className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <X className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                        <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                          <option>Dark</option>
                          <option>Light</option>
                          <option>Auto</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Notifications</label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-3" defaultChecked />
                            <span className="text-sm text-gray-300">Email notifications</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-3" defaultChecked />
                            <span className="text-sm text-gray-300">System alerts</span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3 pt-4">
                        <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Save Changes
                        </button>
                        <button 
                          onClick={() => setShowSettings(false)}
                          className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Help Modal */}
            {showHelp && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div 
                  className="bg-gray-900/95 backdrop-blur-lg border border-gray-700/50 rounded-xl shadow-2xl max-w-2xl w-full"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-white">Help & Support</h3>
                      <button 
                        onClick={() => setShowHelp(false)}
                        className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <X className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Getting Started</h4>
                        <div className="space-y-2 text-sm text-gray-300">
                          <p>• Create your first workload in the Workloads section</p>
                          <p>• Monitor performance in the Monitoring tab</p>
                          <p>• Get cost optimization recommendations</p>
                          <p>• Use the AI Assistant for help with queries</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Keyboard Shortcuts</h4>
                        <div className="space-y-2 text-sm text-gray-300">
                          <p><kbd className="px-2 py-1 bg-gray-800 rounded">Ctrl + K</kbd> - Search</p>
                          <p><kbd className="px-2 py-1 bg-gray-800 rounded">Ctrl + N</kbd> - New Workload</p>
                          <p><kbd className="px-2 py-1 bg-gray-800 rounded">Esc</kbd> - Close modals</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3 pt-4">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Contact Support
                        </button>
                        <button 
                          onClick={() => setShowHelp(false)}
                          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
            
            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">System Online</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">All services running</p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
