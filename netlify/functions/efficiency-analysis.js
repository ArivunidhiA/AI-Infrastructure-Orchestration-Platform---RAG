// Netlify Function for efficiency analysis endpoint
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

  return {
    statusCode: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify(mockEfficiencyAnalysis)
  };
};
