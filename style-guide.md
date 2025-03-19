# Claude Code CLI Style Guide

## Typography

- **Primary Font**: Monospace terminal font
- **Headings**: Bold, uppercase for section headers
- **Code Blocks**: Syntax highlighted with cli-highlight
- **Links**: Underlined with accent color

## Color Palette

- **Primary**: Anthropic Purple (#5436DA)
- **Secondary**: Light Gray (#C8C8C8)
- **Background**: Terminal default or dark theme (#1E1E1E)
- **Text**: White (#FFFFFF) for dark theme, Dark Gray (#333333) for light theme
- **Accent**: Teal (#2BC4BF)
- **Error**: Red (#FF3B30)
- **Success**: Green (#34C759)
- **Warning**: Amber (#FFCC00)

## Components

### Messages
- User messages: Right-aligned, secondary color background
- Assistant messages: Left-aligned, primary color indicator
- Tool usage: Indented with symbol prefix
- Error messages: Error color with warning symbol

### Input Fields
- Prompt: Full width with `>` prefix
- Command: Prefixed with `/`
- Tool inputs: Indented under tool name

### Navigation
- Use arrow symbols (→, ←, ↑, ↓) for navigation hints
- Show cursor position with underline or highlight
- Progress indicators use animated spinners

### Layout
- Maintain 2-space indentation for nested content
- Keep line length under terminal width (auto-wrap)
- Group related information with borders or background
- Use whitespace to separate logical sections

## Interaction Patterns

### Keyboard Shortcuts
- Tab: Autocomplete
- Up/Down: Navigate history
- Ctrl+C: Interrupt/cancel
- Ctrl+D: Exit
- Shift+Enter: Submit without executing

### Response States
- Loading: Animated spinner or dots
- Thinking: Ellipsis animation
- Error: Red text with descriptive message
- Success: Green checkmark with confirmation

## Voice & Tone

- **Clear**: Precise, direct language
- **Helpful**: Suggest next steps and alternatives
- **Technical**: Use proper programming terminology
- **Concise**: Minimize unnecessary words
- **Friendly**: Conversational but professional

## File & Code Examples

```javascript
// Good example
function calculateSum(numbers) {
  return numbers.reduce((sum, num) => sum + num, 0);
}

// Instead of
function calculateSum(numbers) {
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) {
    sum = sum + numbers[i];
  }
  return sum;
}
```

## Terminology

- **Tool**: A specialized function (BashTool, FileEditTool, etc.)
- **Command**: A slash command like `/help`
- **Session**: A conversation instance
- **Context**: The information Claude has about your codebase
- **REPL**: The main interactive interface