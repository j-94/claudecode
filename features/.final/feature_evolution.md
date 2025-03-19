# Claude Code Feature Evolution

This report shows how Claude Code's features have evolved across versions.

## Feature Presence by Version

| Version | BatchTool (Call) | AgentTool (Task) | WebFetch (Web Fetch) | ThinkTool (Think) |
|---------|---------|---------|---------|---------|
| 0.2.18 | ❌ | ✅ | ❌ | ✅ |
| 0.2.25 | ❌ | ✅ | ❌ | ✅ |
| 0.2.30 | ❌ | ✅ | ❌ | ✅ |
| 0.2.35 | ❌ | ✅ | ✅ | ✅ |
| 0.2.40 | ❌ | ✅ | ✅ | ✅ |
| 0.2.45 | ✅ | ✅ | ✅ | ✅ |
| 0.2.49 | ✅ | ✅ | ✅ | ✅ |
| 0.2.9 | ❌ | ✅ | ❌ | ✅ |

## BatchTool (Call)

- **First appeared**: v0.2.44
- **User-facing name**: Call

### Description

BatchTool (shown to users as "Call") allows executing multiple tool calls in parallel, which significantly improves performance when multiple independent operations need to be performed. It was introduced to speed up workflows by reducing both context usage and latency.

### Key capabilities:

- Execute multiple tools in a single request
- Run operations in parallel when possible
- Return collected results from all invocations
- Support for all available tools
- Each tool respects its own permissions and validation

### Version presence:

- **v0.2.45**: Found with 2 pattern matches
- **v0.2.49**: Found with 2 pattern matches


## AgentTool (Task)

- **First appeared**: v0.2.9
- **User-facing name**: Task

### Version presence:

- **v0.2.18**: Found with 2 pattern matches
- **v0.2.25**: Found with 2 pattern matches
- **v0.2.30**: Found with 2 pattern matches
- **v0.2.35**: Found with 2 pattern matches
- **v0.2.40**: Found with 2 pattern matches
- **v0.2.45**: Found with 2 pattern matches
- **v0.2.49**: Found with 2 pattern matches
- **v0.2.9**: Found with 2 pattern matches


## WebFetch (Web Fetch)

- **First appeared**: v0.2.35
- **User-facing name**: Web Fetch

### Description

WebFetch allows Claude Code to fetch content from specific documentation and code hosting websites. It's limited to trusted domains for security reasons and provides response status, headers, and content.

### Key capabilities:

- Fetch content from specific documentation sites
- Limited to trusted domains for security
- Returns response status, headers, and content
- Support for timeout configuration
- Content type handling for different formats

### Version presence:

- **v0.2.35**: Found with 1 pattern matches
- **v0.2.40**: Found with 1 pattern matches
- **v0.2.45**: Found with 1 pattern matches
- **v0.2.49**: Found with 1 pattern matches


## ThinkTool (Think)

- **First appeared**: v0.2.44
- **User-facing name**: Think

### Description

ThinkTool enables Claude to make a detailed plan by thinking step-by-step about a problem. It was introduced in version 0.2.44 and allows for different intensity levels ('normal', 'hard', 'ultra') for increasingly detailed analysis.

### Key capabilities:

- Makes a detailed plan by thinking step-by-step
- Uses a more deliberate, multi-step reasoning process
- Variable intensity levels for different depth of analysis
- Helps break down complex problems into manageable steps
- Generates a structured approach to solutions

### Version presence:

- **v0.2.18**: Found with 1 pattern matches
- **v0.2.25**: Found with 1 pattern matches
- **v0.2.30**: Found with 1 pattern matches
- **v0.2.35**: Found with 1 pattern matches
- **v0.2.40**: Found with 1 pattern matches
- **v0.2.45**: Found with 2 pattern matches
- **v0.2.49**: Found with 2 pattern matches
- **v0.2.9**: Found with 1 pattern matches

