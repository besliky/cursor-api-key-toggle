#!/usr/bin/env node

/**
 * Build script for Cursor API Key Toggle extension
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔨 Building Cursor API Key Toggle extension...\n');

try {
    // Step 1: Install dependencies if needed
    if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
        console.log('📦 Installing dependencies...');
        execSync('npm install', { stdio: 'inherit' });
    }

    // Step 2: Compile TypeScript
    console.log('🔧 Compiling TypeScript...');
    execSync('npm run compile', { stdio: 'inherit' });

    // Step 3: Check if vsce is installed
    try {
        execSync('npx vsce --version', { stdio: 'pipe' });
    } catch (e) {
        console.log('📦 Installing vsce...');
        execSync('npm install -D @vscode/vsce', { stdio: 'inherit' });
    }

    // Step 4: Package the extension
    console.log('📦 Creating .vsix package...');
    execSync('npx vsce package', { stdio: 'inherit' });

    console.log('\n✅ Build completed successfully!');
    console.log('\n📁 To install in Cursor IDE:');
    console.log('   1. Open Cursor');
    console.log('   2. Go to Extensions → Install from VSIX');
    console.log('   3. Select the .vsix file');

} catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
}
