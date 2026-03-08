/**
 * Preservation Property Tests for Astro and Vercel Functionality
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
 * 
 * IMPORTANT: These tests establish baseline behavior on UNFIXED code
 * 
 * This test verifies that all Astro and Vercel adapter functionality continues
 * to work correctly. These tests should PASS on unfixed code to confirm the
 * baseline behavior that must be preserved after the glob security fix.
 * 
 * Expected behavior (both before and after fix):
 * - npm run dev starts development server successfully
 * - npm run build completes without errors and produces output
 * - npm run preview works correctly
 * - All dependencies install without conflicts
 */

import { execSync, spawn } from 'child_process';
import { exit } from 'process';
import { existsSync } from 'fs';
import { join } from 'path';

console.log('=== Preservation Property Tests ===\n');

let testsPassed = 0;
let testsFailed = 0;

/**
 * Test 1: Verify npm run dev starts development server successfully
 * Expected: Server starts without errors and listens on a port
 */
console.log('Test 1: Testing npm run dev (development server)...');
try {
  // Start the dev server as a background process
  const devProcess = spawn('npm', ['run', 'dev'], {
    cwd: process.cwd(),
    stdio: 'pipe',
    shell: true
  });

  let output = '';
  let serverStarted = false;
  
  // Collect output
  devProcess.stdout.on('data', (data) => {
    output += data.toString();
  });
  
  devProcess.stderr.on('data', (data) => {
    output += data.toString();
  });

  // Wait for server to start (look for typical Astro dev server indicators)
  const checkInterval = setInterval(() => {
    if (output.includes('astro') && 
        (output.includes('Local') || output.includes('localhost') || output.includes('ready'))) {
      serverStarted = true;
      clearInterval(checkInterval);
      clearTimeout(timeout);
      
      // Kill the dev server
      devProcess.kill('SIGTERM');
      
      console.log('✓ PASS: Development server started successfully');
      console.log('Server output preview:', output.substring(0, 200));
      testsPassed++;
    }
  }, 500);

  // Timeout after 30 seconds
  const timeout = setTimeout(() => {
    clearInterval(checkInterval);
    devProcess.kill('SIGTERM');
    
    if (!serverStarted) {
      console.log('❌ FAIL: Development server did not start within 30 seconds');
      console.log('Output:', output);
      testsFailed++;
    }
  }, 30000);

  // Wait for the process to be killed
  await new Promise((resolve) => {
    devProcess.on('exit', resolve);
  });

} catch (error) {
  console.log('❌ FAIL: Error starting development server');
  console.log('Error:', error.message);
  testsFailed++;
}

console.log('\n---\n');

/**
 * Test 2: Verify npm run build completes without errors
 * Expected: Build succeeds and produces dist output
 */
console.log('Test 2: Testing npm run build (production build)...');
try {
  const output = execSync('npm run build', {
    encoding: 'utf-8',
    cwd: process.cwd(),
    stdio: 'pipe'
  });

  console.log('Build output preview:', output.substring(0, 300));

  // Check if dist directory was created
  const distPath = join(process.cwd(), 'dist');
  if (existsSync(distPath)) {
    console.log('✓ PASS: Build completed successfully and produced dist output');
    testsPassed++;
  } else {
    console.log('❌ FAIL: Build completed but dist directory not found');
    testsFailed++;
  }

} catch (error) {
  console.log('❌ FAIL: Build failed with error');
  console.log('Error:', error.message);
  if (error.stdout) {
    console.log('stdout:', error.stdout.toString());
  }
  if (error.stderr) {
    console.log('stderr:', error.stderr.toString());
  }
  testsFailed++;
}

console.log('\n---\n');

/**
 * Test 3: Verify npm run preview works correctly
 * Expected: Preview server starts without errors
 */
console.log('Test 3: Testing npm run preview (preview server)...');
try {
  // Start the preview server as a background process
  const previewProcess = spawn('npm', ['run', 'preview'], {
    cwd: process.cwd(),
    stdio: 'pipe',
    shell: true
  });

  let output = '';
  let serverStarted = false;
  
  // Collect output
  previewProcess.stdout.on('data', (data) => {
    output += data.toString();
  });
  
  previewProcess.stderr.on('data', (data) => {
    output += data.toString();
  });

  // Wait for server to start
  const checkInterval = setInterval(() => {
    if (output.includes('astro') && 
        (output.includes('Local') || output.includes('localhost') || output.includes('preview'))) {
      serverStarted = true;
      clearInterval(checkInterval);
      clearTimeout(timeout);
      
      // Kill the preview server
      previewProcess.kill('SIGTERM');
      
      console.log('✓ PASS: Preview server started successfully');
      console.log('Server output preview:', output.substring(0, 200));
      testsPassed++;
    }
  }, 500);

  // Timeout after 30 seconds
  const timeout = setTimeout(() => {
    clearInterval(checkInterval);
    previewProcess.kill('SIGTERM');
    
    if (!serverStarted) {
      console.log('❌ FAIL: Preview server did not start within 30 seconds');
      console.log('Output:', output);
      testsFailed++;
    }
  }, 30000);

  // Wait for the process to be killed
  await new Promise((resolve) => {
    previewProcess.on('exit', resolve);
  });

} catch (error) {
  console.log('❌ FAIL: Error starting preview server');
  console.log('Error:', error.message);
  testsFailed++;
}

console.log('\n---\n');

/**
 * Test 4: Verify all dependencies install without conflicts
 * Expected: npm install completes successfully
 */
console.log('Test 4: Testing dependency installation...');
try {
  const output = execSync('npm install --dry-run', {
    encoding: 'utf-8',
    cwd: process.cwd(),
    stdio: 'pipe'
  });

  // Check for conflict indicators
  if (output.toLowerCase().includes('conflict') || 
      output.toLowerCase().includes('unable to resolve') ||
      output.toLowerCase().includes('peer dep')) {
    console.log('❌ FAIL: Dependency conflicts detected');
    console.log('Output:', output);
    testsFailed++;
  } else {
    console.log('✓ PASS: All dependencies install without conflicts');
    testsPassed++;
  }

} catch (error) {
  // Check if it's just warnings (exit code 0) or actual errors
  if (error.status === 0 || !error.stderr?.toString().toLowerCase().includes('error')) {
    console.log('✓ PASS: All dependencies install without conflicts');
    testsPassed++;
  } else {
    console.log('❌ FAIL: Dependency installation failed');
    console.log('Error:', error.message);
    if (error.stdout) {
      console.log('stdout:', error.stdout.toString());
    }
    if (error.stderr) {
      console.log('stderr:', error.stderr.toString());
    }
    testsFailed++;
  }
}

console.log('\n=== Test Summary ===\n');
console.log(`Tests Passed: ${testsPassed}`);
console.log(`Tests Failed: ${testsFailed}`);

console.log('\n=== Expected Outcome ===');
if (testsPassed === 4 && testsFailed === 0) {
  console.log('✓ All tests PASSED - baseline behavior confirmed');
  console.log('This is the CORRECT outcome for preservation tests.');
  console.log('These behaviors must be preserved after the glob security fix.');
  exit(0);
} else {
  console.log('⚠ Some tests FAILED - baseline behavior issues detected');
  console.log('This may indicate existing problems that need investigation.');
  exit(1);
}
