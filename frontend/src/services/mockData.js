/**
 * Mock data for fallback when backend is unavailable
 * Matches the structure of real API responses
 */

// Mock workloads
export const mockWorkloads = [
  {
    id: '1',
    name: "Image Classification Model",
    type: "inference",
    status: "running",
    cpu_cores: 8,
    gpu_count: 2,
    memory_gb: 32,
    cost_per_hour: 2.50,
    tenant_id: "default-tenant",
    created_at: "1705315800",
    updated_at: "1705315800"
  },
  {
    id: '2',
    name: "NLP Model Inference",
    type: "inference",
    status: "running",
    cpu_cores: 4,
    gpu_count: 1,
    memory_gb: 16,
    cost_per_hour: 1.80,
    tenant_id: "default-tenant",
    created_at: "1705315800",
    updated_at: "1705315800"
  },
  {
    id: '3',
    name: "Recommendation System",
    type: "training",
    status: "running",
    cpu_cores: 16,
    gpu_count: 0,
    memory_gb: 64,
    cost_per_hour: 1.20,
    tenant_id: "default-tenant",
    created_at: "1705315800",
    updated_at: "1705315800"
  }
];

// Mock dashboard stats
export const mockDashboardStats = {
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
      timestamp: "1705315800"
    },
    {
      action: "Optimized NLP Model resources",
      status: "completed",
      timestamp: "1705315800"
    },
    {
      action: "Updated Recommendation System",
      status: "running",
      timestamp: "1705315800"
    }
  ]
};

// Mock optimizations
export const mockOptimizations = [
  {
    id: '1',
    workload_id: '1',
    status: "pending",
    recommendation: "Consider using spot instances for non-critical workloads to reduce costs by 40%",
    potential_savings: 450.00,
    created_at: "1705315800"
  },
  {
    id: '2',
    workload_id: '2',
    status: "pending",
    recommendation: "Increase memory allocation for NLP model to improve performance",
    potential_savings: 0.00,
    created_at: "1705315800"
  },
  {
    id: '3',
    workload_id: '3',
    status: "pending",
    recommendation: "Set up auto-scaling for recommendation system based on demand",
    potential_savings: 200.00,
    created_at: "1705315800"
  }
];

