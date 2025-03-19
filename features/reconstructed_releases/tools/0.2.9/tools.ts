/**
 * Tool exports for Claude Code 0.2.9
 */

import { AgentTool } from './AgentTool/AgentTool';
import { FileReadTool } from './FileReadTool/FileReadTool';
import { BashTool } from './BashTool/BashTool';
import { ViewTool } from './ViewTool/ViewTool';
import { GlobTool } from './GlobTool/GlobTool';
import { GrepTool } from './GrepTool/GrepTool';
import { WebFetch } from './WebFetch/WebFetch';
import { ThinkTool } from './ThinkTool/ThinkTool';
import { BatchTool } from './BatchTool/BatchTool';

export const tools = [
  AgentTool,
  FileReadTool,
  BashTool,
  ViewTool,
  GlobTool,
  GrepTool,
  WebFetch,
  ThinkTool,
  BatchTool
];


export type Tool = typeof AgentTool;
