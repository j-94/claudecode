# WebFetch Tool

The WebFetch tool allows Claude Code to fetch content from URLs that were explicitly shared by the user in their messages. This tool is disabled by default for security reasons.

## Implementation details:

```javascript
{
  name: "WebFetch",
  description: (input) => {
    let {url} = input;
    try {
      return `Claude wants to fetch content from ${new URL(url).hostname}`;
    } catch {
      return "Claude wants to fetch content from this URL";
    }
  },
  userFacingName() { return "Web Fetch" },
  async isEnabled() { return false },  // Disabled by default
  inputSchema: Z1.object({
    url: Z1.string().url(),
    prompt: Z1.string().optional()
  }),
  isReadOnly() { return true },
  needsPermissions() { return true },
  
  async validateInput(input, context) {
    let {url} = input;
    // Security check: only allow URLs explicitly provided by the user
    if (!context.userProvidedUrls.has(url)) {
      return {
        result: false,
        message: `Error: URL "${url}" was not provided by the user. For security, you can only fetch URLs that were explicitly shared by the user in their messages.`,
        meta: { reason: "url_not_provided_by_user" }
      };
    }
    return { result: true };
  },
  
  async *call({url, prompt}, context) {
    // Implementation fetches the URL content and processes it
    // based on the optional prompt parameter
  }
}
```

## Security features:

1. The tool is disabled by default
2. URLs must be explicitly provided by the user in their messages
3. Each URL fetch requires specific permission
4. Domain-level permissions are tracked separately

This tool enables Claude to access and process web content while maintaining strong security controls.