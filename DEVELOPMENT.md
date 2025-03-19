# Claude Code Development Guide

This development guide outlines the recommended workflow and branching strategy for contributing to Claude Code.

## Branching Strategy

We use a feature-based branching strategy to keep our work organized and maintainable:

### Main Branches

- **main**: The stable production branch
- **development**: The integration branch for tested features
- **original**: Reference branch with the original codebase state (for forked projects)

### Feature Branches

Create feature branches for all new work. Name branches according to the feature they implement:

```
feature/feature-name
```

Examples:
- `feature/mcp-command`
- `feature/lotus-tool`
- `feature/token-counter`

## Development Workflow

### 1. Starting New Work

Always create a new feature branch from the latest development branch:

```bash
git checkout development
git pull
git checkout -b feature/my-new-feature
```

### 2. Feature Implementation

Keep commits focused and well-documented:

```bash
git add specific-file.js
git commit -m "Descriptive message about the change"
```

Guidelines for commits:
- Use present tense ("Add feature" not "Added feature")
- First line is a summary (max 72 characters)
- Include context in the body if needed
- Reference issues when relevant

### 3. Feature Testing

Test your feature branch thoroughly before integration:

```bash
# Run standard tests
npm test

# Test with specific focus
npm run test:feature

# Manual testing
npm run dev
```

### 4. Integration

Merge features into development after testing:

```bash
git checkout development
git pull
git merge --no-ff feature/my-new-feature
git push
```

Using `--no-ff` preserves the feature branch history.

### 5. Feature Organization

Organize features into logical categories:

**MCP Server Infrastructure**:
- Server management commands
- UI wizards for configuration
- Server scripts and configurations

**Tools and Features**:
- Custom tools like Lotus, DocETL
- Memory management tools
- Self-improvement capabilities
- Usage tracking

**UI Components**:
- Selection components
- Display improvements
- Screen enhancements

**Core Infrastructure**:
- CLI improvements
- Command architecture
- Service integrations
- Configuration systems

**Documentation**:
- User guides
- Developer documentation
- Tool documentation

### 6. Repository Maintenance

Periodically clean up merged feature branches:

```bash
# List merged branches
git branch --merged development

# Delete a merged branch
git branch -d feature/completed-feature
```

Keep reference branches for important milestones:

```bash
git tag v1.0.0-milestone1 development
```

## Release Process

1. Create a release branch from development:
   ```bash
   git checkout -b release/v1.0.0 development
   ```

2. Perform final testing and version bumps on the release branch.

3. Merge to main when ready:
   ```bash
   git checkout main
   git merge --no-ff release/v1.0.0
   git tag v1.0.0
   git push --tags
   ```

4. Merge release changes back to development:
   ```bash
   git checkout development
   git merge --no-ff release/v1.0.0
   ```

## Best Practices

1. **Focused Changes**: Each feature branch should implement a single feature or fix.

2. **Regular Updates**: Keep your feature branch up to date with development:
   ```bash
   git checkout feature/my-feature
   git fetch
   git rebase development
   ```

3. **Clean History**: Consider interactive rebasing before merging to clean up history:
   ```bash
   git rebase -i HEAD~5  # Rebase last 5 commits
   ```

4. **Documentation**: Update documentation alongside code changes.

5. **Code Reviews**: Have someone review your code before merging to development.

6. **Testing**: Write tests for new features and ensure all tests pass before merging.

## Feature Categories

When creating new features, consider which category they belong to:

### Core Improvements
- CLI enhancements
- Command system improvements
- Service integrations
- Configuration systems

### MCP Server Features
- Server management
- Connection handling
- Configuration interfaces
- Server implementations

### Tool Development
- Custom tools for specific tasks
- Extending existing tool capabilities
- Documentation for tools

### UI Enhancements
- New UI components
- Improved user experiences
- Accessibility improvements

### Documentation
- User guides
- Developer documentation
- Tool documentation
- Example workflows

## Resolving Conflicts

When conflicts occur during merges or rebases:

1. Identify the source of conflicts
2. Resolve each file carefully, ensuring functionality is preserved
3. Test thoroughly after resolution
4. Complete the merge/rebase operation

```bash
# During conflict resolution
git status  # See conflicted files
# Edit files to resolve conflicts
git add resolved-file.js
git rebase --continue  # Or git merge --continue
```

## Creating PRs

When creating pull requests:

1. Use a clear title describing the change
2. Include a detailed description of what the change accomplishes
3. Link to any relevant issues
4. Include screenshots or examples when relevant
5. Tag appropriate reviewers

## For New Contributors

1. Fork the repository
2. Clone your fork
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/original/claude-code.git
   ```
4. Create a feature branch for your work
5. Submit a pull request when ready

---

This guide is a living document and will evolve as our development practices improve. Suggestions for improvements are welcome!