import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    return config;
  },
  (error) => {
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
    api.get(`/api/workloads/?skip=${skip}&limit=${limit}`),
  
  // Get specific workload
  getWorkload: (id) => 
    api.get(`/api/workloads/${id}`),
  
  // Create workload
  createWorkload: (workloadData) => 
    api.post('/api/workloads/', workloadData),
  
  // Update workload
  updateWorkload: (id, workloadData) => 
    api.put(`/api/workloads/${id}`, workloadData),
  
  // Delete workload
  deleteWorkload: (id) => 
    api.delete(`/api/workloads/${id}`),
  
  // Start workload
  startWorkload: (id) => 
    api.post(`/api/workloads/${id}/start`),
  
  // Stop workload
  stopWorkload: (id) => 
    api.post(`/api/workloads/${id}/stop`),
  
  // Get workload optimization
  getWorkloadOptimization: (id) => 
    api.get(`/api/workloads/${id}/optimization`),
  
  // Get workload cost analysis
  getWorkloadCostAnalysis: (id) => 
    api.get(`/api/workloads/${id}/cost-analysis`),
};

// Monitoring API
export const monitoringAPI = {
  // Get dashboard stats
  getDashboardStats: () => 
    api.get('/api/monitoring/dashboard/stats'),
  
  // Get workload metrics
  getWorkloadMetrics: (workloadId, hours = 24) => 
    api.get(`/api/monitoring/metrics/${workloadId}?hours=${hours}`),
  
  // Create metric
  createMetric: (metricData) => 
    api.post('/api/monitoring/metrics', metricData),
  
  // Get resource usage summary
  getResourceUsageSummary: () => 
    api.get('/api/monitoring/resource-usage'),
  
  // Get performance trends
  getPerformanceTrends: (days = 7) => 
    api.get(`/api/monitoring/performance-trends?days=${days}`),
  
  // Generate sample metrics
  generateSampleMetrics: (workloadId, count = 10) => 
    api.post(`/api/monitoring/generate-sample-metrics/${workloadId}?count=${count}`),
  
  // Get system alerts
  getSystemAlerts: () => 
    api.get('/api/monitoring/alerts'),
};

// Optimization API
export const optimizationAPI = {
  // Get optimization recommendations
  getRecommendations: (statusFilter = null, limit = 50) => 
    api.get(`/api/optimization/recommendations?status_filter=${statusFilter}&limit=${limit}`),
  
  // Get workload optimizations
  getWorkloadOptimizations: (workloadId) => 
    api.get(`/api/optimization/recommendations/${workloadId}`),
  
  // Generate optimization recommendations
  generateRecommendations: () => 
    api.post('/api/optimization/recommendations/generate'),
  
  // Apply optimization
  applyOptimization: (recommendationId) => 
    api.post(`/api/optimization/apply/${recommendationId}`),
  
  // Reject optimization
  rejectOptimization: (recommendationId) => 
    api.post(`/api/optimization/reject/${recommendationId}`),
  
  // Get cost analysis
  getCostAnalysis: () => 
    api.get('/api/optimization/cost-analysis'),
  
  // Get efficiency analysis
  getEfficiencyAnalysis: () => 
    api.get('/api/optimization/efficiency-analysis'),
  
  // Get auto-scaling recommendations
  getAutoScalingRecommendations: () => 
    api.get('/api/optimization/auto-scaling-recommendations'),
  
  // Get savings summary
  getSavingsSummary: () => 
    api.get('/api/optimization/savings-summary'),
  
  // Delete optimization
  deleteOptimization: (recommendationId) => 
    api.delete(`/api/optimization/recommendations/${recommendationId}`),
};

// RAG API
export const ragAPI = {
  // Query RAG system
  queryRAG: (question) => 
    api.post('/api/rag/query', { question }),
  
  // Get query history
  getQueryHistory: (limit = 20, skip = 0) => 
    api.get(`/api/rag/history?limit=${limit}&skip=${skip}`),
  
  // Get suggested questions
  getSuggestedQuestions: () => 
    api.get('/api/rag/suggested-questions'),
  
  // Upload document
  uploadDocument: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/rag/docs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Create document
  createDocument: (title, content, docType = 'guide') => 
    api.post('/api/rag/docs', { title, content, doc_type: docType }),
  
  // Get documents
  getDocuments: (docType = null, limit = 50, skip = 0) => 
    api.get(`/api/rag/docs?doc_type=${docType}&limit=${limit}&skip=${skip}`),
  
  // Get specific document
  getDocument: (documentId) => 
    api.get(`/api/rag/docs/${documentId}`),
  
  // Delete document
  deleteDocument: (documentId) => 
    api.delete(`/api/rag/docs/${documentId}`),
  
  // Search documents
  searchDocuments: (query, limit = 10) => 
    api.get(`/api/rag/search?query=${encodeURIComponent(query)}&limit=${limit}`),
  
  // Get RAG stats
  getRAGStats: () => 
    api.get('/api/rag/stats'),
  
  // Get specific query
  getQuery: (queryId) => 
    api.get(`/api/rag/query/${queryId}`),
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
