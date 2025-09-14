// Netlify Functions for AI Infrastructure Platform
const { Handler } = require('@netlify/functions');

// Mock data for demonstration
const mockWorkloads = [
  {
    id: 1,
    name: "Image Classification Model",
    status: "running",
    cpu_usage: 65,
    memory_usage: 72,
    gpu_usage: 45,
    gpu_count: 2,
    cost_per_hour: 2.50,
    created_at: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    name: "NLP Model Inference",
    status: "running",
    cpu_usage: 58,
    memory_usage: 68,
    gpu_usage: 52,
    gpu_count: 1,
    cost_per_hour: 1.80,
    created_at: "2024-01-14T14:20:00Z"
  },
  {
    id: 3,
    name: "Recommendation System",
    status: "running",
    cpu_usage: 72,
    memory_usage: 75,
    gpu_usage: 38,
    gpu_count: 0,
    cost_per_hour: 1.20,
    created_at: "2024-01-13T09:15:00Z"
  }
];

const mockMetrics = [
  { name: 'Image Classification', cpu: 65, memory: 72, gpu: 45 },
  { name: 'NLP Model Inference', cpu: 58, memory: 68, gpu: 52 },
  { name: 'Recommendation System', cpu: 72, memory: 75, gpu: 38 },
  { name: 'Computer Vision', cpu: 68, memory: 70, gpu: 62 },
  { name: 'Test Workload', cpu: 55, memory: 60, gpu: 30 }
];

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

const mockRecommendations = [
  {
    id: 1,
    type: "cost_optimization",
    title: "Optimize GPU Usage",
    description: "Consider using spot instances for non-critical workloads to reduce costs by 40%",
    impact: "high",
    estimated_savings: 450
  },
  {
    id: 2,
    type: "performance",
    title: "Scale Memory Resources",
    description: "Increase memory allocation for NLP model to improve performance",
    impact: "medium",
    estimated_savings: 0
  },
  {
    id: 3,
    type: "efficiency",
    title: "Implement Auto-scaling",
    description: "Set up auto-scaling for recommendation system based on demand",
    impact: "high",
    estimated_savings: 200
  }
];

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  const { path, httpMethod } = event;
  const pathSegments = path.split('/').filter(Boolean);

  try {
    // Route handling
    if (pathSegments[0] === 'api') {
      const endpoint = pathSegments[1];

      switch (endpoint) {
        case 'workloads':
          if (httpMethod === 'GET') {
            return {
              statusCode: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              body: JSON.stringify(mockWorkloads)
            };
          }
          break;

        case 'metrics':
          if (httpMethod === 'GET') {
            return {
              statusCode: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              body: JSON.stringify(mockMetrics)
            };
          }
          break;

        case 'performance':
          if (httpMethod === 'GET') {
            return {
              statusCode: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              body: JSON.stringify(mockPerformanceData)
            };
          }
          break;

        case 'recommendations':
          if (httpMethod === 'GET') {
            return {
              statusCode: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              body: JSON.stringify(mockRecommendations)
            };
          }
          break;

        case 'optimization':
          if (httpMethod === 'POST') {
            return {
              statusCode: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: "Optimization analysis completed",
                recommendations: mockRecommendations
              })
            };
          }
          break;

        case 'rag':
          if (httpMethod === 'POST') {
            const body = JSON.parse(event.body || '{}');
            return {
              statusCode: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                response: `RAG Response: Based on your query "${body.query || 'default query'}", here are the relevant insights and recommendations for your AI infrastructure.`,
                sources: [
                  "Infrastructure Optimization Guide",
                  "Cost Management Best Practices",
                  "Performance Tuning Documentation"
                ]
              })
            };
          }
          break;

        default:
          return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Endpoint not found' })
          };
      }
    }

    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Route not found' })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
