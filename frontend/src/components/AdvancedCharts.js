import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadialBarChart,
  RadialBar
} from 'recharts';

const AdvancedCharts = ({ type, data, title, subtitle }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <motion.div 
          className="bg-gray-900/95 backdrop-blur-lg border border-gray-700/50 rounded-xl p-4 shadow-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-white font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-300">
                {entry.dataKey}: <span className="text-white font-medium">{entry.value}%</span>
              </span>
            </div>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  const COLORS = ['#ffffff', '#e5e5e5', '#d4d4d4', '#a3a3a3', '#737373', '#525252'];

  const renderChart = () => {
    switch (type) {
      case 'resource-usage':
        // Transform data to show time-based trends if needed, or use workload-based line chart
        const chartData = Array.isArray(data) && data.length > 0 && data[0].time
          ? data // If data already has time-based structure
          : // Otherwise, create time-based data from workload data
            Array.from({ length: 7 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (6 - i));
              const workloads = Array.isArray(data) ? data : [];
              return {
                time: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                cpu: workloads.length > 0 
                  ? Math.round(workloads.reduce((sum, w) => sum + (w.cpu || 0), 0) / workloads.length)
                  : Math.floor(Math.random() * 30) + 40,
                memory: workloads.length > 0
                  ? Math.round(workloads.reduce((sum, w) => sum + (w.memory || 0), 0) / workloads.length)
                  : Math.floor(Math.random() * 25) + 45,
                gpu: workloads.length > 0 && workloads.some(w => w.gpu > 0)
                  ? Math.round(workloads.filter(w => w.gpu > 0).reduce((sum, w) => sum + (w.gpu || 0), 0) / workloads.filter(w => w.gpu > 0).length)
                  : 0
              };
            });
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="cpuLineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="memoryLineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e5e5e5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#e5e5e5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gpuLineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4d4d4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#d4d4d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="time" 
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(value) => value}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                content={<CustomTooltip />}
                formatter={(value) => [`${value}%`, '']}
              />
              <Legend 
                wrapperStyle={{ color: '#9ca3af', fontSize: '12px' }}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="cpu" 
                stroke="#ffffff" 
                strokeWidth={3}
                dot={{ fill: '#ffffff', r: 4 }}
                activeDot={{ r: 6 }}
                name="CPU Usage"
              />
              <Line 
                type="monotone" 
                dataKey="memory" 
                stroke="#e5e5e5" 
                strokeWidth={3}
                dot={{ fill: '#e5e5e5', r: 4 }}
                activeDot={{ r: 6 }}
                name="Memory Usage"
              />
              {chartData.some(d => d.gpu > 0) && (
                <Line 
                  type="monotone" 
                  dataKey="gpu" 
                  stroke="#d4d4d4" 
                  strokeWidth={3}
                  dot={{ fill: '#d4d4d4', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="GPU Usage"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'resource-usage-trends':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 30, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                stroke="#9ca3af"
                fontSize={11}
                angle={0}
                textAnchor="middle"
                height={120}
                interval={0}
                tick={{ 
                  fontSize: 10,
                  fill: '#9ca3af'
                }}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="cpu" stroke="#ffffff" name="CPU Usage" activeDot={{ r: 8 }} strokeWidth={2} />
              <Line type="monotone" dataKey="memory" stroke="#e5e5e5" name="Memory Usage" activeDot={{ r: 8 }} strokeWidth={2} />
              <Line type="monotone" dataKey="gpu" stroke="#d4d4d4" name="GPU Usage" activeDot={{ r: 8 }} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'cost-trends':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip 
                content={<CustomTooltip />}
                formatter={(value) => [`$${value.toLocaleString()}`, 'Cost']}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Area
                type="monotone"
                dataKey="total_cost"
                stroke="#ffffff"
                strokeWidth={3}
                fill="url(#costGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'performance-distribution':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'efficiency-radial':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={data}>
              <RadialBar
                dataKey="value"
                cornerRadius={10}
                fill="#ffffff"
              />
              <Tooltip content={<CustomTooltip />} />
            </RadialBarChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-400">No chart data available</p>
          </div>
        );
    }
  };

  return (
    <motion.div 
      className="chart-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-light text-white">{title}</h3>
          {subtitle && (
            <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
          )}
        </div>
        <motion.div 
          className="flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" />
          <span className="text-sm text-white/70 font-medium">Live</span>
        </motion.div>
      </div>

      <motion.div 
        className="h-96"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {renderChart()}
      </motion.div>
    </motion.div>
  );
};

export default AdvancedCharts;
