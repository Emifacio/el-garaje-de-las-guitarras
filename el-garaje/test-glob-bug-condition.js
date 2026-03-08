/**
 * Bug Condition Exploration Test for glob@10.5.0 Security Vulnerability
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3**
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * 
 * This test verifies the bug condition where glob@10.5.0 is installed as a 
 * transitive dependency through @vercel/nft, producing deprecation warnings
 * and security vulnerabilities.
 * 
 * Expected behavior (after fix):
 * - glob version should be 11.x or later
 * - No deprecation warnings during npm operations
 * - No security vulnerabilities in npm audit
 */

import { execSync } from 'child_process';
import { exit } from 'process';

console.log('=== Bug Condition Exploration Test ===\n');

let testsPassed = 0;
let testsFailed = 0;
const counterexamples = [];

/**
 * Test 1: Check installed glob version
 * Expected on unfixed code: glob@10.5.0
 * Expected after fix: glob@11.x or later
 */
console.log('Test 1: Checking installed glob version...');
try {
  const output = execSync('npm list glob --depth=10', { 
    encoding: 'utf-8',
    cwd: process.cwd()
  });
  
  console.log('npm list glob output:');
  console.log(output);
  
  // Check if glob@10.5.0 is present (bug condition)
  if (output.includes('glob@10.5.0')) {
    console.log('❌ FAIL: glob@10.5.0 is installed (bug condition detected)');
    counterexamples.push('npm list glob shows glob@10.5.0 installed');
    testsFailed++;
  } else if (output.match(/glob@11\.\d+\.\d+/) || output.match(/glob@1[2-9]\.\d+\.\d+/)) {
    console.log('✓ PASS: Secure glob version (11.x or later) is installed');
    testsPassed++;
  } else {
    console.log('⚠ WARNING: Unexpected glob version detected');
    console.log('Output:', output);
    testsFailed++;
  }
} catch (error) {
  console.log('❌ FAIL: Error checking glob version');
  console.log('Error:', error.message);
  testsFailed++;
}

console.log('\n---\n');

/**
 * Test 2: Check for deprecation warnings during npm install
 * Expected on unfixed code: Deprecation warning for glob@10.5.0
 * Expected after fix: No deprecation warnings
 */
console.log('Test 2: Checking for deprecation warnings...');
try {
  const output = execSync('npm install --dry-run', { 
    encoding: 'utf-8',
    cwd: process.cwd(),
    stdio: 'pipe'
  });
  
  // Check for deprecation warning (bug condition)
  if (output.includes('deprecated glob@10.5.0') || 
      output.includes('npm warn deprecated glob@10.5.0')) {
    console.log('❌ FAIL: Deprecation warning detected for glob@10.5.0');
    counterexamples.push('npm install displays deprecation warning: "npm warn deprecated glob@10.5.0"');
    testsFailed++;
  } else if (output.toLowerCase().includes('deprecated glob')) {
    console.log('⚠ WARNING: Deprecation warning for different glob version');
    console.log('Output:', output);
    testsFailed++;
  } else {
    console.log('✓ PASS: No deprecation warnings for glob');
    testsPassed++;
  }
} catch (error) {
  // npm install might output warnings to stderr
  const stderr = error.stderr?.toString() || '';
  const stdout = error.stdout?.toString() || '';
  const combined = stderr + stdout;
  
  if (combined.includes('deprecated glob@10.5.0') || 
      combined.includes('npm warn deprecated glob@10.5.0')) {
    console.log('❌ FAIL: Deprecation warning detected for glob@10.5.0');
    counterexamples.push('npm install displays deprecation warning: "npm warn deprecated glob@10.5.0"');
    testsFailed++;
  } else {
    console.log('✓ PASS: No deprecation warnings for glob');
    testsPassed++;
  }
}

console.log('\n---\n');

/**
 * Test 3: Check npm audit for glob security vulnerabilities
 * Expected on unfixed code: Security vulnerabilities reported
 * Expected after fix: No glob-related vulnerabilities
 */
