#!/usr/bin/env node

/**
 * Claude Code Source Map Decoder
 * 
 * This script processes sourcemaps from Claude Code releases to reconstruct
 * the original TypeScript files.
 */

const fs = require('fs');
const path = require('path');
const { SourceMapConsumer } = require('source-map');

// Configuration
const SOURCE_MAPS_DIR = path.join(__dirname, 'releases', 'source_maps');
const OUTPUT_DIR = path.join(__dirname, 'releases', 'reconstructed');

// Create output directory
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

/**
 * Processes a source map and reconstructs source files
 */
async function processSourceMap(sourceMapPath, version) {
  console.log(`Processing source map for version ${version}...`);
  
  const versionOutputDir = path.join(OUTPUT_DIR, `v${version}`);
  fs.mkdirSync(versionOutputDir, { recursive: true });
  
  try {
    const sourceMapContent = fs.readFileSync(sourceMapPath, 'utf8');
    const sourceMap = JSON.parse(sourceMapContent);
    
    // Create source map consumer
    const consumer = await new SourceMapConsumer(sourceMap);
    
    // Extract information about sources
    console.log(`Found ${consumer.sources.length} source files in source map`);
    
    // Extract each source file
    let extractedFiles = 0;
    consumer.sources.forEach(sourceFile => {
      // Skip null or browser sources
      if (!sourceFile || sourceFile.startsWith('browser-')) {
        return;
      }
      
      // Get the content of the source file
      const content = consumer.sourceContentFor(sourceFile);
      if (!content) {
        return;
      }
      
      // Create the output file path
      const outputFilePath = path.join(versionOutputDir, sourceFile);
      
      // Create directory if needed
      fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
      
      // Write the source file
      fs.writeFileSync(outputFilePath, content);
      extractedFiles++;
    });
    
    console.log(`Extracted ${extractedFiles} source files to ${versionOutputDir}`);
    
    // Generate index file of extracted files
    const indexFilePath = path.join(versionOutputDir, '_index.txt');
    const fileList = consumer.sources
      .filter(sourceFile => sourceFile && !sourceFile.startsWith('browser-'))
      .sort()
      .join('\n');
    fs.writeFileSync(indexFilePath, fileList);
    
    consumer.destroy();
    return {
      totalFiles: consumer.sources.length,
      extractedFiles
    };
  } catch (error) {
    console.error(`  Error processing source map for version ${version}:`, error.message);
    return null;
  }
}

/**
 * Analyzes reconstructed source files for features
 */
function analyzeSourceFiles(versionDir, version) {
  console.log(`Analyzing reconstructed source files for version ${version}...`);
  
  const analysisReport = {
    version,
    toolCount: 0,
    commandCount: 0,
    tools: [],
    commands: [],
    components: 0,
    utils: 0,
  };
  
  // Check for the tools directory
  const toolsDir = path.join(versionDir, 'src', 'tools');
  if (fs.existsSync(toolsDir)) {
    // Count tool directories
    const toolDirs = fs.readdirSync(toolsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    analysisReport.toolCount = toolDirs.length;
    analysisReport.tools = toolDirs;
  }
  
  // Check for commands
  const commandsDir = path.join(versionDir, 'src', 'commands');
  if (fs.existsSync(commandsDir)) {
    // Count command files
    const commandFiles = fs.readdirSync(commandsDir)
      .filter(file => file.endsWith('.ts') || file.endsWith('.tsx'))
      .map(file => path.basename(file, path.extname(file)));
    
    analysisReport.commandCount = commandFiles.length;
    analysisReport.commands = commandFiles;
  }
  
  // Count components
  const componentsDir = path.join(versionDir, 'src', 'components');
  if (fs.existsSync(componentsDir)) {
    const countComponentFiles = (dir) => {
      let count = 0;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          count += countComponentFiles(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
          count++;
        }
      }
      
      return count;
    };
    
    analysisReport.components = countComponentFiles(componentsDir);
  }
  
  // Count utils
  const utilsDir = path.join(versionDir, 'src', 'utils');
  if (fs.existsSync(utilsDir)) {
    const countUtilFiles = (dir) => {
      let count = 0;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          count += countUtilFiles(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
          count++;
        }
      }
      
      return count;
    };
    
    analysisReport.utils = countUtilFiles(utilsDir);
  }
  
  return analysisReport;
}

