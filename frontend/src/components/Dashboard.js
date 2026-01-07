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
import { GlowCard } from './ui/spotlight-card';

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
        return <CheckCircle className="w-4 h-4 text-white" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-white" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-white" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-white" />;
      default:
        return <Clock className="w-4 h-4 text-white/70" />;
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
      className="space-y-6"
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
            className="text-5xl md:text-6xl md:leading-16 tracking-tight font-light text-white mb-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="font-medium italic instrument">Dashboard</span>
          </motion.h1>
          <motion.p 
            className="text-xs font-light text-white/70 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            AI Infrastructure Overview
          </motion.p>
        </div>
        <motion.div 
          className="flex items-center space-x-4 ml-auto"
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
              className="p-4 bg-white/10 rounded-xl border border-white/20"
              whileHover={{ rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Server className="w-6 h-6 text-white" />
            </motion.div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <motion.div 
              className="w-2 h-2 bg-white/60 rounded-full mr-2"
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
            <span className="text-white/80 font-medium">
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
            <div className="p-4 bg-white/10 rounded-xl border border-white/20">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <div className="w-2 h-2 bg-white/60 rounded-full mr-2"></div>
            <span className="text-white/80 font-medium">
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
            <div className="p-4 bg-white/10 rounded-xl border border-white/20">
              <Activity className="w-6 h-6 text-white" />
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
              className="p-4 bg-white/10 rounded-xl border border-white/20"
              whileHover={{ rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <TrendingUp className="w-6 h-6 text-white" />
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
        <motion.div 
          variants={itemVariants}
          whileHover={{ 
            y: -8,
            transition: { duration: 0.3, ease: "easeOut" }
          }}
        >
          <GlowCard glowColor="white" customSize className="w-full h-auto p-6 hover:bg-white/10 transition-all duration-300">
            <AdvancedCharts 
              type="resource-usage-trends"
              data={[
                { name: 'Jan 1', cpu: 45, memory: 52, gpu: 28 },
                { name: 'Jan 2', cpu: 58, memory: 48, gpu: 32 },
                { name: 'Jan 3', cpu: 52, memory: 55, gpu: 25 },
                { name: 'Jan 4', cpu: 65, memory: 60, gpu: 35 },
                { name: 'Jan 5', cpu: 48, memory: 50, gpu: 22 },
                { name: 'Jan 6', cpu: 62, memory: 58, gpu: 30 },
                { name: 'Jan 7', cpu: 55, memory: 53, gpu: 27 }
              ]}
              title="Resource Usage Trends"
              subtitle="7-day average resource consumption"
            />
          </GlowCard>
        </motion.div>

        {/* Cost Trends Chart */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ 
            y: -8,
            transition: { duration: 0.3, ease: "easeOut" }
          }}
        >
          <GlowCard glowColor="white" customSize className="w-full h-auto p-6 hover:bg-white/10 transition-all duration-300">
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
          </GlowCard>
        </motion.div>
      </motion.div>

      {/* Recent Workloads */}
      <GlowCard glowColor="white" customSize className="w-full h-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Recent Workloads</h3>
          <button className="text-white/70 hover:text-white text-sm font-medium transition-colors">
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
      </GlowCard>

      {/* Recent Activity */}
      {dashboardStats?.recent_activity && dashboardStats.recent_activity.length > 0 && (
        <GlowCard glowColor="white" customSize className="w-full h-auto p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
          <div className="space-y-3">
            {dashboardStats.recent_activity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg">
                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
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
        </GlowCard>
      )}
    </motion.div>
  );
};

export default Dashboard;
