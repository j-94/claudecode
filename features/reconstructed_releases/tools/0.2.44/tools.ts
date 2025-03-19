/**
 * Tool exports for Claude Code 0.2.44
 */

import { ViewTool } from './ViewTool/ViewTool';
import { GlobTool } from './GlobTool/GlobTool';
import { GrepTool } from './GrepTool/GrepTool';
import { WebFetch } from './WebFetch/WebFetch';
import { ThinkTool } from './ThinkTool/ThinkTool';

export const tools = [
  ViewTool,
  GlobTool,
  GrepTool,
  WebFetch,
  ThinkTool
];


export type Tool = typeof ViewTool;
