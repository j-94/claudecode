#!/usr/bin/env node

/**
 * Import Dependency Analyzer
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SRC_DIR = path.join(__dirname, 'src');
const PACKAGE_JSON_PATH = path.join(__dirname, 'package.json');

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
const installedDependencies = Object.keys({
  ...packageJson.dependencies,
  ...packageJson.devDependencies
});

console.log(`Found ${installedDependencies.length} installed dependencies`);

// Function to recursively scan directory for TS/JS files
function scanDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let results = [];

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      results = results.concat(scanDirectory(fullPath));
    } else if (file.name.match(/\.(ts|tsx|js|jsx|mjs)$/)) {
      results.push(fullPath);
    }
  }
  
  return results;
}

// Extract imported packages from a file
function extractImportedPackages(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const imports = new Set();
  
  // Match import statements
  const importRegex = /from\s+['"]([@a-zA-Z][^'"]+)['"]|(require\s*\(\s*['"]([@a-zA-Z][^'"]+)['"]\s*\))/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const fullImport = match[1] || match[3];
    if (!fullImport || fullImport.startsWith('./') || fullImport.startsWith('../')) continue;
    
    const packageName = fullImport.split('/')[0];
    
    if (packageName.startsWith('@')) {
      // For scoped packages, include scope
      const scopedPkg = fullImport.split('/').slice(0, 2).join('/');
      imports.add(scopedPkg);
    } else {
      imports.add(packageName);
    }
  }
  
  return Array.from(imports);
}

// Main execution
const allFiles = scanDirectory(SRC_DIR);
console.log(`Found ${allFiles.length} source files`);

const allImportedPackages = new Set();
const fileImports = {};

// Collect all imports
for (const file of allFiles) {
  try {
    const relativePath = path.relative(SRC_DIR, file);
    const imports = extractImportedPackages(file);
    
    if (imports.length > 0) {
      fileImports[relativePath] = imports;
      imports.forEach(pkg => allImportedPackages.add(pkg));
    }
  } catch (error) {
    console.error(`Error processing ${file}: ${error.message}`);
  }
}

// Check for missing packages
const missingPackages = Array.from(allImportedPackages)
  .filter(pkg => !installedDependencies.includes(pkg))
  .sort();

console.log(`\nFound ${allImportedPackages.size} imported packages, ${missingPackages.length} missing`);

if (missingPackages.length > 0) {
  console.log('\nMissing packages:');
  for (const pkg of missingPackages) {
    const files = Object.entries(fileImports)
      .filter(([_, imports]) => imports.includes(pkg))
      .map(([file]) => file);
    
    console.log(`  ${pkg} (used in ${files.length} files)`);
    files.slice(0, 5).forEach(file => console.log(`    - ${file}`));
    if (files.length > 5) {
      console.log(`    - ... and ${files.length - 5} more`);
    }
  }
  
  // Generate npm install command
  console.log('\nInstall with:');
  console.log(`npm install ${missingPackages.join(' ')} --legacy-peer-deps`);
}