// Mock cost analysis
export const mockCostAnalysis = {
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

// Mock efficiency analysis
export const mockEfficiencyAnalysis = {
  workloads: [
    {
      workload_id: '1',
      workload_name: "Image Classification Model",
      workload_type: "inference",
      efficiency_score: 0.75,
      current_cost: 2.50,
      potential_savings: 0.50,
      recommendations_count: 2
    },
    {
      workload_id: '2',
      workload_name: "NLP Model Inference",
      workload_type: "inference",
      efficiency_score: 0.85,
      current_cost: 1.80,
      potential_savings: 0.20,
      recommendations_count: 1
    }
  ]
};

// Mock savings summary
export const mockSavingsSummary = {
  applied_optimizations: 3,
  total_savings: 450.00,
  monthly_savings: 150.00
};

// Mock performance trends
export const mockPerformanceTrends = [
  { date: '2024-01-01', total_cost: 1200, cpu_usage: 75, memory_usage: 68, gpu_usage: 45 },
  { date: '2024-01-02', total_cost: 1350, cpu_usage: 82, memory_usage: 71, gpu_usage: 52 },
  { date: '2024-01-03', total_cost: 1100, cpu_usage: 68, memory_usage: 65, gpu_usage: 38 },
  { date: '2024-01-04', total_cost: 1400, cpu_usage: 85, memory_usage: 74, gpu_usage: 58 },
  { date: '2024-01-05', total_cost: 1250, cpu_usage: 78, memory_usage: 69, gpu_usage: 48 },
  { date: '2024-01-06', total_cost: 1300, cpu_usage: 80, memory_usage: 72, gpu_usage: 50 },
  { date: '2024-01-07', total_cost: 1450, cpu_usage: 88, memory_usage: 76, gpu_usage: 62 }
];

// Mock RAG response
export const mockRAGResponse = {
  id: 'mock-rag-1',
  answer: "Based on your question, here are some recommendations:\n\n1. To optimize GPU usage, consider using mixed precision training and monitoring GPU memory utilization.\n\n2. For cost management, implement auto-scaling policies and use spot instances for non-critical workloads.\n\n3. Monitor resource utilization regularly and right-size instances based on actual usage patterns.",
  sources: [
    { title: "GPU Optimization Guide", doc_type: "guide" },
    { title: "Cost Management Best Practices", doc_type: "guide" }
  ],
  confidence_score: 0.85,
  created_at: new Date().toISOString()
};

// Mock RAG documents
export const mockRAGDocuments = {
  message: "RAG API is working",
  suggested_questions: [
    "What are the workloads we have now?",
    "How can I optimize my GPU usage?",
    "What are the best practices for cost management?",
    "How do I troubleshoot high memory usage?",
    "What is auto-scaling and how does it work?",
    "How can I improve my model performance?",
    "What is the current infrastructure setup?",
    "How much are we spending on workloads monthly?"
  ],
  documents: [
    {
      id: '1',
      title: "GPU Optimization Guide",
      content: "To optimize GPU usage, consider using mixed precision training. This technique uses both 16-bit and 32-bit floating-point representations during training, which can significantly reduce memory usage and increase training speed. Monitor GPU memory utilization using tools like nvidia-smi. Implement gradient accumulation for large batch sizes when memory is limited. Use data parallelism to distribute workloads across multiple GPUs. Consider using model parallelism for very large models that don't fit on a single GPU.",
      doc_type: "guide",
      upload_date: "1705315800"
    },
    {
      id: '2',
      title: "Cost Management Best Practices",
      content: "Implement auto-scaling policies based on workload demand. Use spot instances for non-critical workloads to reduce costs by up to 90%. Right-size your instances by analyzing actual usage patterns rather than peak capacity. Implement resource scheduling to automatically stop idle workloads. Use reserved instances for predictable workloads. Monitor and optimize data transfer costs between regions. Implement cost alerts and budgets to prevent unexpected charges.",
      doc_type: "guide",
      upload_date: "1705315800"
    },
    {
      id: '3',
      title: "Machine Learning Workload Management",
      content: "ML workloads require careful resource allocation and monitoring. Training workloads typically need high GPU memory and compute power, while inference workloads prioritize low latency. Use distributed training for large models across multiple nodes. Implement checkpointing to save training progress and enable recovery. Monitor training metrics like loss, accuracy, and resource utilization. Use hyperparameter tuning to optimize model performance. Implement model versioning and experiment tracking for reproducibility.",
      doc_type: "guide",
      upload_date: "1705315800"
    },
    {
      id: '4',
      title: "Deep Learning Model Training Best Practices",
      content: "When training deep learning models, start with a smaller model to validate your approach. Use transfer learning when possible to leverage pre-trained models. Implement early stopping to prevent overfitting and save compute resources. Use learning rate scheduling to improve convergence. Monitor gradient norms to detect training instabilities. Implement data augmentation to improve model generalization. Use validation sets to tune hyperparameters and prevent overfitting.",
      doc_type: "guide",
      upload_date: "1705315800"
    },
    {
      id: '5',
      title: "Infrastructure Resource Monitoring",
      content: "Effective resource monitoring is crucial for optimizing AI infrastructure. Track CPU, GPU, memory, and network utilization in real-time. Set up alerts for resource thresholds to prevent performance degradation. Use monitoring dashboards to visualize resource trends over time. Implement log aggregation for debugging and performance analysis. Monitor application-level metrics like request latency and throughput. Use distributed tracing to identify performance bottlenecks across services.",
      doc_type: "guide",
      upload_date: "1705315800"
    },
    {
      id: '6',
      title: "Current Setup Guide",
      content: "Current Infrastructure Setup: We currently have 3 active workloads running. 1) Image Classification Model - This is an inference workload that is currently running. It uses 8 CPU cores, 2 GPUs, and 32GB of memory. The cost is $2.50 per hour. 2) NLP Model Inference - This is an inference workload that is currently running. It uses 4 CPU cores, 1 GPU, and 16GB of memory. The cost is $1.80 per hour. 3) Recommendation System - This is a training workload that is currently running. It uses 16 CPU cores, 0 GPUs, and 64GB of memory. The cost is $1.20 per hour. Total monthly cost is approximately $3,240. All workloads are currently in running status and are part of the default tenant.",
      doc_type: "setup",
      upload_date: "1705315800"
    }
  ]
};

// Helper to create mock API response
export const createMockResponse = (data) => {
  return {
    data,
    status: 200,
    statusText: 'OK'
  };
};

// Helper to simulate API delay
export const mockApiCall = (data, delay = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(createMockResponse(data));
    }, delay);
  });
};

export default {
  mockWorkloads,
  mockDashboardStats,
  mockOptimizations,
  mockCostAnalysis,
  mockEfficiencyAnalysis,
  mockSavingsSummary,
  mockPerformanceTrends,
  mockRAGResponse,
  mockRAGDocuments,
  createMockResponse,
  mockApiCall
};

