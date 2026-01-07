import axios from 'axios';
import { isBackendHealthy } from './health';
import {
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
} from './mockData';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to wrap API calls with fallback to mock data
const withFallback = async (apiCall, mockData, showDemoMode = true) => {
  try {
    // Check if backend is healthy
    if (!isBackendHealthy()) {
      if (showDemoMode) {
        console.log('Backend unavailable, using mock data');
      }
      return createMockResponse(mockData);
    }
    
    // Try real API call
    const response = await apiCall();
    return response;
  } catch (error) {
    // If API call fails, use mock data
    console.warn('API call failed, falling back to mock data:', error.message);
    if (showDemoMode) {
      // Show demo mode banner (can be handled by components)
      window.dispatchEvent(new CustomEvent('demo-mode-active'));
    }
    return createMockResponse(mockData);
  }
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    console.log('Making API request to:', config.baseURL + config.url);
    console.log('Full config:', config);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    // Show user-friendly error message
    if (error.response) {
      console.error('Response error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Request error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Workload API
export const workloadAPI = {
  // Get all workloads
  getWorkloads: (skip = 0, limit = 100) => 
    withFallback(
      () => api.get('/workloads'),
      mockWorkloads
    ),
  
  // Get specific workload
  getWorkload: (id) => 
    withFallback(
      () => api.get(`/workloads/${id}`),
      mockWorkloads.find(w => w.id === id) || mockWorkloads[0]
    ),
  
  // Create workload
  createWorkload: (workloadData) => 
    withFallback(
      () => api.post('/workloads/', workloadData),
      { ...workloadData, id: Date.now().toString(), created_at: Date.now().toString() },
      false // Don't show demo mode for writes
    ),
  
  // Update workload
  updateWorkload: (id, workloadData) => 
    withFallback(
      () => api.put(`/workloads/${id}`, workloadData),
      { ...workloadData, id, updated_at: Date.now().toString() },
      false
    ),
  
  // Delete workload
  deleteWorkload: (id) => 
    withFallback(
      () => api.delete(`/workloads/${id}`),
      { success: true },
      false
    ),
  
  // Start workload
  startWorkload: (id) => 
    withFallback(
      () => api.post(`/workloads/${id}/start`),
      { ...mockWorkloads.find(w => w.id === id), status: 'running' },
      false
    ),
  
  // Stop workload
  stopWorkload: (id) => 
    withFallback(
      () => api.post(`/workloads/${id}/stop`),
      { ...mockWorkloads.find(w => w.id === id), status: 'stopped' },
      false
    ),
  
  // Get workload optimization
  getWorkloadOptimization: (id) => 
    withFallback(
      () => api.get('/optimization'),
      mockOptimizations.filter(o => o.workload_id === id)
    ),
  
  // Get workload cost analysis
  getWorkloadCostAnalysis: (id) => 
    withFallback(
      () => api.get('/cost-analysis'),
      mockCostAnalysis
    ),
};

// Monitoring API
export const monitoringAPI = {
  // Get dashboard stats
  getDashboardStats: () => 
    withFallback(
      () => api.get('/metrics'),
      mockDashboardStats
    ),
  
  // Get workload metrics
  getWorkloadMetrics: (workloadId, hours = 24) => 
    withFallback(
      () => api.get(`/metrics/${workloadId}?hours=${hours}`),
      []
    ),
  
  // Create metric
  createMetric: (metricData) => 
    withFallback(
      () => api.post('/metrics', metricData),
      { ...metricData, id: Date.now().toString() },
      false
    ),
  
  // Get resource usage summary
  getResourceUsageSummary: () => 
    withFallback(
      () => api.get('/metrics'),
      mockDashboardStats
    ),
  
  // Get performance trends
  getPerformanceTrends: (days = 7) => {
    // Generate dynamic mock data based on days
    const generateTrends = () => {
      const trends = [];
      const today = new Date();
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Generate varying data based on day index
        const baseCpu = 65 + (i % 7) * 3;
        const baseMemory = 70 + (i % 5) * 2;
        const baseGpu = 45 + (i % 6) * 3;
        const baseCost = 1200 + (i % 4) * 50;
        
        trends.push({
          date: dateStr,
          total_cost: Math.round((baseCost + Math.random() * 100) * 100) / 100,
          cpu_usage: Math.min(95, Math.max(40, Math.round((baseCpu + Math.random() * 10) * 10) / 10)),
          memory_usage: Math.min(90, Math.max(50, Math.round((baseMemory + Math.random() * 8) * 10) / 10)),
          gpu_usage: Math.min(80, Math.max(25, Math.round((baseGpu + Math.random() * 10) * 10) / 10))
        });
      }
      
      return trends;
    };
    
    return withFallback(
      () => api.get(`/performance?days=${days}`),
      generateTrends()
    );
  },
  
  // Generate sample metrics
  generateSampleMetrics: (workloadId, count = 10) => 
    withFallback(
      () => api.post('/metrics', { workloadId, count }),
      { success: true, count },
      false
    ),
  
  // Get system alerts
  getSystemAlerts: () => 
    withFallback(
      () => api.get('/metrics'),
      []
    ),
};

// Optimization API
export const optimizationAPI = {
  // Get optimization recommendations
  getRecommendations: (statusFilter = null, limit = 50) => 
    withFallback(
      () => api.get(`/optimization${statusFilter ? `?status_filter=${statusFilter}` : ''}`),
      mockOptimizations
    ),
  
  // Get workload optimizations
  getWorkloadOptimizations: (workloadId) => 
    withFallback(
      () => api.get('/optimization'),
      mockOptimizations.filter(o => o.workload_id === workloadId)
    ),
  
  // Generate optimization recommendations
  generateRecommendations: () => 
    withFallback(
      () => api.post('/optimization'),
      mockOptimizations,
      false
    ),
  
  // Apply optimization
  applyOptimization: (recommendationId) => 
    withFallback(
      () => api.post(`/optimization/${recommendationId}/apply`),
      { ...mockOptimizations[0], status: 'applied' },
      false
    ),
  
  // Reject optimization
  rejectOptimization: (recommendationId) => 
    withFallback(
      () => api.post(`/optimization/${recommendationId}/reject`),
      { success: true },
      false
    ),
  
  // Get cost analysis
  getCostAnalysis: () => 
    withFallback(
      () => api.get('/cost-analysis'),
      mockCostAnalysis
    ),
  
  // Get efficiency analysis
  getEfficiencyAnalysis: () => 
    withFallback(
      () => api.get('/efficiency-analysis'),
      mockEfficiencyAnalysis
    ),
  
  // Get auto-scaling recommendations
  getAutoScalingRecommendations: () => 
    withFallback(
      () => api.get('/optimization'),
      mockOptimizations
    ),
  
  // Get savings summary
  getSavingsSummary: () => 
    withFallback(
      () => api.get('/savings-summary'),
      mockSavingsSummary
    ),
  
  // Delete optimization
  deleteOptimization: (recommendationId) => 
    withFallback(
      () => api.delete(`/optimization/${recommendationId}`),
      { success: true },
      false
    ),
};

// RAG API
export const ragAPI = {
  // Query RAG system
  queryRAG: (question) => {
    // Create dynamic response based on question
    const generateResponse = () => {
      const questionLower = question.toLowerCase().trim();
      let answer = "";
      let sources = [];
      let confidence = 0.85;
      
      // Handle simple greetings and casual queries
      const simpleGreetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'greetings'];
      const isSimpleGreeting = simpleGreetings.some(greeting => questionLower === greeting || questionLower.startsWith(greeting + ' '));
      
      if (isSimpleGreeting || questionLower.length < 10) {
        // Simple, friendly response for greetings
        answer = "Hello! I'm here to help you with questions about AI infrastructure, workload management, cost optimization, and more. What would you like to know?";
        sources = [];
        confidence = 0.95;
      } else if (questionLower.includes('gpu') || questionLower.includes('graphics')) {
        answer = "To optimize GPU usage, consider using mixed precision training and monitoring GPU memory utilization. Use tools like nvidia-smi to track GPU performance. Implement data parallelism to distribute workloads across multiple GPUs. Consider gradient accumulation for large batch sizes when memory is limited.";
        sources = [{ title: "GPU Optimization Guide", doc_type: "guide" }];
      } else if (questionLower.includes('cost') || questionLower.includes('price') || questionLower.includes('budget')) {
        answer = "For cost management, implement auto-scaling policies and use spot instances for non-critical workloads. Right-size your instances based on actual usage patterns. Use reserved instances for predictable workloads and implement cost alerts to prevent unexpected charges.";
        sources = [{ title: "Cost Management Best Practices", doc_type: "guide" }];
      } else if (questionLower.includes('workload') && (questionLower.includes('have') || questionLower.includes('now') || questionLower.includes('current') || questionLower.includes('what'))) {
        answer = "We currently have 3 active workloads running: 1) Image Classification Model - inference workload with 8 CPU cores, 2 GPUs, and 32GB memory ($2.50/hr), 2) NLP Model Inference - inference workload with 4 CPU cores, 1 GPU, and 16GB memory ($1.80/hr), and 3) Recommendation System - training workload with 16 CPU cores, 0 GPUs, and 64GB memory ($1.20/hr). All workloads are currently running. Total monthly cost is approximately $3,240.";
        sources = [{ title: "Current Setup Guide", doc_type: "setup" }];
      } else if (questionLower.includes('workload') || questionLower.includes('training') || questionLower.includes('inference')) {
        answer = "ML workloads require careful resource allocation. Training workloads need high GPU memory and compute power, while inference workloads prioritize low latency. Use distributed training for large models. Implement checkpointing and monitor training metrics like loss and accuracy.";
        sources = [{ title: "Machine Learning Workload Management", doc_type: "guide" }];
      } else if (questionLower.includes('model') || questionLower.includes('deep learning') || questionLower.includes('neural')) {
        answer = "For deep learning models, start with a smaller model to validate your approach. Use transfer learning when possible. Implement early stopping to prevent overfitting. Use learning rate scheduling and monitor gradient norms. Implement data augmentation for better generalization.";
        sources = [{ title: "Deep Learning Model Training Best Practices", doc_type: "guide" }];
      } else if (questionLower.includes('monitor') || questionLower.includes('track') || questionLower.includes('performance')) {
        answer = "Effective resource monitoring tracks CPU, GPU, memory, and network utilization in real-time. Set up alerts for resource thresholds. Use monitoring dashboards to visualize trends. Implement log aggregation and distributed tracing to identify bottlenecks.";
        sources = [{ title: "Infrastructure Resource Monitoring", doc_type: "guide" }];
      } else {
        // For other questions, provide a helpful but not overly complex response
        answer = "I can help you with various aspects of AI infrastructure management. You can ask me about:\n\n• GPU optimization and resource allocation\n• Cost management and optimization strategies\n• Workload management (training vs inference)\n• Model training best practices\n• Infrastructure monitoring and performance\n\nWhat specific topic would you like to explore?";
        sources = [];
        confidence = 0.7;
      }
      
      return {
        id: `mock-rag-${Date.now()}`,
        answer: answer,
        sources: sources,
        confidence_score: confidence,
        created_at: new Date().toISOString()
      };
    };
    
    return withFallback(
      () => api.post('/rag', { query: question }),
      generateResponse()
    );
  },
  
  // Get query history
  getQueryHistory: (limit = 20, skip = 0) => 
    withFallback(
      () => api.get('/rag'),
      mockRAGDocuments
    ),
  
  // Get suggested questions
  getSuggestedQuestions: () => 
    withFallback(
      () => api.get('/rag'),
      { suggested_questions: mockRAGDocuments.suggested_questions }
    ),
  
  // Upload document
  uploadDocument: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return withFallback(
      () => api.post('/rag/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      { success: true, message: 'Document uploaded (demo mode)', document_id: Date.now().toString() },
      false
    );
  },
  
  // Create document
  createDocument: (title, content, docType = 'guide') => 
    withFallback(
      () => api.post('/rag/docs', { title, content, doc_type: docType }),
      { success: true, id: Date.now().toString() },
      false
    ),
  
  // Get documents
  getDocuments: (docType = null, limit = 50, skip = 0) => 
    withFallback(
      () => api.get('/rag'),
      mockRAGDocuments.documents
    ),
  
  // Get specific document
  getDocument: (documentId) => 
    withFallback(
      () => api.get(`/rag/${documentId}`),
      mockRAGDocuments.documents.find(d => d.id === documentId) || mockRAGDocuments.documents[0]
    ),
  
  // Delete document
  deleteDocument: (documentId) => 
    withFallback(
      () => api.delete(`/rag/${documentId}`),
      { success: true },
      false
    ),
  
  // Search documents
  searchDocuments: (query, limit = 10) => 
    withFallback(
      () => api.get(`/rag/search?query=${query}&limit=${limit}`),
      mockRAGDocuments.documents
    ),
  
  // Get RAG stats
  getRAGStats: () => 
    withFallback(
      () => api.get('/rag'),
      { documents: mockRAGDocuments.documents.length, queries: 0 }
    ),
  
  // Get specific query
  getQuery: (queryId) => 
    withFallback(
      () => api.get(`/rag/query/${queryId}`),
      mockRAGResponse
    ),
};

// Utility functions
export const apiUtils = {
  // Handle API errors
  handleError: (error) => {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data.message || error.response.data.detail || 'An error occurred',
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Network error - please check your connection',
        status: 0,
        data: null,
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        status: 0,
        data: null,
      };
    }
  },
  
  // Format currency
  formatCurrency: (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },
  
  // Format percentage
  formatPercentage: (value, decimals = 1) => {
    return `${value.toFixed(decimals)}%`;
  },
  
  // Format bytes
  formatBytes: (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },
  
  // Format date
  formatDate: (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },
  
  // Format relative time
  formatRelativeTime: (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  },
};

export default api;
