// Netlify Function for metrics endpoint
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

  // Return dashboard stats for the main metrics endpoint
  const dashboardStats = {
    total_workloads: 3,
    running_workloads: 3,
    total_monthly_cost: 3240.00,
    cost_savings: 450.00,
    avg_cpu_usage: 65.0,
    avg_memory_usage: 71.7,
    recent_activity: [
      {
        action: "Started Image Classification Model",
        status: "running",
        timestamp: "2024-01-15T10:30:00Z"
      },
      {
        action: "Optimized NLP Model resources",
        status: "completed",
        timestamp: "2024-01-14T14:20:00Z"
      },
      {
        action: "Updated Recommendation System",
        status: "running",
        timestamp: "2024-01-13T09:15:00Z"
      }
    ]
  };

  return {
    statusCode: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify(dashboardStats)
  };
};
