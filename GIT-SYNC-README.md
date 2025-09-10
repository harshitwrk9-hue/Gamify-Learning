# Git Synchronization Manager

🔄 **Secure connection and synchronization between your local repository and GitHub**

This comprehensive Git synchronization system provides enterprise-grade features for managing your repository with proper authentication, error handling, and status feedback.

## 🚀 Features

### 🔐 Secure Authentication
- **HTTPS with Personal Access Tokens** (Recommended)
- **SSH with SSH Keys** for advanced users
- Automatic credential management
- Secure token storage

### 🔄 Synchronization Capabilities
- **Bidirectional Sync**: Pull remote changes and push local changes
- **Smart Conflict Detection**: Identifies and handles merge conflicts
- **Automatic Staging**: Intelligently stages modified files
- **Custom Commit Messages**: Meaningful commit descriptions

### 🛡️ Error Handling & Monitoring
- **Connection Testing**: Verify GitHub connectivity
- **Comprehensive Logging**: Detailed operation logs with timestamps
- **Status Monitoring**: Real-time repository and connection status
- **Graceful Error Recovery**: Handles network issues and authentication failures

### ⚡ User Experience
- **Cross-Platform Support**: Works on Windows, macOS, and Linux
- **Interactive Setup**: Guided authentication configuration
- **Colorized Output**: Clear visual feedback
- **Progress Indicators**: Real-time operation status

## 📋 Prerequisites

### Required Software
- **Git** (version 2.0 or higher)
- **Node.js** (for JavaScript version)
- **PowerShell** (for Windows PowerShell version)

### GitHub Requirements
- GitHub account with repository access
- Personal Access Token (for HTTPS) or SSH key (for SSH)

## 🛠️ Installation & Setup

### Step 1: Verify Git Installation
```bash
git --version
```

### Step 2: Choose Your Interface

#### Option A: Node.js Version (Cross-Platform)
```bash
# Make executable (Linux/macOS)
chmod +x git-sync-manager.js

# Run setup
node git-sync-manager.js setup
```

#### Option B: PowerShell Version (Windows)
```powershell
# Set execution policy (if needed)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run setup
.\git-sync.ps1 -Action setup
```

### Step 3: Authentication Setup

#### HTTPS with Personal Access Token (Recommended)

1. **Create a Personal Access Token**:
   - Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Select scopes: `repo`, `workflow`
   - Copy the generated token

2. **Configure Authentication**:
   ```bash
   # Node.js version
   node git-sync-manager.js setup
   
   # PowerShell version
   .\git-sync.ps1 -Action setup
   ```

3. **Enter your token** when prompted

#### SSH with SSH Keys (Advanced)

