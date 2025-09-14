// Netlify Function for optimization endpoint
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

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(mockRecommendations)
    };
  }

  if (event.httpMethod === 'POST') {
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "Optimization analysis completed",
        recommendations: mockRecommendations
      })
    };
  }

  return {
    statusCode: 405,
    headers: corsHeaders,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
