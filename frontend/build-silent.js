// Silent build script for Netlify
const { execSync } = require('child_process');

console.log('Starting silent build...');

try {
  // Set environment variables to suppress warnings
  process.env.CI = 'false';
  process.env.GENERATE_SOURCEMAP = 'false';
  process.env.DISABLE_ESLINT_PLUGIN = 'true';
  process.env.NODE_OPTIONS = '--max_old_space_size=4096';
  
  // Run the build
  execSync('react-scripts build', { 
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
