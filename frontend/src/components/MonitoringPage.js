import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw,
  Gauge
} from 'lucide-react';
import { monitoringAPI } from '../services/api';
import { apiUtils } from '../services/api';
import AdvancedCharts from './AdvancedCharts';

const MonitoringPage = () => {
  const [performanceData, setPerformanceData] = useState([]);
  const [resourceData, setResourceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('performance');
  const [timeRange, setTimeRange] = useState(7);

  useEffect(() => {
    fetchMonitoringData();
  }, [timeRange]);

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      const [performanceResponse, resourceResponse] = await Promise.all([
        monitoringAPI.getPerformanceTrends(timeRange),
        monitoringAPI.getResourceUsageSummary()
      ]);
      
      setPerformanceData(performanceResponse.data.trends || []);
      setResourceData(formatResourceData(resourceResponse.data));
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatResourceData = (data) => {
    if (!data.workloads) return [];
    
    return data.workloads.map(workload => ({
      name: workload.name.length > 15 ? workload.name.substring(0, 15) + '...' : workload.name,
      cpu: workload.cpu_usage,
      memory: workload.memory_usage,
      gpu: workload.gpu_usage || 0,
      fullName: workload.name
    }));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 backdrop-blur-lg border border-gray-700/50 rounded-lg p-4 shadow-xl">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm flex items-center" style={{ color: entry.color }}>
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
              {entry.dataKey}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const chartTypes = [
    { id: 'performance', label: 'Performance Trends', icon: TrendingUp },
    { id: 'resource', label: 'Resource Usage', icon: BarChart3 },
    { id: 'distribution', label: 'Workload Distribution', icon: PieChartIcon },
    { id: 'efficiency', label: 'Efficiency Metrics', icon: Gauge }
  ];

  const timeRanges = [
    { value: 1, label: '1 Day' },
    { value: 7, label: '7 Days' },
    { value: 30, label: '30 Days' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
        <span className="ml-3 text-gray-400">Loading monitoring data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between relative">
        <div>
          <h1 className="text-4xl font-bold gradient-text-glow">Monitoring</h1>
          <p className="text-gray-400 mt-2 text-lg">Real-time performance and resource analytics</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchMonitoringData}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse neon-glow"></div>
          <span className="text-sm text-gray-300 font-medium">Live</span>
        </div>
        
        {/* Floating elements */}
        <div className="floating-element absolute top-0 right-0 w-20 h-20 bg-purple-500/20 rounded-full blur-xl"></div>
        <div className="floating-element absolute top-10 left-10 w-16 h-16 bg-blue-500/20 rounded-full blur-lg"></div>
      </div>

      {/* Chart Type Selector */}
      <div className="flex space-x-1 bg-gray-900/50 p-1 rounded-xl">
        {chartTypes.map((chart) => {
          const Icon = chart.icon;
          return (
            <button
              key={chart.id}
              onClick={() => setActiveChart(chart.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-300 ${
                activeChart === chart.id
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{chart.label}</span>
            </button>
          );
        })}
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center space-x-4">
        <span className="text-gray-400 font-medium">Time Range:</span>
        <div className="flex space-x-2">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                timeRange === range.value
                  ? 'bg-white text-black'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart */}
      <div className="chart-container">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold gradient-text">
            {chartTypes.find(c => c.id === activeChart)?.label}
          </h3>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-400 neon-glow" />
            <span className="text-sm text-gray-300 font-medium">Interactive</span>
          </div>
        </div>

        <motion.div 
          className="h-[500px]"
          key={activeChart}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {activeChart === 'performance' && (
            <AdvancedCharts 
              type="cost-trends"
              data={performanceData.length > 0 ? performanceData : [
                { date: '2024-01-01', total_cost: 1200, cpu_usage: 75, memory_usage: 68, gpu_usage: 45 },
                { date: '2024-01-02', total_cost: 1350, cpu_usage: 82, memory_usage: 71, gpu_usage: 52 },
                { date: '2024-01-03', total_cost: 1100, cpu_usage: 68, memory_usage: 65, gpu_usage: 38 },
                { date: '2024-01-04', total_cost: 1400, cpu_usage: 85, memory_usage: 74, gpu_usage: 58 },
                { date: '2024-01-05', total_cost: 1250, cpu_usage: 78, memory_usage: 69, gpu_usage: 48 },
                { date: '2024-01-06', total_cost: 1300, cpu_usage: 80, memory_usage: 72, gpu_usage: 50 },
                { date: '2024-01-07', total_cost: 1450, cpu_usage: 88, memory_usage: 76, gpu_usage: 62 },
                { date: '2024-01-08', total_cost: 1150, cpu_usage: 72, memory_usage: 66, gpu_usage: 42 },
                { date: '2024-01-09', total_cost: 1380, cpu_usage: 84, memory_usage: 73, gpu_usage: 55 },
                { date: '2024-01-10', total_cost: 1320, cpu_usage: 79, memory_usage: 70, gpu_usage: 49 }
              ]}
              title="Performance Trends"
              subtitle="System performance over time"
            />
          )}

          {activeChart === 'resource' && (
            <AdvancedCharts 
              type="resource-usage"
              data={resourceData.length > 0 ? resourceData : [
                { name: 'Image Classification', cpu: 65, memory: 72, gpu: 45 },
                { name: 'NLP Model Inference', cpu: 58, memory: 68, gpu: 52 },
                { name: 'Recommendation System', cpu: 72, memory: 75, gpu: 38 },
                { name: 'Computer Vision', cpu: 68, memory: 70, gpu: 62 },
                { name: 'Test Workload', cpu: 55, memory: 60, gpu: 30 }
              ]}
              title="Resource Usage"
              subtitle="Current workload resource consumption"
            />
          )}

          {activeChart === 'distribution' && (
            <AdvancedCharts 
              type="performance-distribution"
              data={[
                { name: 'CPU Intensive', value: 35 },
                { name: 'Memory Intensive', value: 25 },
                { name: 'GPU Intensive', value: 20 },
                { name: 'Mixed Workload', value: 20 }
              ]}
              title="Workload Distribution"
              subtitle="Workload type distribution"
            />
          )}

          {activeChart === 'efficiency' && (
            <AdvancedCharts 
              type="efficiency-radial"
              data={[
                { name: 'CPU Efficiency', value: 85 },
                { name: 'Memory Efficiency', value: 78 },
                { name: 'GPU Efficiency', value: 92 },
                { name: 'Overall Efficiency', value: 88 }
              ]}
              title="Efficiency Metrics"
              subtitle="System efficiency indicators"
            />
          )}
        </motion.div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-2">Peak CPU Usage</p>
              <p className="text-2xl font-bold text-white">
                {Math.max(...performanceData.map(d => d.avg_cpu_usage || 0))}%
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-2">Peak Memory Usage</p>
              <p className="text-2xl font-bold text-white">
                {Math.max(...performanceData.map(d => d.avg_memory_usage || 0))}%
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-2">Total Data Points</p>
              <p className="text-2xl font-bold text-white">
                {performanceData.length}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringPage;
