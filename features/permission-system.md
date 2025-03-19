# Enhanced Permission System

Version 0.2.49 includes a significantly improved permission system for tool usage, particularly for file operations and command execution.

## Key improvements:

### Permission Context
```javascript
function j$1(I) {
  return [
    ...I.alwaysAllowRules.cliArg || [],
    ...I.alwaysAllowRules.localSettings || []
  ]
}
```

### Tool Permission Validation
```javascript
var jK = async (I, Z, G, W, B) => {
  if (G.getToolPermissionContext().mode === "bypassPermissions")
    return {result: true};
  
  if (G.abortController.signal.aborted)
    throw new cG;
  
  try {
    if (!I.needsPermissions(Z, {writeFileAllowedDirectories: B}))
      return {result: true};
  } catch (V) {
    return {result: false, message: "Error checking permissions"};
  }
  
  let w = j$1(G.getToolPermissionContext());
  
  if (I === T4 && w.includes(T4.name))
    return {result: true};
  
  switch (I) {
    case T4: {
      let {command: V} = yb.parse(Z);
      return await ry2(V, G, w);
    }
    case b7:
    case j7:
    case qZ: {
      if (w.includes(YN(I, Z, null)))
        return {result: true};
      return {
        result: false,
        message: `Claude requested permissions to use ${I.name}, but you haven't granted it yet.`
      };
    }
    default: {
      let V = YN(I, Z, null);
      if (w.includes(V))
        return {result: true};
      return {
        result: false,
        message: `Claude requested permissions to use ${I.name}, but you haven't granted it yet.`
      };
    }
  }
};
```

### Command Permission Handling
```javascript
function YN(I, Z, G) {
  switch (I) {
    case T4:
      if (G) return `${T4.name}(${G}:*)`;
      return `${T4.name}(${T4.renderToolUseMessage(Z)})`;
    case oA:
      try {
        let W = oA.inputSchema.safeParse(Z);
        if (!W.success)
          return `${oA.name}(input:${Z.toString()})`;
        let {url: B} = W.data,
          w = new URL(B).hostname;
        return `${oA.name}(domain:${w})`;
      } catch {
        return `${oA.name}(input:${Z.toString()})`;
      }
    default:
      return I.name;
  }
}
```

### File Path Security
```javascript
function ey2(I, Z, G) {
  let W = $K(I);
  for (let B of W) {
    let [w, ...V] = B.split(" ");
    if (w === "cd" && V.length > 0) {
      let Y = V.join(" ").replace(/^['"]|['"]$/g, ""),
        X = cM5(Y) ? Y : pM5(Z, Y);
      if (!Bi(sy2(G, X), sy2(Z, G)))
        return {
          result: false,
          message: `ERROR: cd to '${X}' was blocked. For security, ${x2} may only change directories to child directories of the original working directory (${G}) for this session.`
        };
    }
  }
  return {result: true};
}
```

These improvements provide much more granular control over tool permissions, especially for file system access and command execution, while maintaining strong security boundaries.