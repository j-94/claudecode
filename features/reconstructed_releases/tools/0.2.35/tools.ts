/**
 * Tool exports for Claude Code 0.2.35
 */

import { ViewTool } from './ViewTool/ViewTool';
import { GlobTool } from './GlobTool/GlobTool';
import { GrepTool } from './GrepTool/GrepTool';
import { WebFetch } from './WebFetch/WebFetch';

export const tools = [
  ViewTool,
  GlobTool,
  GrepTool,
  WebFetch
];


export type Tool = typeof ViewTool;