console.log('Test 3: Checking npm audit for security vulnerabilities...');
try {
  const output = execSync('npm audit --json', { 
    encoding: 'utf-8',
    cwd: process.cwd()
  });
  
  const auditData = JSON.parse(output);
  
  // Check for glob-related vulnerabilities
  let globVulnerabilities = [];
  
  if (auditData.vulnerabilities && auditData.vulnerabilities.glob) {
    globVulnerabilities.push(auditData.vulnerabilities.glob);
  }
  
  // Also check in advisories
  if (auditData.advisories) {
    for (const advisory of Object.values(auditData.advisories)) {
      if (advisory.module_name === 'glob') {
        globVulnerabilities.push(advisory);
      }
    }
  }
  
  if (globVulnerabilities.length > 0) {
    console.log('❌ FAIL: Security vulnerabilities found in glob');
    console.log('Vulnerabilities:', JSON.stringify(globVulnerabilities, null, 2));
    counterexamples.push('npm audit reports security vulnerabilities in glob');
    testsFailed++;
  } else {
    console.log('✓ PASS: No glob-related security vulnerabilities');
    testsPassed++;
  }
} catch (error) {
  // npm audit exits with non-zero code when vulnerabilities are found
  if (error.stdout) {
    try {
      const auditData = JSON.parse(error.stdout.toString());
      
      let globVulnerabilities = [];
      
      if (auditData.vulnerabilities && auditData.vulnerabilities.glob) {
        globVulnerabilities.push(auditData.vulnerabilities.glob);
      }
      
      if (auditData.advisories) {
        for (const advisory of Object.values(auditData.advisories)) {
          if (advisory.module_name === 'glob') {
            globVulnerabilities.push(advisory);
          }
        }
      }
      
      if (globVulnerabilities.length > 0) {
        console.log('❌ FAIL: Security vulnerabilities found in glob');
        console.log('Vulnerabilities:', JSON.stringify(globVulnerabilities, null, 2));
        counterexamples.push('npm audit reports security vulnerabilities in glob');
        testsFailed++;
      } else {
        console.log('✓ PASS: No glob-related security vulnerabilities');
        testsPassed++;
      }
    } catch (parseError) {
      console.log('⚠ WARNING: Could not parse npm audit output');
      console.log('Error:', parseError.message);
      testsFailed++;
    }
  } else {
    console.log('⚠ WARNING: npm audit failed');
    console.log('Error:', error.message);
    testsFailed++;
  }
}

console.log('\n---\n');

/**
 * Test 4: Verify dependency chain contains glob@10.5.0 through @vercel/nft
 * Expected on unfixed code: glob@10.5.0 as transitive dependency
 * Expected after fix: glob@11.x or later
 */
console.log('Test 4: Checking dependency chain through @vercel/nft...');
try {
  const output = execSync('npm list @vercel/nft --depth=10', { 
    encoding: 'utf-8',
    cwd: process.cwd()
  });
  
  console.log('Dependency chain:');
  console.log(output);
  
  // Check if the chain includes glob@10.5.0
  if (output.includes('glob@10.5.0')) {
    console.log('❌ FAIL: Dependency chain contains glob@10.5.0');
    counterexamples.push('Dependency tree contains glob@10.5.0 as transitive dependency through @vercel/nft');
    testsFailed++;
  } else if (output.match(/glob@11\.\d+\.\d+/) || output.match(/glob@1[2-9]\.\d+\.\d+/)) {
    console.log('✓ PASS: Dependency chain uses secure glob version');
    testsPassed++;
  } else {
    console.log('⚠ WARNING: Could not determine glob version in dependency chain');
    testsFailed++;
  }
} catch (error) {
  console.log('⚠ WARNING: Error checking dependency chain');
  console.log('Error:', error.message);
  testsFailed++;
}

console.log('\n=== Test Summary ===\n');
console.log(`Tests Passed: ${testsPassed}`);
console.log(`Tests Failed: ${testsFailed}`);

if (counterexamples.length > 0) {
  console.log('\n=== Counterexamples Found (Bug Condition Detected) ===\n');
  counterexamples.forEach((example, index) => {
    console.log(`${index + 1}. ${example}`);
  });
  console.log('\nThese counterexamples confirm the bug exists in the current code.');
  console.log('The bug will be fixed in subsequent tasks.');
}

console.log('\n=== Expected Outcome ===');
if (testsFailed > 0) {
  console.log('✓ Tests FAILED as expected - bug condition confirmed');
  console.log('This is the CORRECT outcome for exploration tests on unfixed code.');
  exit(0); // Exit with success - failing tests confirm the bug exists
} else {
  console.log('⚠ Tests PASSED unexpectedly - bug may not exist or already fixed');
  console.log('This requires investigation.');
  exit(1); // Exit with failure - passing tests mean bug is not reproduced
}
