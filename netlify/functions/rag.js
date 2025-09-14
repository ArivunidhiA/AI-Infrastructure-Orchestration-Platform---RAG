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
        id: Date.now(),
        answer: `Based on your query "${body.query || 'default query'}", here are the relevant insights and recommendations for your AI infrastructure. This response provides actionable guidance to help optimize your system performance and reduce costs.`,
        sources: [
          {
            title: "Infrastructure Optimization Guide",
            doc_type: "guide",
            relevance_score: 0.95
          },
          {
            title: "Cost Management Best Practices", 
            doc_type: "guide",
            relevance_score: 0.88
          },
          {
            title: "Performance Tuning Documentation",
            doc_type: "guide", 
            relevance_score: 0.82
          }
        ],
        confidence_score: 0.92,
        created_at: new Date().toISOString()
      })
    };
  }

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "RAG API is working",
        suggested_questions: [
          "How can I optimize my GPU usage?",
          "What are the best practices for cost management?",
          "How do I troubleshoot high memory usage?",
          "What is auto-scaling and how does it work?",
          "How can I improve my model performance?",
          "What are the recommended resource allocations?",
          "How do I monitor system health effectively?",
          "What are the common performance bottlenecks?"
        ],
        documents: [
          {
            id: 1,
            title: "Infrastructure Optimization Guide",
            content: "This guide covers best practices for optimizing your AI infrastructure...",
            doc_type: "guide",
            upload_date: "2024-01-15T10:30:00Z"
          },
          {
            id: 2,
            title: "Cost Management Best Practices",
            content: "Learn how to effectively manage costs in your AI infrastructure...",
            doc_type: "guide",
            upload_date: "2024-01-14T14:20:00Z"
          }
        ],
        availableMethods: ["POST for queries", "GET for status"],
        sampleQuery: {
          method: "POST",
          url: "/api/rag",
          body: { query: "your question here" }
        }
      })
    };
  }

  return {
    statusCode: 405,
    headers: corsHeaders,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
