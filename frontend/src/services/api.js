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
    api.get('/workloads'),
  
  // Get specific workload
  getWorkload: (id) => 
    api.get('/workloads'),
  
  // Create workload
  createWorkload: (workloadData) => 
    api.post('/workloads/', workloadData),
  
  // Update workload
  updateWorkload: (id, workloadData) => 
    api.put(`/workloads/${id}`, workloadData),
  
  // Delete workload
  deleteWorkload: (id) => 
    api.delete(`/workloads/${id}`),
  
  // Start workload
  startWorkload: (id) => 
    api.post(`/workloads/${id}/start`),
  
  // Stop workload
  stopWorkload: (id) => 
    api.post(`/workloads/${id}/stop`),
  
  // Get workload optimization
  getWorkloadOptimization: (id) => 
    api.get('/optimization'),
  
  // Get workload cost analysis
  getWorkloadCostAnalysis: (id) => 
    api.get('/optimization'),
};

// Monitoring API
export const monitoringAPI = {
  // Get dashboard stats
  getDashboardStats: () => 
    api.get('/metrics'),
  
  // Get workload metrics
  getWorkloadMetrics: (workloadId, hours = 24) => 
    api.get('/metrics'),
  
  // Create metric
  createMetric: (metricData) => 
    api.post('/metrics', metricData),
  
  // Get resource usage summary
  getResourceUsageSummary: () => 
    api.get('/metrics'),
  
  // Get performance trends
  getPerformanceTrends: (days = 7) => 
    api.get('/performance'),
  
  // Generate sample metrics
  generateSampleMetrics: (workloadId, count = 10) => 
    api.post('/metrics', { workloadId, count }),
  
  // Get system alerts
  getSystemAlerts: () => 
    api.get('/metrics'),
};

// Optimization API
export const optimizationAPI = {
  // Get optimization recommendations
  getRecommendations: (statusFilter = null, limit = 50) => 
    api.get('/optimization'),
  
  // Get workload optimizations
  getWorkloadOptimizations: (workloadId) => 
    api.get('/optimization'),
  
  // Generate optimization recommendations
  generateRecommendations: () => 
    api.post('/optimization'),
  
  // Apply optimization
  applyOptimization: (recommendationId) => 
    api.post('/optimization'),
  
  // Reject optimization
  rejectOptimization: (recommendationId) => 
    api.post('/optimization'),
  
  // Get cost analysis
  getCostAnalysis: () => 
    api.get('/cost-analysis'),
  
  // Get efficiency analysis
  getEfficiencyAnalysis: () => 
    api.get('/efficiency-analysis'),
  
  // Get auto-scaling recommendations
  getAutoScalingRecommendations: () => 
    api.get('/optimization'),
  
  // Get savings summary
  getSavingsSummary: () => 
    api.get('/savings-summary'),
  
  // Delete optimization
  deleteOptimization: (recommendationId) => 
    api.delete('/optimization'),
};

// RAG API
export const ragAPI = {
  // Query RAG system
  queryRAG: (question) => 
    api.post('/rag', { query: question }),
  
  // Get query history
  getQueryHistory: (limit = 20, skip = 0) => 
    api.get('/rag'),
  
  // Get suggested questions
  getSuggestedQuestions: () => 
    api.get('/rag'),
  
  // Upload document
  uploadDocument: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/rag', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Create document
  createDocument: (title, content, docType = 'guide') => 
    api.post('/rag/docs', { title, content, doc_type: docType }),
  
  // Get documents
  getDocuments: (docType = null, limit = 50, skip = 0) => 
    api.get('/rag'),
  
  // Get specific document
  getDocument: (documentId) => 
    api.get('/rag'),
  
  // Delete document
  deleteDocument: (documentId) => 
    api.delete('/rag'),
  
  // Search documents
  searchDocuments: (query, limit = 10) => 
    api.get('/rag'),
  
  // Get RAG stats
  getRAGStats: () => 
    api.get('/rag'),
  
  // Get specific query
  getQuery: (queryId) => 
    api.get('/rag'),
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
