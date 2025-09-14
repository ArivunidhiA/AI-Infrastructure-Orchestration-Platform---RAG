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

  const mockMetrics = [
    { name: 'Image Classification', cpu: 65, memory: 72, gpu: 45 },
    { name: 'NLP Model Inference', cpu: 58, memory: 68, gpu: 52 },
    { name: 'Recommendation System', cpu: 72, memory: 75, gpu: 38 },
    { name: 'Computer Vision', cpu: 68, memory: 70, gpu: 62 },
    { name: 'Test Workload', cpu: 55, memory: 60, gpu: 30 }
  ];

  return {
    statusCode: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify(mockMetrics)
  };
};
