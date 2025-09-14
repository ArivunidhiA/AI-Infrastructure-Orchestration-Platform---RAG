import React from 'react';

function App() {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#000', 
      color: '#fff', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>AI Infrastructure Platform</h1>
      <p>App is loading...</p>
      <button onClick={() => {
        fetch('/api/workloads')
          .then(response => response.json())
          .then(data => {
            console.log('Data:', data);
            alert('API working! Check console for data.');
          })
          .catch(error => {
            console.error('Error:', error);
            alert('API error: ' + error.message);
          });
      }}>
        Test API
      </button>
    </div>
  );
}

export default App;
