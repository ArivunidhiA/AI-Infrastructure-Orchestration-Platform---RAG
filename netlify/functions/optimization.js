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
      workload_id: 1,
      status: "pending",
      recommendation: "Consider using spot instances for non-critical workloads to reduce costs by 40%",
      potential_savings: 450.00,
      created_at: "2024-01-15T10:30:00Z"
    },
    {
      id: 2,
      workload_id: 2,
      status: "pending", 
      recommendation: "Increase memory allocation for NLP model to improve performance",
      potential_savings: 0.00,
      created_at: "2024-01-14T14:20:00Z"
    },
    {
      id: 3,
      workload_id: 3,
      status: "pending",
      recommendation: "Set up auto-scaling for recommendation system based on demand",
      potential_savings: 200.00,
      created_at: "2024-01-13T09:15:00Z"
    }
  ];

  const mockCostAnalysis = {
    total_monthly_cost: 3240.00,
    total_potential_savings: 650.00,
    savings_percentage: 20.1,
    optimization_opportunities: [
      {
        workload_name: "Image Classification Model",
        current_cost: 1800.00,
        optimized_cost: 1080.00,
        potential_savings: 720.00,
        recommendation: "Switch to spot instances during off-peak hours"
      },
      {
        workload_name: "NLP Model Inference", 
        current_cost: 900.00,
        optimized_cost: 720.00,
        potential_savings: 180.00,
        recommendation: "Optimize memory allocation and use reserved instances"
      }
    ]
  };

  const mockEfficiencyAnalysis = {
    workloads: [
      {
        workload_id: 1,
        workload_name: "Image Classification Model",
        workload_type: "inference",
        efficiency_score: 0.75,
        current_cost: 2.50,
        potential_savings: 0.50,
        recommendations_count: 2
      },
      {
        workload_id: 2,
        workload_name: "NLP Model Inference",
        workload_type: "inference", 
        efficiency_score: 0.85,
        current_cost: 1.80,
        potential_savings: 0.20,
        recommendations_count: 1
      }
    ]
  };

  const mockSavingsSummary = {
    applied_optimizations: 3,
    total_savings: 450.00,
    monthly_savings: 150.00
  };

  if (event.httpMethod === 'GET') {
    // Return recommendations by default
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(mockRecommendations)
    };
  }

  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body || '{}');
    
    // Handle different POST requests based on body content
    if (body.action === 'generate') {
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: "Optimization analysis completed",
          recommendations: mockRecommendations
        })
      };
    }
    
    // Default POST response
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
