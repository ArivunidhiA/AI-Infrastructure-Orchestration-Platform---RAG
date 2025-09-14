// Mock vector database with knowledge base
const knowledgeBase = [
  {
    id: 1,
    title: "GPU Optimization Guide",
    content: "To optimize GPU usage, consider using mixed precision training, implementing gradient accumulation, and monitoring GPU memory utilization. Use tools like NVIDIA-SMI to track GPU performance. For inference workloads, consider model quantization and batch processing to maximize throughput.",
    doc_type: "guide",
    upload_date: "2024-01-15T10:30:00Z",
    tags: ["gpu", "optimization", "performance", "inference", "training"]
  },
  {
    id: 2,
    title: "Cost Management Best Practices",
    content: "Implement auto-scaling policies based on workload demand. Use spot instances for non-critical workloads to reduce costs by up to 90%. Monitor resource utilization and right-size instances regularly. Implement cost alerts and budgets to track spending. Consider reserved instances for predictable workloads.",
    doc_type: "guide",
    upload_date: "2024-01-14T14:20:00Z",
    tags: ["cost", "optimization", "auto-scaling", "spot-instances", "budget"]
  },
  {
    id: 3,
    title: "Memory Troubleshooting Guide",
    content: "For high memory usage issues, check for memory leaks in your applications. Use profiling tools to identify memory bottlenecks. Consider implementing memory pooling and garbage collection optimization. Monitor memory usage patterns and implement alerts for high memory consumption. Use memory-efficient data structures and algorithms.",
    doc_type: "guide",
    upload_date: "2024-01-13T09:15:00Z",
    tags: ["memory", "troubleshooting", "performance", "debugging", "optimization"]
  },
  {
    id: 4,
    title: "Auto-scaling Implementation",
    content: "Auto-scaling helps maintain optimal performance while minimizing costs. Set up horizontal pod autoscaling (HPA) for Kubernetes workloads. Configure vertical pod autoscaling (VPA) for resource optimization. Use custom metrics for scaling decisions. Implement proper scaling policies to avoid thrashing.",
    doc_type: "guide",
    upload_date: "2024-01-12T16:45:00Z",
    tags: ["auto-scaling", "kubernetes", "hpa", "vpa", "performance"]
  },
  {
    id: 5,
    title: "Model Performance Optimization",
    content: "To improve model performance, consider model pruning, quantization, and distillation techniques. Use efficient architectures like MobileNet or EfficientNet for edge deployment. Implement model caching and batch processing. Monitor inference latency and throughput metrics. Use profiling tools to identify bottlenecks.",
    doc_type: "guide",
    upload_date: "2024-01-11T11:30:00Z",
    tags: ["model", "performance", "optimization", "inference", "quantization"]
  },
  {
    id: 6,
    title: "Resource Allocation Guidelines",
    content: "Proper resource allocation is crucial for optimal performance. Allocate CPU cores based on workload requirements. Use memory mapping for large datasets. Implement resource quotas and limits. Monitor resource utilization and adjust allocations based on actual usage patterns. Use resource monitoring tools for insights.",
    doc_type: "guide",
    upload_date: "2024-01-10T08:20:00Z",
    tags: ["resources", "allocation", "cpu", "memory", "monitoring"]
  },
  {
    id: 7,
    title: "System Health Monitoring",
    content: "Implement comprehensive monitoring for system health. Use tools like Prometheus and Grafana for metrics collection and visualization. Set up alerts for critical metrics like CPU, memory, and disk usage. Monitor application-specific metrics and logs. Implement health checks and circuit breakers for resilience.",
    doc_type: "guide",
    upload_date: "2024-01-09T14:15:00Z",
    tags: ["monitoring", "health", "prometheus", "grafana", "alerts"]
  },
  {
    id: 8,
    title: "Performance Bottlenecks Guide",
    content: "Common performance bottlenecks include I/O operations, database queries, and network latency. Use profiling tools to identify bottlenecks. Implement caching strategies for frequently accessed data. Optimize database queries and use connection pooling. Consider using CDNs for static content delivery.",
    doc_type: "guide",
    upload_date: "2024-01-08T12:00:00Z",
    tags: ["bottlenecks", "performance", "io", "database", "caching"]
  }
];

// Simple vector similarity search (mock implementation)
function vectorSimilaritySearch(query, knowledgeBase, topK = 3) {
  const queryWords = query.toLowerCase().split(/\s+/);
  
  // Calculate relevance score for each document
  const scoredDocs = knowledgeBase.map(doc => {
    const contentWords = (doc.content + ' ' + doc.title).toLowerCase().split(/\s+/);
    const tagWords = doc.tags.join(' ').toLowerCase().split(/\s+/);
    const allWords = [...contentWords, ...tagWords];
    
    // Calculate word overlap score
    let score = 0;
    queryWords.forEach(queryWord => {
      allWords.forEach(docWord => {
        if (docWord.includes(queryWord) || queryWord.includes(docWord)) {
          score += 1;
        }
      });
    });
    
    // Normalize score
    const normalizedScore = score / (queryWords.length * allWords.length);
    
    return {
      ...doc,
      relevance_score: normalizedScore
    };
  });
  
  // Sort by relevance and return top K
  return scoredDocs
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(0, topK)
    .filter(doc => doc.relevance_score > 0);
}

// Generate contextual response based on retrieved documents
function generateResponse(query, relevantDocs) {
  if (relevantDocs.length === 0) {
    return {
      answer: "I don't have specific information about that topic in my knowledge base. Please try rephrasing your question or ask about GPU optimization, cost management, memory troubleshooting, auto-scaling, model performance, resource allocation, system monitoring, or performance bottlenecks.",
      confidence_score: 0.1
    };
  }
  
  // Extract key information from relevant documents
  const keyPoints = relevantDocs.map(doc => {
    const sentences = doc.content.split('. ');
    return sentences[0]; // Take first sentence as key point
  });
  
  // Generate contextual response
  let answer = `Based on your question about "${query}", here's what I found:\n\n`;
  
  keyPoints.forEach((point, index) => {
    answer += `${index + 1}. ${point}.\n\n`;
  });
  
  answer += `These recommendations are based on best practices and should help you address your specific needs.`;
  
  // Calculate confidence based on relevance scores
  const avgRelevance = relevantDocs.reduce((sum, doc) => sum + doc.relevance_score, 0) / relevantDocs.length;
  const confidence_score = Math.min(0.95, Math.max(0.3, avgRelevance * 2));
  
  return {
    answer,
    confidence_score
  };
}

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
    const query = body.query || '';
    
    // Perform vector similarity search
    const relevantDocs = vectorSimilaritySearch(query, knowledgeBase, 3);
    
    // Generate contextual response
    const response = generateResponse(query, relevantDocs);
    
    // Format sources
    const sources = relevantDocs.map(doc => ({
      title: doc.title,
      doc_type: doc.doc_type,
      relevance_score: doc.relevance_score,
      upload_date: doc.upload_date
    }));
    
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: Date.now(),
        answer: response.answer,
        sources: sources,
        confidence_score: response.confidence_score,
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
        documents: knowledgeBase.map(doc => ({
          id: doc.id,
          title: doc.title,
          content: doc.content.substring(0, 100) + "...", // Truncate for list view
          doc_type: doc.doc_type,
          upload_date: doc.upload_date,
          tags: doc.tags
        })),
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
