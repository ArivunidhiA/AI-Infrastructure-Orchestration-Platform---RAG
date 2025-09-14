import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Server, 
  DollarSign, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { monitoringAPI, workloadAPI } from '../services/api';
import { apiUtils } from '../services/api';
import AdvancedCharts from './AdvancedCharts';

const Dashboard = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [workloads, setWorkloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, workloadsResponse] = await Promise.all([
        monitoringAPI.getDashboardStats(),
        workloadAPI.getWorkloads(0, 10)
      ]);
      
      // Handle different response structures - APIs return data directly
      console.log('Dashboard API responses:', { statsResponse, workloadsResponse });
      setDashboardStats(statsResponse.data || statsResponse);
      setWorkloads(Array.isArray(workloadsResponse.data) ? workloadsResponse.data : Array.isArray(workloadsResponse) ? workloadsResponse : []);
    } catch (err) {
      setError(apiUtils.handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-400" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
        return 'status-running';
      case 'pending':
        return 'status-pending';
      case 'completed':
        return 'status-completed';
      case 'failed':
        return 'status-failed';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
        <span className="ml-3 text-gray-400">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Error Loading Dashboard</h3>
        <p className="text-gray-400">{error.message}</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <motion.div 
        className="flex items-center justify-between relative"
        variants={itemVariants}
      >
        <div>
          <motion.h1 
            className="text-5xl font-bold gradient-text-glow mb-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Dashboard
          </motion.h1>
          <motion.p 
            className="text-gray-400 text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            AI Infrastructure Overview
          </motion.p>
        </div>
        <motion.div 
          className="flex items-center space-x-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center space-x-2">
            <motion.div 
              className="w-3 h-3 bg-green-400 rounded-full"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <span className="text-sm text-gray-300 font-medium">Live</span>
          </div>
        </motion.div>
        
        {/* Floating elements */}
        <motion.div 
          className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-10 left-10 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"
          animate={{
            y: [0, 15, 0],
            x: [0, -10, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div 
          className="absolute bottom-0 right-20 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl"
          animate={{
            y: [0, -10, 0],
            x: [0, 5, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        {/* Total Workloads */}
        <motion.div 
          className="metric-card card-hover"
          variants={itemVariants}
          whileHover={{ 
            scale: 1.02,
            y: -5,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-2">Total Workloads</p>
              <motion.p 
                className="text-3xl font-bold text-white mb-1"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {dashboardStats?.total_workloads || 0}
              </motion.p>
            </div>
            <motion.div 
              className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30"
              whileHover={{ rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Server className="w-6 h-6 text-blue-400" />
            </motion.div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <motion.div 
              className="w-2 h-2 bg-green-400 rounded-full mr-2"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <span className="text-green-400 font-medium">
              {dashboardStats?.running_workloads || 0} running
            </span>
          </div>
        </motion.div>

        {/* Monthly Cost */}
        <div className="metric-card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-2">Monthly Cost</p>
              <p className="text-3xl font-bold text-white mb-1">
                {apiUtils.formatCurrency(dashboardStats?.total_monthly_cost || 0)}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <span className="text-green-400 font-medium">
              {apiUtils.formatCurrency(dashboardStats?.cost_savings || 0)} saved
            </span>
          </div>
        </div>

        {/* CPU Usage */}
        <div className="metric-card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-2">Avg CPU Usage</p>
              <p className="text-3xl font-bold text-white mb-1">
                {apiUtils.formatPercentage(dashboardStats?.avg_cpu_usage || 0)}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
              <Activity className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-400">across all workloads</span>
          </div>
        </div>

        {/* Memory Usage */}
        <motion.div 
          className="metric-card card-hover"
          variants={itemVariants}
          whileHover={{ 
            scale: 1.02,
            y: -5,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-2">Avg Memory Usage</p>
              <motion.p 
                className="text-3xl font-bold text-white mb-1"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {apiUtils.formatPercentage(dashboardStats?.avg_memory_usage || 0)}
              </motion.p>
            </div>
            <motion.div 
              className="p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30"
              whileHover={{ rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <TrendingUp className="w-6 h-6 text-cyan-400" />
            </motion.div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-400">across all workloads</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Charts Section */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={containerVariants}
      >
        {/* Resource Usage Chart */}
        <motion.div variants={itemVariants}>
          <AdvancedCharts 
            type="resource-usage"
            data={Array.isArray(workloads) ? workloads.slice(0, 5).map((workload, index) => ({
              name: workload.name && workload.name.length > 15 ? workload.name.substring(0, 15) + '...' : workload.name || `Workload ${index + 1}`,
              cpu: Math.floor(Math.random() * 40) + 30, // 30-70% CPU usage
              memory: Math.floor(Math.random() * 30) + 40, // 40-70% Memory usage
              gpu: workload.gpu_count > 0 ? Math.floor(Math.random() * 50) + 20 : 0 // 20-70% GPU usage if GPU available
            })) : []}
            title="Resource Usage"
            subtitle="Current workload resource consumption"
          />
        </motion.div>

        {/* Cost Trends Chart */}
        <motion.div variants={itemVariants}>
          <AdvancedCharts 
            type="cost-trends"
            data={[
              { date: '2024-01-01', total_cost: 1200 },
              { date: '2024-01-02', total_cost: 1350 },
              { date: '2024-01-03', total_cost: 1100 },
              { date: '2024-01-04', total_cost: 1400 },
              { date: '2024-01-05', total_cost: 1250 },
              { date: '2024-01-06', total_cost: 1300 },
              { date: '2024-01-07', total_cost: 1450 }
            ]}
            title="Cost Trends"
            subtitle="7-day cost analysis"
          />
        </motion.div>
      </motion.div>

      {/* Recent Workloads */}
      <div className="glass-dark p-6 rounded-xl border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Recent Workloads</h3>
          <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
            View all
          </button>
        </div>
        
        <div className="space-y-4">
          {!Array.isArray(workloads) || workloads.length === 0 ? (
            <div className="text-center py-8">
              <Server className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No workloads found</p>
              <p className="text-sm text-gray-500 mt-1">Create your first workload to get started</p>
            </div>
          ) : (
            workloads.map((workload) => (
              <div
                key={workload.id}
                className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-700/50 rounded-lg">
                    <Server className="w-5 h-5 text-gray-300" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{workload.name}</h4>
                    <p className="text-sm text-gray-400">
                      {workload.type} • {workload.cpu_cores} CPU • {workload.memory_gb}GB RAM
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(workload.status)}`}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(workload.status)}
                      <span className="capitalize">{workload.status}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      {apiUtils.formatCurrency(workload.cost_per_hour)}/hr
                    </p>
                    <p className="text-xs text-gray-400">
                      {apiUtils.formatRelativeTime(workload.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Activity */}
      {dashboardStats?.recent_activity && dashboardStats.recent_activity.length > 0 && (
        <div className="glass-dark p-6 rounded-xl border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
          <div className="space-y-3">
            {dashboardStats.recent_activity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-white">{activity.action}</p>
                  <p className="text-xs text-gray-400">
                    {apiUtils.formatRelativeTime(activity.timestamp)}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${getStatusColor(activity.status)}`}>
                  {activity.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Dashboard;