/**
 * Generates a comparison report of reconstructed source files
 */
function generateSourceAnalysisReport(analysisResults) {
  console.log(`Generating source analysis report...`);
  
  const reportPath = path.join(OUTPUT_DIR, 'source_analysis.md');
  
  let report = `# Claude Code Source Analysis\n\n`;
  report += `This report analyzes the reconstructed source files from Claude Code versions.\n\n`;
  
  // Create version comparison table
  report += `## Version Comparison\n\n`;
  report += `| Version | Tools | Commands | Components | Utilities |\n`;
  report += `|---------|-------|----------|------------|----------|\n`;
  
  for (const analysis of analysisResults) {
    report += `| ${analysis.version} | ${analysis.toolCount} | ${analysis.commandCount} | ${analysis.components} | ${analysis.utils} |\n`;
  }
  
  // Tool evolution table
  report += `\n## Tool Evolution\n\n`;
  
  // Get all unique tools across all versions
  const allTools = new Set();
  for (const analysis of analysisResults) {
    analysis.tools.forEach(tool => allTools.add(tool));
  }
  
  // Create tool presence table
  report += `| Tool | ${analysisResults.map(a => a.version).join(' | ')} |\n`;
  report += `|------|${analysisResults.map(() => '---').join('|')}|\n`;
  
  allTools.forEach(tool => {
    report += `| ${tool} | `;
    analysisResults.forEach((analysis, index) => {
      const hasFeature = analysis.tools.includes(tool);
      report += hasFeature ? '✅' : '❌';
      report += index < analysisResults.length - 1 ? ' | ' : '';
    });
    report += ` |\n`;
  });
  
  // Command evolution table
  report += `\n## Command Evolution\n\n`;
  
  // Get all unique commands across all versions
  const allCommands = new Set();
  for (const analysis of analysisResults) {
    analysis.commands.forEach(command => allCommands.add(command));
  }
  
  // Create command presence table
  report += `| Command | ${analysisResults.map(a => a.version).join(' | ')} |\n`;
  report += `|---------|${analysisResults.map(() => '---').join('|')}|\n`;
  
  allCommands.forEach(command => {
    report += `| ${command} | `;
    analysisResults.forEach((analysis, index) => {
      const hasCommand = analysis.commands.includes(command);
      report += hasCommand ? '✅' : '❌';
      report += index < analysisResults.length - 1 ? ' | ' : '';
    });
    report += ` |\n`;
  });
  
  fs.writeFileSync(reportPath, report);
  console.log(`Report saved to ${reportPath}`);
}

/**
 * Extract key files from reconstructed sources for comparison
 */
