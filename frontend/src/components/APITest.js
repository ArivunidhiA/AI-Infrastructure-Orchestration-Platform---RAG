import React, { useState, useEffect } from 'react';

const APITest = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (name, url) => {
    setLoading(true);
    try {
      console.log(`Testing ${name}: ${url}`);
      const response = await fetch(url);
      console.log(`${name} response:`, response);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`${name} data:`, data);
        setResults(prev => ({
          ...prev,
          [name]: { success: true, data, status: response.status }
        }));
      } else {
        console.error(`${name} failed:`, response.status, response.statusText);
        setResults(prev => ({
          ...prev,
          [name]: { success: false, error: `${response.status}: ${response.statusText}`, status: response.status }
        }));
      }
    } catch (error) {
      console.error(`${name} error:`, error);
      setResults(prev => ({
        ...prev,
        [name]: { success: false, error: error.message }
      }));
    } finally {
      setLoading(false);
    }
  };

  const testAll = () => {
    testEndpoint('workloads', '/api/workloads');
    testEndpoint('metrics', '/api/metrics');
    testEndpoint('optimization', '/api/optimization');
    testEndpoint('performance', '/api/performance');
    testEndpoint('rag', '/api/rag');
  };

  useEffect(() => {
    testAll();
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1>API Test Results</h1>
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
            padding: '10px', 
            border: '1px solid #333', 
            borderRadius: '5px',
            backgroundColor: result.success ? '#1a1a1a' : '#2a1a1a'
          }}>
            <h3 style={{ color: result.success ? '#4ade80' : '#f87171' }}>
              {name}: {result.success ? 'SUCCESS' : 'FAILED'}
            </h3>
            {result.success ? (
              <div>
                <p>Status: {result.status}</p>
                <p>Data: {JSON.stringify(result.data).substring(0, 100)}...</p>
              </div>
            ) : (
              <div>
                <p>Error: {result.error}</p>
                <p>Status: {result.status || 'N/A'}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default APITest;
