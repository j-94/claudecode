/**
 * Tool exports for Claude Code 0.2.45
 */

import { ViewTool } from './ViewTool/ViewTool';
import { GlobTool } from './GlobTool/GlobTool';
import { GrepTool } from './GrepTool/GrepTool';
import { WebFetch } from './WebFetch/WebFetch';
import { ThinkTool } from './ThinkTool/ThinkTool';
import { BatchTool } from './BatchTool/BatchTool';

export const tools = [
  ViewTool,
  GlobTool,
  GrepTool,
  WebFetch,
  ThinkTool,
  BatchTool
];


export type Tool = typeof ViewTool;
