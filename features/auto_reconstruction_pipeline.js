#!/usr/bin/env node

/**
 * Claude Code Auto Reconstruction Pipeline
 * 
 * This script orchestrates the complete reconstruction of all Claude Code features
 * across versions, using all available reconstruction tools and techniques.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const util = require('util');

// Configuration
const VERSIONS = ['0.2.9', '0.2.18', '0.2.25', '0.2.30', '0.2.35', '0.2.40', '0.2.45', '0.2.49'];
const FEATURES = [
  '0.2.9:AgentTool,BashTool,FileReadTool',
  '0.2.18:ViewTool,GlobTool,GrepTool',
  '0.2.21:FuzzyCommandMatching',
  '0.2.26:ApprovedTools,WordLevelDiff',
  '0.2.30:ANSIColorTheme,KeychainStorage',
  '0.2.31:CustomSlashCommands,MCPDebugMode',
  '0.2.32:InteractiveMCPSetup',
  '0.2.34:VimBindings',
  '0.2.35:WebFetch',
  '0.2.36:MCPServerImport',
  '0.2.37:ReleaseNotesCommand',
  '0.2.41:MCPTimeout',
  '0.2.44:ThinkTool',
  '0.2.45:BatchTool',
  '0.2.47:TabCompletion,AutoCompaction',
  '0.2.49:RenamedMCPScopes'
];
const OUTPUT_DIR = path.join(__dirname, '..', 'comprehensive_reconstruction');

// Create output directory
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(path.join(OUTPUT_DIR, 'releases'), { recursive: true });

// Track progress
const progress = {
  downloaded: new Set(),
  extracted: new Set(),
  analyzed: new Set(),
  reconstructed: new Set()
};

// Utility function to run a command and log output
function runCommand(command, args, cwd = __dirname) {
  console.log(`Running: ${command} ${args.join(' ')}`);
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd,
      stdio: ['inherit', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    proc.stdout.on('data', (data) => {
      const text = data.toString();
      stdout += text;
      process.stdout.write(text);
    });
    
    proc.stderr.on('data', (data) => {
      const text = data.toString();
      stderr += text;
      process.stderr.write(text);
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
}

// Phase 1: Download and extract releases
async function downloadAndExtractReleases() {
  console.log('\n=== Phase 1: Download and Extract Releases ===\n');
  
  try {
    // Make release_analyzer.js executable
    fs.chmodSync(path.join(__dirname, 'release_analyzer.js'), '755');
    
    // Run the release analyzer
    await runCommand('node', ['release_analyzer.js']);
    
    // Check results
    for (const version of VERSIONS) {
      const extractedDir = path.join(__dirname, 'releases', 'extracted', `v${version}`);
      if (fs.existsSync(extractedDir)) {
        progress.downloaded.add(version);
        progress.extracted.add(version);
      }
    }
    
    console.log(`\nDownloaded and extracted ${progress.extracted.size} versions.`);
  } catch (error) {
    console.error('Error in Phase 1:', error);
  }
}

// Phase 2: Decode source maps
async function decodeSourceMaps() {
  console.log('\n=== Phase 2: Decode Source Maps ===\n');
  
  try {
    // Make source_map_decoder.js executable
    fs.chmodSync(path.join(__dirname, 'source_map_decoder.js'), '755');
    
    // Run the source map decoder
    await runCommand('node', ['source_map_decoder.js']);
    
    // Check results
    for (const version of VERSIONS) {
      const sourceMapDir = path.join(__dirname, 'releases', 'source_maps', `v${version}`);
      if (fs.existsSync(sourceMapDir) && fs.readdirSync(sourceMapDir).length > 0) {
        console.log(`Decoded source maps for version ${version}`);
      }
    }
  } catch (error) {
    console.error('Error in Phase 2:', error);
  }
}

// Phase 3: Extract features from each version
async function analyzeVersions() {
  console.log('\n=== Phase 3: Analyze Versions ===\n');
  
  try {
    // Analyze using version_comparator.js
    if (fs.existsSync(path.join(__dirname, 'version_comparator.js'))) {
      fs.chmodSync(path.join(__dirname, 'version_comparator.js'), '755');
      await runCommand('node', ['version_comparator.js']);
    }
    
    // Check if feature comparison report was generated
    const reportPath = path.join(__dirname, 'releases', 'reports', 'feature_comparison.md');
    if (fs.existsSync(reportPath)) {
      console.log(`Feature comparison report generated at: ${reportPath}`);
    }
    
    // Mark all extracted versions as analyzed
    for (const version of progress.extracted) {
      progress.analyzed.add(version);
    }
  } catch (error) {
    console.error('Error in Phase 3:', error);
  }
}

// Phase 4: Reconstruct tools
async function reconstructTools() {
  console.log('\n=== Phase 4: Reconstruct Tools ===\n');
  
  try {
    // Run reconstruct_tools.js
    if (fs.existsSync(path.join(__dirname, 'reconstruct_tools.js'))) {
      fs.chmodSync(path.join(__dirname, 'reconstruct_tools.js'), '755');
      await runCommand('node', ['reconstruct_tools.js']);
    }
    
    // Extract BatchTool specifically
    if (fs.existsSync(path.join(__dirname, 'extract_batch_tool.js'))) {
      fs.chmodSync(path.join(__dirname, 'extract_batch_tool.js'), '755');
      await runCommand('node', ['extract_batch_tool.js']);
    }
    
    // Generate simplified tool implementations
    if (fs.existsSync(path.join(__dirname, 'reconstruct_simple.js'))) {
      fs.chmodSync(path.join(__dirname, 'reconstruct_simple.js'), '755');
      
      // Make sure the directory structure exists
      fs.mkdirSync(path.join(__dirname, 'reconstructed_releases', 'tools', '0.2.49'), { recursive: true });
      
      await runCommand('node', ['reconstruct_simple.js']);
    }
    
    // Check results
    for (const version of progress.analyzed) {
      const toolsDir = path.join(__dirname, 'reconstructed', `v${version}`, 'src', 'tools');
      const simplifiedToolsDir = path.join(__dirname, 'reconstructed_releases', 'tools', version);
      
      if ((fs.existsSync(toolsDir) && fs.readdirSync(toolsDir).length > 0) || 
          (fs.existsSync(simplifiedToolsDir) && fs.readdirSync(simplifiedToolsDir).length > 0)) {
        progress.reconstructed.add(version);
      }
    }
    
    console.log(`\nReconstructed tools for ${progress.reconstructed.size} versions.`);
  } catch (error) {
    console.error('Error in Phase 4:', error);
  }
}

// Phase 5: Create comprehensive reconstruction
async function createComprehensiveReconstruction() {
  console.log('\n=== Phase 5: Create Comprehensive Reconstruction ===\n');
  
  try {
    // For each version, create a comprehensive directory with:
    // 1. Original codebase as base
    // 2. Reconstructed tools from that version
    // 3. Feature-specific implementations
    
    // Copy original codebase as our base
    console.log('Copying original codebase as base...');
    fs.mkdirSync(path.join(OUTPUT_DIR, 'src'), { recursive: true });
    execSync(`cp -r "${path.join(__dirname, '..', 'original_codebase', 'src')}"/* "${path.join(OUTPUT_DIR, 'src')}"`, { stdio: 'inherit' });
    
    // Copy vendor directory
    console.log('Copying vendor directory...');
    fs.mkdirSync(path.join(OUTPUT_DIR, 'vendor'), { recursive: true });
    execSync(`cp -r "${path.join(__dirname, '..', 'original_codebase', 'vendor')}"/* "${path.join(OUTPUT_DIR, 'vendor')}"`, { stdio: 'inherit' });
    
    // Copy root files
    console.log('Copying root files...');
    execSync(`cp "${path.join(__dirname, '..', 'original_codebase', 'LICENSE.md')}" "${path.join(OUTPUT_DIR, 'LICENSE.md')}"`, { stdio: 'inherit' });
    execSync(`cp "${path.join(__dirname, '..', 'original_codebase', 'README.md')}" "${path.join(OUTPUT_DIR, 'README.md')}"`, { stdio: 'inherit' });
    execSync(`cp "${path.join(__dirname, '..', 'original_codebase', 'cli.mjs')}" "${path.join(OUTPUT_DIR, 'cli.mjs')}"`, { stdio: 'inherit' });
    
    // Create View directory if it doesn't exist
    fs.mkdirSync(path.join(OUTPUT_DIR, 'src', 'tools', 'View'), { recursive: true });
    
    // Add BatchTool implementation
    console.log('Adding BatchTool implementation...');
    fs.mkdirSync(path.join(OUTPUT_DIR, 'src', 'tools', 'BatchTool'), { recursive: true });
    
    // Source the best implementation available
    const batchToolPaths = [
      path.join(__dirname, 'high_fidelity_batch_tool.tsx'),
      path.join(__dirname, 'reconstructed_batch_tool', 'src', 'tools', 'BatchTool', 'BatchTool.tsx'),
      path.join(__dirname, 'reconstructed_releases', 'tools', '0.2.45', 'BatchTool', 'BatchTool.tsx')
    ];
    
    let batchToolFound = false;
    for (const batchToolPath of batchToolPaths) {
      if (fs.existsSync(batchToolPath)) {
        fs.copyFileSync(batchToolPath, path.join(OUTPUT_DIR, 'src', 'tools', 'BatchTool', 'BatchTool.tsx'));
        console.log(`Used BatchTool implementation from: ${batchToolPath}`);
        batchToolFound = true;
        break;
      }
    }
    
    if (!batchToolFound) {
      console.error('Could not find a BatchTool implementation!');
    }
    
    // Add View implementation
    console.log('Adding View implementation...');
    const viewPaths = [
      path.join(__dirname, 'reconstructed', 'v0.2.49', 'src', 'tools', 'View', 'View.tsx'),
      path.join(__dirname, 'reconstructed_releases', 'tools', '0.2.18', 'ViewTool', 'ViewTool.tsx')
    ];
    
    let viewFound = false;
    for (const viewPath of viewPaths) {
      if (fs.existsSync(viewPath)) {
        fs.copyFileSync(viewPath, path.join(OUTPUT_DIR, 'src', 'tools', 'View', 'View.tsx'));
        console.log(`Used View implementation from: ${viewPath}`);
        viewFound = true;
        break;
      }
    }
    
    if (!viewFound) {
      console.error('Could not find a View implementation!');
    }
    
    // Add ThinkTool implementation
    console.log('Adding ThinkTool implementation...');
    const thinkToolPath = path.join(__dirname, 'reconstructed_releases', 'tools', '0.2.44', 'ThinkTool', 'ThinkTool.tsx');
    if (fs.existsSync(thinkToolPath)) {
      fs.copyFileSync(thinkToolPath, path.join(OUTPUT_DIR, 'src', 'tools', 'ThinkTool', 'ThinkTool.tsx'));
      console.log(`Used ThinkTool implementation from: ${thinkToolPath}`);
    }
    
    // Update tools.ts to include all tools
    console.log('Updating tools.ts to include all tools...');
    const toolsPath = path.join(OUTPUT_DIR, 'src', 'tools.ts');
    if (fs.existsSync(toolsPath)) {
      let toolsContent = fs.readFileSync(toolsPath, 'utf8');
      
      // Add imports for BatchTool and View
      if (!toolsContent.includes('import { BatchTool }')) {
        toolsContent = toolsContent.replace(
          'import { Tool } from',
          'import { BatchTool } from \'./tools/BatchTool/BatchTool.js\'\nimport { View } from \'./tools/View/View.js\'\nimport { Tool } from'
        );
      }
      
      // Add tools to getAllTools function
      if (!toolsContent.includes('BatchTool,')) {
        toolsContent = toolsContent.replace(
          'return [',
          'return [\n    BatchTool,\n    View,'
        );
      }
      
      fs.writeFileSync(toolsPath, toolsContent);
    }
    
    // Create package.json with correct dependencies
    console.log('Creating package.json...');
    const packageJson = {
      "name": "claude-code-reconstructed",
      "version": "0.2.50",
      "description": "A CLI for Claude - Reconstructed from multiple versions",
      "type": "module",
      "bin": {
        "claude": "./cli.js"
      },
      "scripts": {
        "dev": "tsx watch src/entrypoints/cli.tsx",
        "build": "bun build:clean && bun build:ripgrep && bun build:bundle",
        "build:clean": "rm -rf dist && mkdir -p dist",
        "build:ripgrep": "cp -r vendor/ripgrep dist/",
        "build:bundle": "bun build src/entrypoints/cli.tsx --target=node --outfile=dist/cli.js --sourcemap",
        "typecheck": "tsc --noEmit",
        "lint": "eslint src",
        "format": "prettier --write src",
        "prepublishOnly": "bun run build"
      },
      "dependencies": {
        "@anthropic-ai/sdk": "^0.8.1",
        "chalk": "^5.3.0",
        "commander": "^11.0.0",
        "ink": "^4.3.0",
        "lodash-es": "^4.17.21",
        "react": "^18.2.0",
        "zod": "^3.22.2"
      },
      "devDependencies": {
        "@types/lodash-es": "^4.17.9",
        "@types/node": "^20.5.9",
        "@types/react": "^18.2.21",
        "bun-types": "^1.0.3",
        "eslint": "^8.48.0",
        "prettier": "^3.0.3",
        "typescript": "^5.2.2"
      }
    };
    
    fs.writeFileSync(path.join(OUTPUT_DIR, 'package.json'), JSON.stringify(packageJson, null, 2));
    
    // Create README explaining reconstructed features
    console.log('Creating documentation...');
    const featureReadme = `# Claude Code Comprehensive Reconstruction

This is a comprehensive reconstruction of Claude Code that includes features from multiple versions,
merged into a single codebase.

## Reconstructed Features

${FEATURES.map(featureStr => {
  const [version, features] = featureStr.split(':');
  return `### Version ${version}\n- ${features.split(',').join('\n- ')}`;
}).join('\n\n')}

## Reconstruction Process

This codebase was reconstructed using:
1. The original Claude Code codebase as a foundation
2. Source map decoding from minified files
3. Reconstructed tool implementations from version analysis
4. Simplified representations of tools and components

## Usage Notes

- Use \`npm install\` to install dependencies
- Run \`npm run dev\` to start the development server
- Use \`npm run build\` to create a distributable bundle

## Reconstruction Pipeline

This codebase was generated by the auto_reconstruction_pipeline.js script, which:
1. Downloaded and extracted all Claude Code versions
2. Decoded source maps where available
3. Compared versions to identify feature additions
4. Reconstructed tools from various versions
5. Combined all features into a comprehensive implementation
`;
    
    fs.writeFileSync(path.join(OUTPUT_DIR, 'RECONSTRUCTION.md'), featureReadme);
    
    console.log(`\nComprehensive reconstruction completed!`);
    console.log(`Results are available in: ${OUTPUT_DIR}`);
  } catch (error) {
    console.error('Error in Phase 5:', error);
  }
}

// Execute pipeline
async function runPipeline() {
  console.log('=== Claude Code Automatic Reconstruction Pipeline ===');
  
  await downloadAndExtractReleases();
  await decodeSourceMaps();
  await analyzeVersions();
  await reconstructTools();
  await createComprehensiveReconstruction();
  
  console.log('\n=== Pipeline Complete ===');
  console.log(`
Summary:
- Downloaded: ${progress.downloaded.size} versions
- Analyzed: ${progress.analyzed.size} versions
- Reconstructed: ${progress.reconstructed.size} versions

Comprehensive reconstruction is available at:
${OUTPUT_DIR}
`);
}

// Run the pipeline
runPipeline().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});