function extractKeyFiles(analysisResults) {
  console.log(`Extracting key files for comparison...`);
  
  const keyFilesDir = path.join(OUTPUT_DIR, 'key_files');
  fs.mkdirSync(keyFilesDir, { recursive: true });
  
  // List of important files to extract for comparison
  const keyFiles = [
    'src/tools.ts',
    'src/Tool.ts',
    'src/tools/BashTool/BashTool.tsx',
    'src/tools/FileReadTool/FileReadTool.tsx',
    'src/tools/FileEditTool/FileEditTool.tsx',
    'src/utils/PersistentShell.ts',
    'src/entrypoints/cli.tsx',
  ];
  
  // For each version with reconstructed sources
  for (const analysis of analysisResults) {
    const versionDir = path.join(OUTPUT_DIR, `v${analysis.version}`);
    const versionKeyFilesDir = path.join(keyFilesDir, `v${analysis.version}`);
    fs.mkdirSync(versionKeyFilesDir, { recursive: true });
    
    // Copy each key file if it exists
    for (const keyFile of keyFiles) {
      const sourcePath = path.join(versionDir, keyFile);
      const destPath = path.join(versionKeyFilesDir, path.basename(keyFile));
      
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied ${keyFile} for version ${analysis.version}`);
      }
    }
  }
}

/**
 * Compare tools between the original codebase and reconstructed sources
 */
function compareWithOriginal(analysisResults) {
  console.log(`Comparing reconstructed sources with original codebase...`);
  
  const originalToolsDir = path.join(__dirname, '..', 'original_codebase', 'src', 'tools');
  if (!fs.existsSync(originalToolsDir)) {
    console.log(`Original codebase not found at ${originalToolsDir}`);
    return;
  }
  
  // Get original tools
  const originalTools = fs.readdirSync(originalToolsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  const reportPath = path.join(OUTPUT_DIR, 'original_comparison.md');
  
  let report = `# Comparison with Original Codebase\n\n`;
  report += `This report compares the reconstructed source files with the original codebase.\n\n`;
  
  report += `## Tool Comparison\n\n`;
  report += `| Tool | Original | ${analysisResults.map(a => `v${a.version}`).join(' | ')} |\n`;
  report += `|------|----------|${analysisResults.map(() => '---').join('|')}|\n`;
  
  // Create a set of all tools across original and reconstructed versions
  const allTools = new Set([...originalTools]);
  for (const analysis of analysisResults) {
    analysis.tools.forEach(tool => allTools.add(tool));
  }
  
  // Create tool presence table
  allTools.forEach(tool => {
    report += `| ${tool} | `;
    // Original codebase
    report += originalTools.includes(tool) ? '✅' : '❌';
    report += ' | ';
    
    // Each reconstructed version
    analysisResults.forEach((analysis, index) => {
      const hasFeature = analysis.tools.includes(tool);
      report += hasFeature ? '✅' : '❌';
      report += index < analysisResults.length - 1 ? ' | ' : '';
    });
    report += ` |\n`;
  });
  
  fs.writeFileSync(reportPath, report);
  console.log(`Original comparison report saved to ${reportPath}`);
}

/**
 * Main execution function
 */
async function main() {
  console.log('Claude Code Source Map Decoder');
  console.log('=============================');
  
  // Check for source maps
  const sourceMaps = [];
  if (fs.existsSync(SOURCE_MAPS_DIR)) {
    const versionDirs = fs.readdirSync(SOURCE_MAPS_DIR);
    
    for (const versionDir of versionDirs) {
      if (!versionDir.startsWith('v')) continue;
      
      const version = versionDir.substring(1); // Remove 'v' prefix
      const sourceMapPath = path.join(SOURCE_MAPS_DIR, versionDir, 'sourcemap.json');
      
      if (fs.existsSync(sourceMapPath)) {
        sourceMaps.push({ version, path: sourceMapPath });
      }
    }
  }
  
  if (sourceMaps.length === 0) {
    console.log('No source maps found. Run release_analyzer.js first.');
    return;
  }
  
  console.log(`Found ${sourceMaps.length} source maps to process.`);
  
  // Process each source map
  const analysisResults = [];
  for (const sourceMap of sourceMaps) {
    const result = await processSourceMap(sourceMap.path, sourceMap.version);
    
    if (result) {
      const versionDir = path.join(OUTPUT_DIR, `v${sourceMap.version}`);
      const analysis = analyzeSourceFiles(versionDir, sourceMap.version);
      if (analysis) {
        analysisResults.push(analysis);
      }
    }
  }
  
  if (analysisResults.length > 0) {
    // Generate analysis report
    generateSourceAnalysisReport(analysisResults);
    
    // Extract key files
    extractKeyFiles(analysisResults);
    
    // Compare with original
    compareWithOriginal(analysisResults);
  }
  
  console.log('\nProcessing complete!');
}

// Check if source-map package is installed
try {
  require.resolve('source-map');
} catch (e) {
  console.error('The "source-map" package is required. Please install it using:');
  console.error('npm install source-map');
  process.exit(1);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});