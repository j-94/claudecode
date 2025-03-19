# Claude Code Tool Evolution

This document provides a comprehensive overview of the evolution of Claude Code tools across versions.

## Tool Presence by Version

| Version | AgentTool (Task) | FileReadTool (Read) | BashTool (Bash) | ViewTool (View) | GlobTool (Glob) | GrepTool (Grep) | WebFetch (Web Fetch) | ThinkTool (Think) | BatchTool (Call) |
|---------|---------|---------|---------|---------|---------|---------|---------|---------|---------|
| 0.2.9 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 0.2.18 | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| 0.2.35 | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| 0.2.44 | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 0.2.45 | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 0.2.49 | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Tool Details

### AgentTool (Task)

**First appeared**: v0.2.9

**Description**: Launches a new agent that has access to tools for searching and reading files

**Properties**:
- Read-only: Yes
- Requires permissions: No

**Input Schema**:
```
prompt: string - The task for the agent to perform
```

### FileReadTool (Read)

**First appeared**: v0.2.9 (until v0.2.17)

**Description**: Reads files from the local filesystem

**Properties**:
- Read-only: Yes
- Requires permissions: Yes

**Input Schema**:
```
file_path: string - The absolute path to the file to read
offset: number? - The line number to start reading from
limit: number? - The number of lines to read
```

### BashTool (Bash)

**First appeared**: v0.2.9

**Description**: Executes bash commands in a persistent shell session

**Properties**:
- Read-only: No
- Requires permissions: Yes

**Input Schema**:
```
command: string - The command to execute
timeout: number? - Optional timeout in milliseconds (max 600000)
```

### ViewTool (View)

**First appeared**: v0.2.18

**Description**: Reads files from the local filesystem

**Properties**:
- Read-only: Yes
- Requires permissions: Yes

**Input Schema**:
```
file_path: string - The absolute path to the file to read
offset: number? - The line number to start reading from
limit: number? - The number of lines to read
```

### GlobTool (Glob)

**First appeared**: v0.2.18

**Description**: Finds files matching glob patterns

**Properties**:
- Read-only: Yes
- Requires permissions: No

**Input Schema**:
```
pattern: string - The glob pattern to match files against
path: string? - The directory to search in. Defaults to the current directory
```

### GrepTool (Grep)

**First appeared**: v0.2.18

**Description**: Searches file contents using regular expressions

**Properties**:
- Read-only: Yes
- Requires permissions: No

**Input Schema**:
```
pattern: string - The regex pattern to search for in file contents
path: string? - The directory to search in. Defaults to the current directory
include: string? - File pattern to include in the search (e.g. "*.js")
```

### WebFetch (Web Fetch)

**First appeared**: v0.2.35

**Description**: Fetches content from specific documentation and code hosting websites

**Properties**:
- Read-only: Yes
- Requires permissions: Yes

**Input Schema**:
```
url: string - The URL to fetch content from
headers: Record<string, string>? - Optional HTTP headers
timeout: number? - Timeout in milliseconds (default: 10000)
```

**Allowed Domains**:
- github.com
- gitlab.com
- bitbucket.org
- docs.python.org
- doc.rust-lang.org
- developer.mozilla.org
- nodejs.org
- npmjs.com
- pypi.org
- crates.io
- rubygems.org
- pkg.go.dev
- rust-lang.org

### ThinkTool (Think)

**First appeared**: v0.2.44

**Description**: Makes a detailed plan by thinking step-by-step about a problem

**Properties**:
- Read-only: Yes
- Requires permissions: No

**Input Schema**:
```
prompt: string - The thinking prompt to explore
intensity: enum("normal", "hard", "ultra")? - How intensely to think about the problem
```

### BatchTool (Call)

**First appeared**: v0.2.45

**Description**: Executes multiple tool invocations in parallel

**Properties**:
- Read-only: Yes
- Requires permissions: No

**Input Schema**:
```
description: string - A short description of the batch operation
invocations: array - The list of tool invocations to execute
```

## Release Timeline

| Version | Date | CLI Entry | Key Features |
|---------|------|-----------|---------------|
| 0.2.9 | 2023-06 | cli.mjs | AgentTool (Task), FileReadTool (Read), BashTool (Bash) |
| 0.2.18 | 2023-09 | cli.mjs | ViewTool (View), GlobTool (Glob), GrepTool (Grep) |
| 0.2.35 | 2023-12 | cli.js | WebFetch (Web Fetch) |
| 0.2.44 | 2024-01 | cli.js | ThinkTool (Think) |
| 0.2.45 | 2024-02 | cli.js | BatchTool (Call) |
| 0.2.49 | 2024-03 | cli.js |  |