1. **Generate SSH Key** (if you don't have one):
   ```bash
   ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
   ```

2. **Add SSH Key to GitHub**:
   - Copy your public key: `cat ~/.ssh/id_rsa.pub`
   - Go to [GitHub Settings > SSH and GPG keys](https://github.com/settings/keys)
   - Click "New SSH key" and paste your public key

3. **Configure Authentication**:
   ```bash
   # Node.js version
   node git-sync-manager.js setup
   
   # PowerShell version
   .\git-sync.ps1 -Action setup
   ```

4. **Select SSH option** when prompted

## 📖 Usage Guide

### Basic Commands

#### Check Status
```bash
# Node.js version
node git-sync-manager.js status

# PowerShell version
.\git-sync.ps1 -Action status
```

#### Full Synchronization
```bash
# Node.js version
node git-sync-manager.js sync "Your commit message"

# PowerShell version
.\git-sync.ps1 -Action sync -Message "Your commit message"
```

#### Push Local Changes
```bash
# Node.js version
node git-sync-manager.js push "Bug fixes and improvements"

# PowerShell version
.\git-sync.ps1 -Action push -Message "Bug fixes and improvements"
```

#### Pull Remote Changes
```bash
# Node.js version
node git-sync-manager.js pull

# PowerShell version
.\git-sync.ps1 -Action pull
```

#### Test Connection
```bash
# Node.js version
node git-sync-manager.js status

# PowerShell version
.\git-sync.ps1 -Action test
```

### Advanced Features

#### Automatic Synchronization
```bash
# Start auto-sync (Node.js version)
node git-sync-manager.js auto-start

# Stop auto-sync
node git-sync-manager.js auto-stop
```

## 🔧 Configuration

### Configuration File
The system creates a `.git-sync-config.json` file with the following structure:

```json
{
  "autoSync": false,
  "syncInterval": 300000,
  "branches": ["master", "main"],
  "excludeFiles": [".env", "*.log", "node_modules/**"],
  "authentication": {
    "method": "https",
    "tokenConfigured": true
  }
}
```

### Customization Options
- **syncInterval**: Auto-sync interval in milliseconds
- **branches**: Branches to monitor for auto-sync
- **excludeFiles**: Files to exclude from synchronization
- **authentication**: Authentication method and status

## 📊 Status Information

The status command provides comprehensive information:

### Repository Status
- ✅ Git repository validation
- 🌿 Current branch information
- 📝 Uncommitted changes detection
- 📁 Modified files listing

### Connection Status
- 🌐 Remote connectivity test
- 🔐 Authentication verification
- ⚡ Network latency information
- 🔄 Last synchronization time

### Authentication Status
- 🔑 Authentication method (HTTPS/SSH)
- ✅ Credential configuration status
- 🛡️ Security recommendations

## 🚨 Troubleshooting

### Common Issues

#### Authentication Failed
**Problem**: `Authentication failed` or `Permission denied`

**Solutions**:
1. **For HTTPS**: Regenerate Personal Access Token
   ```bash
   node git-sync-manager.js setup
   ```

2. **For SSH**: Check SSH key configuration
   ```bash
   ssh -T git@github.com
   ```

#### Connection Timeout
**Problem**: `Connection timeout` or `Network unreachable`

**Solutions**:
1. Check internet connection
2. Verify GitHub status: [status.github.com](https://status.github.com)
3. Try different network or VPN

#### Merge Conflicts
**Problem**: `Merge conflict` during synchronization

**Solutions**:
1. **Manual Resolution**:
   ```bash
   git status
   git add <resolved-files>
   git commit -m "Resolve merge conflicts"
   ```

2. **Reset to Remote** (⚠️ Loses local changes):
   ```bash
   git fetch origin
   git reset --hard origin/main
   ```

#### Repository Not Found
**Problem**: `Repository not found` or `404 error`

**Solutions**:
1. Verify repository URL:
   ```bash
   git remote -v
   ```

2. Update remote URL:
   ```bash
   git remote set-url origin https://github.com/username/repository.git
   ```

### Log Analysis

Check the `git-sync.log` file for detailed error information:

```bash
# View recent logs
tail -n 50 git-sync.log

# Search for errors
grep "ERROR" git-sync.log
```

## 🔒 Security Best Practices

### Token Security
- ✅ Use Personal Access Tokens instead of passwords
- ✅ Set minimal required scopes (`repo`, `workflow`)
- ✅ Regularly rotate tokens (every 90 days)
- ❌ Never commit tokens to repository
- ❌ Don't share tokens via insecure channels

### SSH Security
- ✅ Use strong SSH keys (RSA 4096-bit or Ed25519)
- ✅ Protect private keys with passphrases
- ✅ Regularly audit SSH keys in GitHub settings
- ❌ Don't reuse SSH keys across multiple services

### Repository Security
- ✅ Review changes before committing
- ✅ Use `.gitignore` for sensitive files
- ✅ Enable branch protection rules
- ✅ Monitor repository access logs

## 📈 Performance Optimization

### Network Optimization
- Use `git config --global core.preloadindex true`
- Configure `git config --global core.fscache true` (Windows)
- Enable `git config --global feature.manyFiles true` for large repos

### Sync Optimization
- Adjust sync interval based on team size
- Use selective file synchronization
- Configure appropriate timeout values

## 🤝 Integration

### IDE Integration
Add custom tasks to your IDE:

#### VS Code (tasks.json)
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Git Sync",
      "type": "shell",
      "command": "node git-sync-manager.js sync",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    }
  ]
}
```

### CI/CD Integration
Use in GitHub Actions:

```yaml
name: Auto Sync
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Run Git Sync
        run: node git-sync-manager.js sync "Automated sync"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 📚 API Reference

### Node.js API

```javascript
const GitSyncManager = require('./git-sync-manager');

const manager = new GitSyncManager();

// Check status
const status = await manager.getStatus();

// Full synchronization
const result = await manager.fullSync('Custom commit message');

// Push changes
const pushResult = await manager.syncToRemote('Bug fixes');

// Pull changes
const pullResult = await manager.syncFromRemote();
```

### PowerShell API

```powershell
# Import functions
. .\git-sync.ps1

# Get status
$status = Get-SyncStatus

# Full sync
$result = Sync-Full "Custom commit message"

# Push only
$pushResult = Sync-ToRemote "Bug fixes"

# Pull only
$pullResult = Sync-FromRemote
```

## 🆘 Support

### Getting Help
1. **Check this documentation** for common solutions
2. **Review log files** for detailed error information
3. **Test connection** to isolate network issues
4. **Verify authentication** setup

### Reporting Issues
When reporting issues, include:
- Operating system and version
- Git version (`git --version`)
- Error messages from logs
- Steps to reproduce the issue
- Repository configuration (without sensitive data)

## 📄 License

This Git Synchronization Manager is provided as-is for educational and development purposes. Use responsibly and in accordance with GitHub's Terms of Service.

---

**🎉 Happy Coding!** Your repository is now equipped with enterprise-grade synchronization capabilities.