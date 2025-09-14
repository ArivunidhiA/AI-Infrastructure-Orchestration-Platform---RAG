// Netlify Function for workloads endpoint
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

  return {
    statusCode: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify(mockWorkloads)
  };
};
