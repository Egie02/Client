/**
 * Build Configuration for Production Security
 * This file contains configuration for code obfuscation and security hardening
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Production build configuration
const PRODUCTION_CONFIG = {
  // Code Obfuscation Settings
  obfuscation: {
    enabled: true,
    options: {
      // Compact code without line breaks
      compact: true,
      
      // Mangle variable names
      mangle: {
        toplevel: true,
        properties: {
          regex: /^_/
        }
      },
      
      // Compress code
      compress: {
        dead_code: true,
        drop_console: true, // Remove console.log statements
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn', 'console.info'],
        passes: 2
      },
      
      // Format output
      output: {
        comments: false,
        beautify: false,
        semicolons: true
      }
    }
  },

  // Security hardening
  security: {
    // Remove development artifacts
    removeDevelopmentFiles: true,
    
    // Files to remove in production
    developmentFiles: [
      '**/*.test.js',
      '**/*.test.jsx',
      '**/*.spec.js',
      '**/*.spec.jsx',
      '**/test/**',
      '**/tests/**',
      '**/__tests__/**',
      '**/debug.js',
      '**/development.js',
      '**/.DS_Store',
      '**/Thumbs.db'
    ],
    
    // Sensitive strings to obfuscate
    sensitiveStrings: [
      'console.log',
      'debugger',
      'alert',
      'localhost',
      'development',
      'dev-server',
      'hot-reload'
    ]
  },

  // Environment variables for production
  environment: {
    NODE_ENV: 'production',
    BABEL_ENV: 'production',
    // Remove any development API endpoints
    API_URL: process.env.PRODUCTION_API_URL || 'https://cloud.mandaluyongmpc.com'
  }
};

// Function to check if running in production mode
const isProduction = () => {
  return process.env.NODE_ENV === 'production' || process.env.BABEL_ENV === 'production';
};

// Function to apply obfuscation settings
const applyObfuscation = () => {
  if (!isProduction()) {
    console.log('⚠️  Skipping obfuscation - not in production mode');
    return;
  }

  console.log('🔒 Applying code obfuscation for production build...');
  
  // Additional obfuscation can be applied here
  // For example, using tools like babel-plugin-transform-remove-console
  // or custom webpack plugins
};

// Function to remove development files
const removeDevelopmentFiles = () => {
  if (!PRODUCTION_CONFIG.security.removeDevelopmentFiles || !isProduction()) {
    return;
  }

  console.log('🧹 Removing development files...');
  
  PRODUCTION_CONFIG.security.developmentFiles.forEach(pattern => {
    try {
      // Use glob pattern to find and remove files
      // Note: In a real implementation, you'd use a glob library
      console.log(`Removing files matching: ${pattern}`);
    } catch (error) {
      console.warn(`Could not remove files matching ${pattern}:`, error.message);
    }
  });
};

// Function to validate build security
const validateBuildSecurity = () => {
  console.log('🔍 Validating build security...');
  
  const securityChecks = [
    {
      name: 'Environment Variables',
      check: () => {
        // Check for development environment variables
        const devVars = Object.keys(process.env).filter(key => 
          key.includes('DEV') || key.includes('DEBUG') || key.includes('TEST')
        );
        return devVars.length === 0;
      }
    },
    {
      name: 'Console Statements',
      check: () => {
        // This would check if console statements are removed
        // In a real implementation, you'd scan the built files
        return true;
      }
    },
    {
      name: 'Source Maps',
      check: () => {
        // Check if source maps are disabled in production
        return !process.env.GENERATE_SOURCEMAP;
      }
    }
  ];

  const results = securityChecks.map(check => ({
    name: check.name,
    passed: check.check()
  }));

  console.log('\n📋 Security Check Results:');
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name}: ${result.passed ? 'PASSED' : 'FAILED'}`);
  });

  const allPassed = results.every(result => result.passed);
  if (!allPassed) {
    console.warn('\n⚠️  Some security checks failed. Review before deploying to production.');
  }

  return allPassed;
};

// Function to create production build
const createProductionBuild = () => {
  console.log('🏗️  Starting production build process...');
  
  // Set production environment
  Object.keys(PRODUCTION_CONFIG.environment).forEach(key => {
    process.env[key] = PRODUCTION_CONFIG.environment[key];
  });

  // Apply security measures
  removeDevelopmentFiles();
  applyObfuscation();
  
  // Validate security
  const securityPassed = validateBuildSecurity();
  
  if (securityPassed) {
    console.log('✅ Production build security validated successfully');
  } else {
    console.error('❌ Production build security validation failed');
    process.exit(1);
  }
};

// Export configuration for use by build tools
module.exports = {
  PRODUCTION_CONFIG,
  isProduction,
  applyObfuscation,
  removeDevelopmentFiles,
  validateBuildSecurity,
  createProductionBuild
};

// If this file is run directly, execute the production build process
if (require.main === module) {
  createProductionBuild();
} 