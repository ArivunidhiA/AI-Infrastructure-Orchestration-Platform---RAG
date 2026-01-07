import React, { useState, useEffect } from 'react';
import { Menu, Bell, User, Activity, Home } from 'lucide-react';
import { monitoringAPI } from '../services/api';

const Header = ({ onToggleSidebar, onBackToLanding }) => {
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [systemStatus, setSystemStatus] = useState('online');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    // Fetch system alerts
    const fetchAlerts = async () => {
      try {
        const response = await monitoringAPI.getSystemAlerts();
        setAlerts(response.data.alerts || []);
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // Fetch every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const criticalAlerts = alerts.filter(alert => alert.type === 'warning').length;
  const hasAlerts = criticalAlerts > 0;

  const handleUserMenuToggle = () => {
    setShowUserMenu(!showUserMenu);
  };

  return (
    <header className="bg-black/50 backdrop-blur-lg border-b border-gray-800/50 px-4 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4 pl-0">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-300" />
          </button>
          
          <div className="hidden md:flex items-center space-x-4">
            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors ml-0"
                title="Back to Landing Page"
              >
                <Home className="w-5 h-5 text-gray-300" />
              </button>
            )}
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-light tracking-tight text-white">
                <span className="font-medium italic instrument">AI Infrastructure</span>
                <span className="font-light"> Orchestration Platform</span>
              </h2>
            </div>
          </div>
        </div>


        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* System Status */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <div className={`w-2 h-2 rounded-full ${
              systemStatus === 'online' ? 'bg-green-400 animate-pulse' : 'bg-red-400'
            }`}></div>
            <span className="text-sm text-gray-300 capitalize">{systemStatus}</span>
          </div>

          {/* Alerts */}
          <div className="relative">
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="relative p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-300" />
              {hasAlerts && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {criticalAlerts}
                </span>
              )}
            </button>

            {/* Alerts Dropdown */}
            {showAlerts && (
              <div className="absolute right-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-lg border border-gray-700/50 rounded-lg shadow-xl z-[9999]">
                <div className="p-4 border-b border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white">System Alerts</h3>
                  <p className="text-sm text-gray-400">{alerts.length} total alerts</p>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {alerts.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No alerts at this time</p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {alerts.map((alert, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg mb-2 border-l-4 ${
                            alert.type === 'warning' 
                              ? 'bg-red-500/10 border-red-500 text-red-300' 
                              : alert.type === 'info'
                              ? 'bg-blue-500/10 border-blue-500 text-blue-300'
                              : 'bg-yellow-500/10 border-yellow-500 text-yellow-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{alert.message}</p>
                              <p className="text-xs opacity-75 mt-1">
                                Workload #{alert.workload_id} • {new Date(alert.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {alerts.length > 0 && (
                  <div className="p-3 border-t border-gray-700/50">
                    <button className="w-full text-sm text-blue-400 hover:text-blue-300 transition-colors">
                      View all alerts
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-gray-400">System Administrator</p>
              </div>
              <button 
                onClick={handleUserMenuToggle}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <User className="w-5 h-5 text-gray-300" />
              </button>
            </div>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-900/98 backdrop-blur-lg border border-gray-700/50 rounded-lg shadow-xl z-[9999]">
                <div className="p-4 border-b border-gray-700/50">
                  <p className="text-sm font-medium text-white">Admin User</p>
                  <p className="text-xs text-gray-400">admin@ai-infra.com</p>
                </div>
                <div className="py-2">
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors">
                    Profile Settings
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors">
                    Account Preferences
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors">
                    Security Settings
                  </button>
                  <div className="border-t border-gray-700/50 my-2"></div>
                  <button className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </header>
  );
};

export default Header;
