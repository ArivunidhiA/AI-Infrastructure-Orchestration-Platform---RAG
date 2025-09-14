// Netlify Function for performance endpoint
exports.handler = async (event, context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  const mockPerformanceData = [
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
  ];

  return {
    statusCode: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify(mockPerformanceData)
  };
};
