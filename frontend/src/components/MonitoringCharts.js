import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { monitoringAPI } from '../services/api';
import { apiUtils } from '../services/api';

const MonitoringCharts = ({ type = 'resource-usage' }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChartData();
  }, [type]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      let response;
      
      switch (type) {
        case 'resource-usage':
          response = await monitoringAPI.getResourceUsageSummary();
          setData(formatResourceUsageData(response.data));
          break;
        case 'cost-trends':
          response = await monitoringAPI.getPerformanceTrends(7);
          setData(response.data.trends || []);
          break;
        case 'performance':
          response = await monitoringAPI.getPerformanceTrends(7);
          setData(response.data.trends || []);
          break;
        default:
          setData([]);
      }
    } catch (err) {
      setError(apiUtils.handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const formatResourceUsageData = (data) => {
    if (!data.workloads) return [];
    
    return data.workloads.map(workload => ({
      name: workload.name.length > 15 ? workload.name.substring(0, 15) + '...' : workload.name,
      cpu: workload.cpu_usage,
      memory: workload.memory_usage,
      gpu: workload.gpu_usage || 0,
      fullName: workload.name
    }));
  };

  const COLORS = ['#0ea5e9', '#d946ef', '#22c55e', '#f59e0b', '#ef4444'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800/95 backdrop-blur-lg border border-gray-700/50 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
        <span className="ml-3 text-gray-400">Loading chart...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Error loading chart: {error.message}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  const renderChart = () => {
    switch (type) {
      case 'resource-usage':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#9ca3af"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="cpu" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                name="CPU Usage"
              />
              <Line 
                type="monotone" 
                dataKey="memory" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                name="Memory Usage"
              />
              <Line 
                type="monotone" 
                dataKey="gpu" 
                stroke="#06b6d4" 
                strokeWidth={3}
                dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                name="GPU Usage"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'cost-trends':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(value) => apiUtils.formatCurrency(value)}
              />
              <Tooltip 
                content={<CustomTooltip />}
                formatter={(value) => [apiUtils.formatCurrency(value), 'Cost']}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Area
                type="monotone"
                dataKey="total_cost"
                stroke="#0ea5e9"
                fillOpacity={1}
                fill="url(#colorCost)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'performance':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="avg_cpu_usage" 
                stroke="#0ea5e9" 
                strokeWidth={2}
                dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
                name="CPU Usage"
              />
              <Line 
                type="monotone" 
                dataKey="avg_memory_usage" 
                stroke="#d946ef" 
                strokeWidth={2}
                dot={{ fill: '#d946ef', strokeWidth: 2, r: 4 }}
                name="Memory Usage"
              />
              <Line 
                type="monotone" 
                dataKey="avg_gpu_usage" 
                stroke="#22c55e" 
                strokeWidth={2}
                dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                name="GPU Usage"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'workload-distribution':
        const pieData = data.map((item, index) => ({
          name: item.name,
          value: item.cpu,
          color: COLORS[index % COLORS.length]
        }));

        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-400">Chart type not supported</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {renderChart()}
    </div>
  );
};

export default MonitoringCharts;
