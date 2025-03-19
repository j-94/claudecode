import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

// Original working directory when the process started
let originalCwd = process.cwd();

// Current working directory (can be changed)
let currentCwd = process.cwd();

/**
 * Get the original working directory
 */
export function getOriginalCwd(): string {
  return originalCwd;
}

/**
 * Get the current working directory
 */
export function getCwd(): string {
  return currentCwd;
}

/**
 * Set the current working directory
 */
export function setCwd(dir: string): void {
  currentCwd = dir;
}

/**
 * Check if a path is a directory
 */
export async function isDirectory(dir: string): Promise<boolean> {
  try {
    const stats = await fs.promises.stat(dir);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
}

/**
 * Check if a path is a file
 */
export async function isFile(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.promises.stat(filePath);
    return stats.isFile();
  } catch (error) {
    return false;
  }
}

/**
 * Check if a path exists
 */
export async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Resolve a path relative to the current working directory
 */
export function resolvePath(relativePath: string): string {
  if (path.isAbsolute(relativePath)) {
    return relativePath;
  }
  return path.resolve(getCwd(), relativePath);
}

/**
 * Check if a path is inside another path
 */
export function isInDirectory(targetPath: string, basePath: string): boolean {
  const relativePath = path.relative(basePath, targetPath);
  return !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
}

/**
 * Read a file with line numbers
 */
export async function readFileWithLineNumbers(
  filePath: string,
  offset: number = 0,
  limit: number = 2000
): Promise<{ content: string; lineCount: number; truncated: boolean }> {
  const content = await fs.promises.readFile(filePath, 'utf8');
  const lines = content.split('\n');
  const totalLines = lines.length;
  
  // Apply offset and limit
  const startLine = Math.max(0, offset);
  const endLine = Math.min(totalLines, startLine + limit);
  
  // Format with line numbers
  const numberedLines = lines
    .slice(startLine, endLine)
    .map((line, index) => `${(startLine + index + 1).toString().padStart(6)}  ${line}`);
  
  // Check if truncated
  const truncated = totalLines > endLine;
  
  return {
    content: numberedLines.join('\n'),
    lineCount: endLine - startLine,
    truncated
  };
}

/**
 * Check if a file path requires read permission
 */
export function needsReadPermission(filePath: string): boolean {
  const sensitiveDirs = [
    '/etc',
    '/usr',
    '/var',
    '/private',
    '/Library',
    '/System'
  ];
  
  return sensitiveDirs.some(dir => filePath.startsWith(dir));
}

/**
 * Check if a file path requires write permission
 */
export function needsWritePermission(filePath: string): boolean {
  const sensitiveDirs = [
    '/etc',
    '/usr',
    '/var',
    '/private',
    '/Library',
    '/System',
    '/bin',
    '/sbin'
  ];
  
  return sensitiveDirs.some(dir => filePath.startsWith(dir));
}

/**
 * Check if we have read permission for a path
 */
export function hasReadPermission(filePath: string): boolean {
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if we have write permission for a path
 */
export function hasWritePermission(filePath: string): boolean {
  try {
    fs.accessSync(filePath, fs.constants.W_OK);
    return true;
  } catch (error) {
    return false;
  }
}
