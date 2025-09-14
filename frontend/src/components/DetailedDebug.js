import React, { useState, useEffect } from 'react';
import { workloadAPI, monitoringAPI, optimizationAPI, ragAPI } from '../services/api';

const DetailedDebug = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testAPI = async (name, apiCall) => {
    setLoading(true);
    try {
      console.log(`Testing ${name}...`);
      console.log('API call:', apiCall);
      
      const response = await apiCall();
      console.log(`${name} response:`, response);
      
      setResults(prev => ({
        ...prev,
        [name]: { 
          success: true, 
          data: response.data, 
          status: response.status,
          url: response.config?.url || 'Unknown'
        }
      }));
    } catch (error) {
      console.error(`${name} error:`, error);
      setResults(prev => ({
        ...prev,
        [name]: { 
          success: false, 
          error: error.message,
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url || 'Unknown'
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const testAll = async () => {
    console.log('Starting detailed API tests...');
    
    // Test workload API
    await testAPI('workloads', () => workloadAPI.getWorkloads());
    
    // Test monitoring API
    await testAPI('dashboardStats', () => monitoringAPI.getDashboardStats());
    await testAPI('resourceUsage', () => monitoringAPI.getResourceUsageSummary());
    await testAPI('performanceTrends', () => monitoringAPI.getPerformanceTrends());
    
    // Test optimization API
    await testAPI('recommendations', () => optimizationAPI.getRecommendations());
    await testAPI('costAnalysis', () => optimizationAPI.getCostAnalysis());
    await testAPI('efficiencyAnalysis', () => optimizationAPI.getEfficiencyAnalysis());
    await testAPI('savingsSummary', () => optimizationAPI.getSavingsSummary());
    
    // Test RAG API
    await testAPI('ragQuery', () => ragAPI.queryRAG('test query'));
  };

  useEffect(() => {
    testAll();
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1>Detailed API Debug</h1>
      <button onClick={testAll} disabled={loading} style={{ 
        padding: '10px 20px', 
        backgroundColor: '#6366f1', 
        color: 'white', 
        border: 'none', 
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        {loading ? 'Testing...' : 'Test All APIs'}
      </button>
      
      <div>
        {Object.entries(results).map(([name, result]) => (
          <div key={name} style={{ 
            margin: '10px 0', 
            padding: '15px', 
            border: '1px solid #333', 
            borderRadius: '5px',
            backgroundColor: result.success ? '#1a1a1a' : '#2a1a1a'
          }}>
            <h3 style={{ color: result.success ? '#4ade80' : '#f87171' }}>
              {name}: {result.success ? 'SUCCESS' : 'FAILED'}
            </h3>
            <p><strong>URL:</strong> {result.url}</p>
            <p><strong>Status:</strong> {result.status || 'N/A'}</p>
            {result.success ? (
              <div>
                <p><strong>Data:</strong> {JSON.stringify(result.data).substring(0, 200)}...</p>
              </div>
            ) : (
              <div>
                <p><strong>Error:</strong> {result.error}</p>
                {result.response && (
                  <p><strong>Response:</strong> {JSON.stringify(result.response)}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DetailedDebug;
