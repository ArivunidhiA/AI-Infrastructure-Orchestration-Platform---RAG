// Netlify Function for RAG endpoint
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

  if (event.httpMethod === 'POST') {
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

  return {
    statusCode: 405,
    headers: corsHeaders,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
