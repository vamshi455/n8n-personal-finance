#!/usr/bin/env node

/**
 * Personal Finance Agent - Project Verification Script
 * Run this to check if your project structure and files are correct
 */

const fs = require('fs');
const path = require('path');

class ProjectVerifier {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.successes = [];
    this.projectRoot = process.cwd();
  }

  log(type, message) {
    const timestamp = new Date().toLocaleTimeString();
    const symbols = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    console.log(`${symbols[type]} [${timestamp}] ${message}`);
  }

  checkFileExists(filePath, required = true) {
    const fullPath = path.join(this.projectRoot, filePath);
    const exists = fs.existsSync(fullPath);
    
    if (exists) {
      this.successes.push(`Found: ${filePath}`);
      this.log('success', `Found: ${filePath}`);
      return true;
    } else {
      const message = `Missing: ${filePath}`;
      if (required) {
        this.errors.push(message);
        this.log('error', message);
      } else {
        this.warnings.push(message);
        this.log('warning', `Optional file missing: ${filePath}`);
      }
      return false;
    }
  }

  checkDirectoryExists(dirPath, required = true) {
    const fullPath = path.join(this.projectRoot, dirPath);
    const exists = fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
    
    if (exists) {
      this.successes.push(`Directory found: ${dirPath}`);
      this.log('success', `Directory found: ${dirPath}`);
      return true;
    } else {
      const message = `Missing directory: ${dirPath}`;
      if (required) {
        this.errors.push(message);
        this.log('error', message);
      } else {
        this.warnings.push(message);
        this.log('warning', `Optional directory missing: ${dirPath}`);
      }
      return false;
    }
  }

  checkPackageJsonContent(packagePath, expectedName, requiredDependencies = []) {
    const fullPath = path.join(this.projectRoot, packagePath);
    
    if (!fs.existsSync(fullPath)) {
      this.log('error', `Cannot check content - ${packagePath} doesn't exist`);
      return false;
    }

    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const packageJson = JSON.parse(content);

      // Check name
      if (packageJson.name === expectedName) {
        this.log('success', `${packagePath} has correct name: ${expectedName}`);
      } else {
        this.log('warning', `${packagePath} name mismatch. Expected: ${expectedName}, Found: ${packageJson.name}`);
      }

      // Check required dependencies
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      const missingDeps = requiredDependencies.filter(dep => !dependencies[dep]);
      
      if (missingDeps.length === 0) {
        this.log('success', `${packagePath} has all required dependencies`);
      } else {
        this.log('warning', `${packagePath} missing dependencies: ${missingDeps.join(', ')}`);
      }

      return true;
    } catch (error) {
      this.log('error', `${packagePath} contains invalid JSON: ${error.message}`);
      return false;
    }
  }

  checkProjectStructure() {
    this.log('info', 'Starting Personal Finance Agent project verification...');
    this.log('info', `Project root: ${this.projectRoot}`);
    console.log('\n📁 CHECKING PROJECT STRUCTURE\n');

    // Check main directories
    const requiredDirs = [
      'frontend',
      'backend', 
      'database',
      'ml-models'
    ];

    const optionalDirs = [
      'docs',
      'frontend/src',
      'frontend/public',
      'backend/api',
      'backend/utils',
      'backend/workflows',
      'database/migrations',
      'database/config',
      'ml-models/training'
    ];

    requiredDirs.forEach(dir => this.checkDirectoryExists(dir, true));
    optionalDirs.forEach(dir => this.checkDirectoryExists(dir, false));
  }

  checkPackageJsonFiles() {
    console.log('\n📦 CHECKING PACKAGE.JSON FILES\n');

    // Root package.json
    if (this.checkFileExists('package.json')) {
      this.checkPackageJsonContent(
        'package.json',
        'personal-finance-agent',
        ['concurrently']
      );
    }

    // Frontend package.json
    if (this.checkFileExists('frontend/package.json')) {
      this.checkPackageJsonContent(
        'frontend/package.json',
        'personal-finance-agent-frontend',
        ['react', 'react-dom', 'typescript', 'framer-motion']
      );
    }

    // Backend package.json
    if (this.checkFileExists('backend/package.json')) {
      this.checkPackageJsonContent(
        'backend/package.json',
        'personal-finance-agent-backend',
        ['express', 'openai', 'pg', 'xlsx', 'cors']
      );
    }

    // ML models package.json
    if (this.checkFileExists('ml-models/package.json', false)) {
      this.checkPackageJsonContent(
        'ml-models/package.json',
        'personal-finance-agent-ml',
        ['@tensorflow/tfjs-node']
      );
    }
  }

  checkConfigFiles() {
    console.log('\n⚙️ CHECKING CONFIGURATION FILES\n');

    const configFiles = [
      { path: '.env.example', required: true },
      { path: 'backend/.env', required: false },
      { path: 'docker-compose.yml', required: false },
      { path: '.gitignore', required: true },
      { path: 'README.md', required: false }
    ];

    configFiles.forEach(({ path, required }) => {
      this.checkFileExists(path, required);
    });
  }

  checkSourceFiles() {
    console.log('\n📝 CHECKING KEY SOURCE FILES\n');

    const sourceFiles = [
      { path: 'backend/server.js', required: true },
      { path: 'frontend/src/App.tsx', required: false },
      { path: 'frontend/src/index.tsx', required: false },
      { path: 'database/config/database.js', required: false },
      { path: 'backend/utils/ai/openai-client.js', required: false }
    ];

    sourceFiles.forEach(({ path, required }) => {
      this.checkFileExists(path, required);
    });
  }

  checkEnvironmentVariables() {
    console.log('\n🔐 CHECKING ENVIRONMENT SETUP\n');

    const envPath = path.join(this.projectRoot, 'backend/.env');
    if (fs.existsSync(envPath)) {
      try {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const requiredVars = [
          'OPENAI_API_KEY',
          'DB_HOST', 
          'DB_NAME',
          'DB_USER',
          'DB_PASSWORD'
        ];

        const missingVars = requiredVars.filter(varName => !envContent.includes(varName));
        
        if (missingVars.length === 0) {
          this.log('success', 'All required environment variables are defined');
        } else {
          this.log('warning', `Missing environment variables: ${missingVars.join(', ')}`);
        }
      } catch (error) {
        this.log('error', `Error reading .env file: ${error.message}`);
      }
    } else {
      this.log('warning', 'No .env file found in backend/ - you\'ll need to create one');
    }
  }

  generateFixSuggestions() {
    console.log('\n🔧 FIX SUGGESTIONS\n');

    if (this.errors.length > 0) {
      console.log('❌ CRITICAL ISSUES TO FIX:');
      this.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
      console.log();
    }

    if (this.warnings.length > 0) {
      console.log('⚠️ WARNINGS (Optional but Recommended):');
      this.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
      console.log();
    }

    // Provide specific fix commands
    if (this.errors.some(e => e.includes('Missing directory'))) {
      console.log('🛠️ To create missing directories:');
      console.log('   mkdir -p frontend backend database ml-models');
      console.log('   mkdir -p backend/{api,utils,workflows} database/{migrations,config}');
      console.log();
    }

    if (this.errors.some(e => e.includes('package.json'))) {
      console.log('🛠️ To create missing package.json files:');
      console.log('   # Root package.json');
      console.log('   npm init -y');
      console.log('   # Backend package.json');
      console.log('   cd backend && npm init -y');
      console.log('   # Frontend package.json');
      console.log('   cd frontend && npm init -y');
      console.log();
    }
  }

  generateInstallScript() {
    console.log('📋 INSTALLATION SCRIPT\n');
    console.log('# Run these commands to set up your project:');
    console.log('');
    console.log('# 1. Install root dependencies');
    console.log('npm install concurrently --save-dev');
    console.log('');
    console.log('# 2. Install backend dependencies');
    console.log('cd backend');
    console.log('npm install express cors dotenv helmet express-rate-limit multer xlsx openai @tensorflow/tfjs-node pg pgvector bcryptjs jsonwebtoken uuid winston joi lodash moment axios');
    console.log('npm install nodemon jest supertest eslint --save-dev');
    console.log('');
    console.log('# 3. Install frontend dependencies (if not using create-react-app)');
    console.log('cd ../frontend');
    console.log('npm install react react-dom typescript framer-motion lucide-react recharts three @react-three/fiber @react-three/drei');
    console.log('');
    console.log('# 4. Install ML dependencies');
    console.log('cd ../ml-models');
    console.log('npm install @tensorflow/tfjs-node lodash moment pg');
    console.log('');
  }

  run() {
    console.log('🚀 PERSONAL FINANCE AGENT - PROJECT VERIFICATION');
    console.log('='.repeat(60));
    console.log();

    this.checkProjectStructure();
    this.checkPackageJsonFiles();
    this.checkConfigFiles();
    this.checkSourceFiles();
    this.checkEnvironmentVariables();

    console.log('\n📊 VERIFICATION SUMMARY\n');
    console.log(`✅ Successes: ${this.successes.length}`);
    console.log(`⚠️ Warnings: ${this.warnings.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);
    console.log();

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('🎉 PERFECT! Your project structure is completely correct!');
      console.log('You can now run: npm run dev');
    } else if (this.errors.length === 0) {
      console.log('👍 GOOD! No critical errors. Some optional items are missing.');
      console.log('Your project should work fine.');
    } else {
      console.log('🔧 NEEDS FIXING! Please address the errors above.');
      this.generateFixSuggestions();
    }

    this.generateInstallScript();

    return this.errors.length === 0;
  }
}

// Run the verification
if (require.main === module) {
  const verifier = new ProjectVerifier();
  const success = verifier.run();
  process.exit(success ? 0 : 1);
}

module.exports = ProjectVerifier;