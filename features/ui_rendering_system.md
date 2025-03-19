# Claude Code UI Rendering System

This document analyzes the UI rendering architecture in Claude Code, focusing on how it handles terminal UI rendering and component patterns.

## 1. Core UI Architecture

Claude Code uses React with Ink for terminal rendering. This framework enables component-based UI development with JSX syntax for terminal applications:

```typescript
import React from 'react';
import { Box, Text } from 'ink';

// Example component
const ToolResult = ({ result }) => (
  <Box flexDirection="column">
    <Text>Result: {result.output}</Text>
    <Text>Duration: {result.durationMs}ms</Text>
  </Box>
);
```

## 2. Message Rendering System

Claude Code implements a sophisticated message rendering system that handles different message types:

### 2.1 Message Type Components

```typescript
// Different message type components
import {
  AssistantTextMessage,            // Regular text from Claude
  AssistantThinkingMessage,        // Thinking state indicator
  AssistantToolUseMessage,         // Tool execution by Claude 
  UserTextMessage,                 // User input text
  UserToolResultMessage,           // Results from tool execution
  UserToolRejectMessage,           // Tool permission rejection
} from './components/messages';
```

### 2.2 Message Rendering Pattern

The system renders messages based on their type:

```typescript
// Simplified message renderer (reconstructed)
const MessageRenderer = ({ message }) => {
  switch (message.type) {
    case 'assistant':
      if (message.isThinking) {
        return <AssistantThinkingMessage message={message} />;
      } else if (message.content[0]?.type === 'tool_use') {
        return <AssistantToolUseMessage message={message} />;
      } else {
        return <AssistantTextMessage message={message} />;
      }
    
    case 'user':
      if (message.content[0]?.type === 'tool_result') {
        return <UserToolResultMessage message={message} />;
      } else {
        return <UserTextMessage message={message} />;
      }
      
    default:
      return null;
  }
};
```

## 3. Tool UI Components

Tools provide their own UI components for different states:

### 3.1 Tool Use Message

Renders when Claude uses a tool:

```typescript
// BatchTool example
renderToolUseMessage({ description, invocations }, { verbose }) {
  return (
    <Box>
      <Text>
        {description || `Calling ${invocations.length} tools`}
      </Text>
    </Box>
  );
}
```

### 3.2 Tool Result Message

Renders the result of a tool execution:

```typescript
// BatchTool example
renderToolResultMessage({ results, durationMs }) {
  return (
    <Box justifyContent="space-between" width="100%">
      <Box flexDirection="column">
        <Text>  ⎿ Completed {results.length} tool invocations</Text>
      </Box>
      <Cost costUSD={0} durationMs={durationMs} debug={false} />
    </Box>
  );
}
```

### 3.3 Tool Rejection Message

Renders when a tool use is rejected:

```typescript
// BatchTool example
renderToolUseRejectedMessage() {
  return <Text>  ⎿ Batch operation cancelled</Text>;
}
```

## 4. Permission UI System

Claude Code implements a sophisticated permission UI system:

```typescript
// Permission request component
<PermissionRequest
  title={`Allow ${toolName} to ${action}?`}
  description={`This will ${description}`}
  actions={[
    { label: 'Approve', key: 'a', onSelect: onApprove },
    { label: 'Reject', key: 'r', onSelect: onReject },
  ]}
/>
```

### 4.1 Tool-Specific Permission Components

Different tools have specialized permission components:

```typescript
// File system permission component
<FilesystemPermissionRequest
  path={path}
  action="read"
  onApprove={handleApprove}
  onReject={handleReject}
/>

// Bash permission component
<BashPermissionRequest
  command={command}
  onApprove={handleApprove}
  onReject={handleReject}
/>
```

## 5. Progress UI Components

Tools show progress using specialized components:

```typescript
// Thinking indicator
<Box>
  <Text>Thinking</Text>
  <Spinner type="dots" />
</Box>

// Tool execution progress
<Box>
  <Text>Executing {toolName}...</Text>
  <ProgressBar value={progress} />
</Box>
```

## 6. REPL UI Architecture

Claude Code implements a REPL (Read-Eval-Print Loop) interface:

```typescript
// Simplified REPL component (reconstructed)
const REPL = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  
  const handleSubmit = async (text) => {
    // Add user message
    setMessages([...messages, { type: 'user', content: text }]);
    
    // Process with Claude
    const response = await processWithClaude(text);
    
    // Add Claude response
    setMessages([...messages, response]);
  };
  
  return (
    <Box flexDirection="column">
      {/* Render messages */}
      <MessageList messages={messages} />
      
      {/* Input prompt */}
      <PromptInput
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
      />
    </Box>
  );
};
```

## 7. Custom UI Components

Claude Code implements various custom components for specialized rendering:

### 7.1 Code Highlighting

```typescript
// Syntax highlighted code
<HighlightedCode
  language={language}
  code={code}
  theme="terminal"
/>
```

### 7.2 Structured Diffs

```typescript
// Structured code diffs
<StructuredDiff
  oldString={oldString}
  newString={newString}
  context={3}
  wordDiff={true}
/>
```

### 7.3 Cost Display

```typescript
// Cost display component
<Cost
  costUSD={costUSD}
  durationMs={durationMs}
  tokenCount={tokenCount}
  debug={debug}
/>
```

## 8. UI State Management

Claude Code uses React hooks for state management:

```typescript
// Custom hooks for UI state
const useArrowKeyHistory = () => { /* ... */ };
const useTextInput = () => { /* ... */ };
const useSlashCommandTypeahead = () => { /* ... */ };
const usePermissionRequestLogging = () => { /* ... */ };
```

## 9. Terminal Integration

The UI system integrates with the terminal environment:

```typescript
// Terminal size awareness
const useTerminalSize = () => {
  const [size, setSize] = useState({ columns: 80, rows: 24 });
  
  useEffect(() => {
    const handleResize = () => {
      setSize({
        columns: process.stdout.columns || 80,
        rows: process.stdout.rows || 24
      });
    };
    
    process.stdout.on('resize', handleResize);
    handleResize();
    
    return () => {
      process.stdout.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return size;
};
```

## 10. UI Evolution Patterns

Analysis of UI components across versions reveals these patterns:

1. **Consistent Component Structure**: Components maintain consistent structure
2. **Enhanced Accessibility**: Improvements for keyboard navigation and screen readers
3. **Theme Support**: Added theme customization capabilities
4. **Progressive Enhancement**: New UI features added without breaking existing ones
5. **Responsive Design**: UI adapts to different terminal sizes

## 11. Conclusion

Claude Code's UI system represents a sophisticated terminal UI architecture that leverages React and Ink to provide a rich, interactive experience. The component-based design enables consistent rendering across different message types and tools, while the permission UI system ensures user control over potentially sensitive operations.

The evolution of the UI system across versions demonstrates a commitment to improving the user experience while maintaining compatibility with existing components and patterns.