// Netlify Function for cost analysis endpoint
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

  return {
    statusCode: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify(mockCostAnalysis)
  };
};
