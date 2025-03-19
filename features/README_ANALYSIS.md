# Claude Code Evolution Analysis

This directory contains tools to analyze the evolution of Claude Code across different releases. The analysis helps track feature development, code changes, and architectural shifts over time.

## Tools

1. **release_analyzer.js** - Downloads and analyzes multiple releases of Claude Code from npm. Extracts source maps if available and generates feature comparison reports.

2. **source_map_decoder.js** - Uses source maps to reconstruct the original TypeScript files, enabling detailed analysis of code structure and implementation.

3. **setup_and_run.sh** - Sets up the environment and runs both tools in sequence.

## Usage

```bash
# Make the setup script executable
chmod +x setup_and_run.sh

# Run the analysis
./setup_and_run.sh
```

## Generated Reports

After running the analysis, the following reports will be available:

- **releases/reports/feature_comparison.md** - Compares features across different versions
- **releases/reconstructed/source_analysis.md** - Analyzes the reconstructed source files
- **releases/reconstructed/original_comparison.md** - Compares the original codebase with reconstructed sources

## Analyzed Versions

The tools analyze the following versions by default:
- 0.2.8
- 0.2.9
- 0.2.18
- 0.2.25
- 0.2.30
- 0.2.35
- 0.2.40
- 0.2.45
- 0.2.49

## Directory Structure

```
releases/
├── extracted/          # Extracted npm packages
├── key_files/          # Important files extracted for comparison
├── reconstructed/      # Reconstructed source files from source maps
├── reference/          # Reference data from original codebase
├── reports/            # Generated comparison reports
└── source_maps/        # Extracted source maps
```

## Notes on Source Maps

Some early versions of Claude Code may include inline source maps that allow reconstruction of the original source code. The `release_analyzer.js` tool automatically extracts these source maps when present.

These source maps were unintentionally included in early versions and later removed by Anthropic. The analysis respects this by only using them for educational purposes to understand the architecture and design patterns.