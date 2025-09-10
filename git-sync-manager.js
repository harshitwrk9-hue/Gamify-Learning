#!/usr/bin/env node

/**
 * Git Synchronization Manager
 * Provides secure connection and synchronization between local repository and GitHub
 * with proper authentication, error handling, and status feedback
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

class GitSyncManager {
    constructor(repoPath = process.cwd()) {
        this.repoPath = repoPath;
        this.logFile = path.join(repoPath, 'git-sync.log');
        this.configFile = path.join(repoPath, '.git-sync-config.json');
        this.config = this.loadConfig();
    }

    /**
     * Load synchronization configuration
     */
    loadConfig() {
        try {
            if (fs.existsSync(this.configFile)) {
                return JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
            }
        } catch (error) {
            this.log('Warning: Could not load config file', 'warn');
        }
        
        return {
            autoSync: false,
            syncInterval: 300000, // 5 minutes
            branches: ['master', 'main'],
            excludeFiles: ['.env', '*.log', 'node_modules/**'],
            authentication: {
                method: 'https', // 'https' or 'ssh'
                tokenConfigured: false
            }
        };
    }

    /**
     * Save configuration
     */
    saveConfig() {
        try {
            fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2));
            this.log('Configuration saved successfully');
        } catch (error) {
            this.log(`Error saving config: ${error.message}`, 'error');
        }
    }

    /**
     * Enhanced logging with timestamps and levels
     */
    log(message, level = 'info') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        
        // Console output with colors
        const colors = {
            info: '\x1b[36m',    // Cyan
            success: '\x1b[32m', // Green
            warn: '\x1b[33m',    // Yellow
            error: '\x1b[31m',   // Red
            reset: '\x1b[0m'     // Reset
        };
        
        console.log(`${colors[level] || colors.info}${logEntry}${colors.reset}`);
        
        // File logging
        try {
            fs.appendFileSync(this.logFile, logEntry + '\n');
        } catch (error) {
            console.error('Failed to write to log file:', error.message);
        }
    }

    /**
     * Execute Git command with error handling
     */
    async executeGitCommand(command, options = {}) {
        return new Promise((resolve, reject) => {
            const { timeout = 30000, cwd = this.repoPath } = options;
            
            this.log(`Executing: git ${command}`);
            
            const child = spawn('git', command.split(' '), {
                cwd,
                stdio: ['pipe', 'pipe', 'pipe']
            });
            
            let stdout = '';
            let stderr = '';
            
            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            
            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            
            const timeoutId = setTimeout(() => {
                child.kill('SIGTERM');
                reject(new Error(`Command timeout after ${timeout}ms`));
            }, timeout);
            
            child.on('close', (code) => {
                clearTimeout(timeoutId);
                
                if (code === 0) {
                    resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
                } else {
                    reject(new Error(`Git command failed with code ${code}: ${stderr || stdout}`));
                }
            });
            
            child.on('error', (error) => {
                clearTimeout(timeoutId);
                reject(error);
            });
        });
    }

    /**
     * Check Git repository status
     */
    async checkRepoStatus() {
        try {
            this.log('Checking repository status...');
            
            // Check if we're in a Git repository
            await this.executeGitCommand('rev-parse --git-dir');
            
            // Get current branch
            const { stdout: branch } = await this.executeGitCommand('rev-parse --abbrev-ref HEAD');
            
            // Check for uncommitted changes
            const { stdout: status } = await this.executeGitCommand('status --porcelain');
            
            // Check remote connection
            const { stdout: remotes } = await this.executeGitCommand('remote -v');
            
            return {
                isGitRepo: true,
                currentBranch: branch,
                hasUncommittedChanges: status.length > 0,
                uncommittedFiles: status.split('\n').filter(line => line.trim()),
                remotes: remotes.split('\n').filter(line => line.trim()),
                status: 'healthy'
            };
        } catch (error) {
            this.log(`Repository status check failed: ${error.message}`, 'error');
            return {
                isGitRepo: false,
                error: error.message,
                status: 'error'
            };
        }
    }

    /**
     * Test remote connection
     */
    async testConnection() {
        try {
            this.log('Testing remote connection...');
            
            // Test fetch without actually fetching
            await this.executeGitCommand('ls-remote --heads origin', { timeout: 15000 });
            
            this.log('Remote connection successful', 'success');
            return { connected: true, status: 'success' };
        } catch (error) {
            this.log(`Connection test failed: ${error.message}`, 'error');
            
            // Check if it's an authentication issue
            if (error.message.includes('Authentication failed') || 
                error.message.includes('Permission denied') ||
                error.message.includes('fatal: could not read Username')) {
                return {
                    connected: false,
                    status: 'auth_error',
                    error: 'Authentication required. Please configure GitHub credentials.',
                    suggestion: 'Run: git config --global credential.helper store'
                };
            }
            
            return {
                connected: false,
                status: 'connection_error',
                error: error.message
            };
        }
    }

    /**
     * Setup authentication
     */
    async setupAuthentication() {
        this.log('Setting up GitHub authentication...');
        
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        return new Promise((resolve) => {
            rl.question('Choose authentication method (1: HTTPS with token, 2: SSH): ', async (choice) => {
                if (choice === '1') {
                    rl.question('Enter your GitHub Personal Access Token: ', async (token) => {
                        try {
                            // Configure credential helper
                            await this.executeGitCommand('config --global credential.helper store');
                            
                            // Update remote URL to include token
                            const { stdout: remoteUrl } = await this.executeGitCommand('config --get remote.origin.url');
                            const httpsUrl = remoteUrl.replace('https://github.com/', `https://${token}@github.com/`);
                            
                            await this.executeGitCommand(`remote set-url origin ${httpsUrl}`);
                            
                            this.config.authentication.method = 'https';
                            this.config.authentication.tokenConfigured = true;
                            this.saveConfig();
                            
                            this.log('HTTPS authentication configured successfully', 'success');
                            rl.close();
                            resolve({ success: true, method: 'https' });
                        } catch (error) {
                            this.log(`Authentication setup failed: ${error.message}`, 'error');
                            rl.close();
                            resolve({ success: false, error: error.message });
                        }
                    });
                } else if (choice === '2') {
                    try {
                        // Check if SSH key exists
                        const sshKeyPath = path.join(require('os').homedir(), '.ssh', 'id_rsa.pub');
                        if (!fs.existsSync(sshKeyPath)) {
                            this.log('SSH key not found. Please generate one first:', 'warn');
                            this.log('Run: ssh-keygen -t rsa -b 4096 -C "your_email@example.com"');
                            rl.close();
                            resolve({ success: false, error: 'SSH key not found' });
                            return;
                        }
                        
                        // Update remote URL to SSH
                        const { stdout: remoteUrl } = await this.executeGitCommand('config --get remote.origin.url');
                        const sshUrl = remoteUrl.replace('https://github.com/', 'git@github.com:');
                        
                        await this.executeGitCommand(`remote set-url origin ${sshUrl}`);
                        
                        this.config.authentication.method = 'ssh';
                        this.saveConfig();
                        
                        this.log('SSH authentication configured successfully', 'success');
                        this.log('Make sure your SSH key is added to your GitHub account');
                        rl.close();
                        resolve({ success: true, method: 'ssh' });
                    } catch (error) {
                        this.log(`SSH setup failed: ${error.message}`, 'error');
                        rl.close();
                        resolve({ success: false, error: error.message });
                    }
                } else {
                    this.log('Invalid choice. Please run the setup again.', 'error');
                    rl.close();
                    resolve({ success: false, error: 'Invalid choice' });
                }
            });
        });
    }

    /**
     * Sync changes to remote repository
     */
    async syncToRemote(commitMessage = null) {
        try {
            this.log('Starting sync to remote repository...');
            
            // Check repository status first
            const status = await this.checkRepoStatus();
            if (!status.isGitRepo) {
                throw new Error('Not a Git repository');
            }
            
            // Test connection
            const connectionTest = await this.testConnection();
            if (!connectionTest.connected) {
                throw new Error(`Connection failed: ${connectionTest.error}`);
            }
            
            // Add all changes
            if (status.hasUncommittedChanges) {
                this.log('Adding uncommitted changes...');
                await this.executeGitCommand('add .');
                
                // Commit changes
                const message = commitMessage || `Auto-sync: ${new Date().toISOString()}`;
                await this.executeGitCommand(`commit -m "${message}"`);
                this.log('Changes committed successfully', 'success');
            } else {
                this.log('No uncommitted changes found');
            }
            
            // Push to remote
            this.log('Pushing to remote repository...');
            await this.executeGitCommand(`push origin ${status.currentBranch}`);
            
            this.log('Sync to remote completed successfully', 'success');
            return { success: true, branch: status.currentBranch };
        } catch (error) {
            this.log(`Sync to remote failed: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    /**
     * Sync changes from remote repository
     */
    async syncFromRemote() {
        try {
            this.log('Starting sync from remote repository...');
            
            // Test connection
            const connectionTest = await this.testConnection();
            if (!connectionTest.connected) {
                throw new Error(`Connection failed: ${connectionTest.error}`);
            }
            
            // Fetch latest changes
            this.log('Fetching latest changes...');
            await this.executeGitCommand('fetch origin');
            
            // Get current branch
            const { stdout: currentBranch } = await this.executeGitCommand('rev-parse --abbrev-ref HEAD');
            
            // Check if there are remote changes
            const { stdout: localCommit } = await this.executeGitCommand('rev-parse HEAD');
            const { stdout: remoteCommit } = await this.executeGitCommand(`rev-parse origin/${currentBranch}`);
            
            if (localCommit === remoteCommit) {
                this.log('Repository is already up to date');
                return { success: true, updated: false, branch: currentBranch };
            }
            
            // Pull changes
            this.log('Pulling remote changes...');
            await this.executeGitCommand(`pull origin ${currentBranch}`);
            
            this.log('Sync from remote completed successfully', 'success');
            return { success: true, updated: true, branch: currentBranch };
        } catch (error) {
            this.log(`Sync from remote failed: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    /**
     * Full bidirectional synchronization
     */
    async fullSync(commitMessage = null) {
        try {
            this.log('Starting full bidirectional synchronization...');
            
            // First, sync from remote to get latest changes
            const pullResult = await this.syncFromRemote();
            if (!pullResult.success) {
                return pullResult;
            }
            
            // Then, sync local changes to remote
            const pushResult = await this.syncToRemote(commitMessage);
            
            this.log('Full synchronization completed', 'success');
            return {
                success: true,
                pulled: pullResult.updated,
                pushed: pushResult.success,
                branch: pullResult.branch
            };
        } catch (error) {
            this.log(`Full sync failed: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    /**
     * Start automatic synchronization
     */
    startAutoSync() {
        if (this.autoSyncInterval) {
            this.log('Auto-sync is already running');
            return;
        }
        
        this.log(`Starting auto-sync with ${this.config.syncInterval / 1000}s interval`);
        this.config.autoSync = true;
        this.saveConfig();
        
        this.autoSyncInterval = setInterval(async () => {
            this.log('Running scheduled sync...');
            await this.fullSync('Auto-sync: Scheduled synchronization');
        }, this.config.syncInterval);
    }

    /**
     * Stop automatic synchronization
     */
    stopAutoSync() {
        if (this.autoSyncInterval) {
            clearInterval(this.autoSyncInterval);
            this.autoSyncInterval = null;
            this.config.autoSync = false;
            this.saveConfig();
            this.log('Auto-sync stopped', 'success');
        }
    }

    /**
     * Get synchronization status
     */
    async getStatus() {
        const repoStatus = await this.checkRepoStatus();
        const connectionTest = await this.testConnection();
        
        return {
            repository: repoStatus,
            connection: connectionTest,
            autoSync: this.config.autoSync,
            authentication: this.config.authentication,
            lastSync: this.getLastSyncTime()
        };
    }

    /**
     * Get last synchronization time from log
     */
    getLastSyncTime() {
        try {
            if (fs.existsSync(this.logFile)) {
                const logs = fs.readFileSync(this.logFile, 'utf8').split('\n');
                const syncLogs = logs.filter(log => log.includes('completed successfully'));
                if (syncLogs.length > 0) {
                    const lastLog = syncLogs[syncLogs.length - 1];
                    const match = lastLog.match(/\[(.*?)\]/);
                    return match ? match[1] : null;
                }
            }
        } catch (error) {
            // Ignore errors
        }
        return null;
    }
}

module.exports = GitSyncManager;

// CLI interface
if (require.main === module) {
    const manager = new GitSyncManager();
    
    const args = process.argv.slice(2);
    const command = args[0];
    
    async function runCLI() {
        switch (command) {
            case 'status':
                const status = await manager.getStatus();
                console.log(JSON.stringify(status, null, 2));
                break;
                
            case 'setup':
                await manager.setupAuthentication();
                break;
                
            case 'sync':
                const message = args[1];
                await manager.fullSync(message);
                break;
                
            case 'push':
                const pushMessage = args[1];
                await manager.syncToRemote(pushMessage);
                break;
                
            case 'pull':
                await manager.syncFromRemote();
                break;
                
            case 'auto-start':
                manager.startAutoSync();
                break;
                
            case 'auto-stop':
                manager.stopAutoSync();
                break;
                
            default:
                console.log('Git Sync Manager - Usage:');
                console.log('  node git-sync-manager.js status     - Show repository status');
                console.log('  node git-sync-manager.js setup      - Setup authentication');
                console.log('  node git-sync-manager.js sync [msg] - Full bidirectional sync');
                console.log('  node git-sync-manager.js push [msg] - Push local changes');
                console.log('  node git-sync-manager.js pull       - Pull remote changes');
                console.log('  node git-sync-manager.js auto-start - Start auto-sync');
                console.log('  node git-sync-manager.js auto-stop  - Stop auto-sync');
        }
    }
    
    runCLI().catch(console.error);
}