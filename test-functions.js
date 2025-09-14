// Test script to verify Netlify Functions
const https = require('https');

const testFunction = (endpoint) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'ai-infrastructure-with-rag.netlify.app',
      port: 443,
      path: `/api/${endpoint}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`✅ ${endpoint}: ${res.statusCode}`);
        console.log(`   Response: ${data.substring(0, 100)}...`);
        resolve({ endpoint, status: res.statusCode, data });
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${endpoint}: ${error.message}`);
      reject(error);
    });

    req.end();
  });
};

// Test all endpoints
const testAll = async () => {
  console.log('Testing Netlify Functions...\n');
  
  try {
    await testFunction('workloads');
    await testFunction('metrics');
    await testFunction('optimization');
    await testFunction('performance');
    await testFunction('rag');
    console.log('\n✅ All functions tested!');
  } catch (error) {
    console.log('\n❌ Some functions failed:', error.message);
  }
};

testAll();
