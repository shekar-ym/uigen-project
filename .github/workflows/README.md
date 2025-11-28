# GitHub Actions Setup for Claude Code Review

This repository includes a GitHub Actions workflow that automatically reviews pull requests using Claude AI.

## Setup Instructions

### 1. Configure Repository Secrets

To enable Claude Code review, you need to add the following secret to your GitHub repository:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secret:

   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: Your Anthropic API key (get one from https://console.anthropic.com/)

### 2. Workflow Features

The `claude-review.yml` workflow will:

- ✅ Trigger on pull requests (opened, updated, reopened)
- ✅ Install dependencies and run tests
- ✅ Run linting checks
- ✅ Build the project
- ✅ Review code changes using Claude AI (if API key is configured)

### 3. Workflow Behavior

- **With API Key**: Claude will review your PR changes and provide feedback
- **Without API Key**: Workflow will run tests/linting but skip Claude review (with a warning)

### 4. Permissions

The workflow has the following permissions:
- `contents: read` - To checkout and read repository code
- `pull-requests: write` - To post review comments on PRs

## Troubleshooting

### Common Issues

1. **Exit code 1**: Usually indicates missing API key or configuration issues
2. **Permission denied**: Check that the workflow has proper permissions
3. **Claude CLI not found**: The workflow automatically installs Claude CLI

### Manual Testing

To test the workflow locally:

```bash
# Install dependencies
npm ci

# Run the same checks as the workflow
npm test
npm run lint
npm run build
```

## Security Notes

- The `ANTHROPIC_API_KEY` is stored securely as a GitHub secret
- The key is only accessible during workflow execution
- Never commit API keys directly to your repository code