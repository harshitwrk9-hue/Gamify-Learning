#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function execCommand(command, options = {}) {
    try {
        const result = execSync(command, { 
            encoding: 'utf8', 
            stdio: 'pipe',
            ...options 
        });
        return { success: true, output: result.trim() };
    } catch (error) {
        return { 
            success: false, 
            error: error.message, 
            output: error.stdout ? error.stdout.trim() : ''
        };
    }
}

function checkGitStatus() {
    log('\n🔍 Checking Git Repository Status...', colors.cyan);
    
    // Check if we're in a git repository
    const gitCheck = execCommand('git rev-parse --is-inside-work-tree');
    if (!gitCheck.success) {
        log('❌ Not a Git repository', colors.red);
        return false;
    }
    
    log('✅ Valid Git repository', colors.green);
    
    // Get current branch
    const branchResult = execCommand('git branch --show-current');
    if (branchResult.success) {
        log(`📍 Current branch: ${branchResult.output}`, colors.blue);
    }
    
    // Check for uncommitted changes
    const statusResult = execCommand('git status --porcelain');
    if (statusResult.success) {
        if (statusResult.output) {
            log('📝 Uncommitted changes detected:', colors.yellow);
            const changes = statusResult.output.split('\n');
            changes.forEach(change => {
                if (change.trim()) {
                    log(`   ${change}`, colors.yellow);
                }
            });
        } else {
            log('✅ Working directory clean', colors.green);
        }
    }
    
    return true;
}

function testGitHubConnection() {
    log('\n🌐 Testing GitHub Connection...', colors.cyan);
    
    // Test remote connection
    const remoteTest = execCommand('git ls-remote origin HEAD');
    if (remoteTest.success) {
        log('✅ GitHub connection successful', colors.green);
        const remoteInfo = remoteTest.output.split('\t')[0];
        log(`🔗 Remote HEAD: ${remoteInfo.substring(0, 8)}...`, colors.blue);
        return true;
    } else {
        log('❌ GitHub connection failed', colors.red);
        log(`   Error: ${remoteTest.error}`, colors.red);
        return false;
    }
}

function getRemoteInfo() {
    log('\n📡 Remote Repository Information...', colors.cyan);
    
    const remoteResult = execCommand('git remote -v');
    if (remoteResult.success) {
        const remotes = remoteResult.output.split('\n');
        remotes.forEach(remote => {
            if (remote.trim()) {
                log(`   ${remote}`, colors.blue);
            }
        });
    }
}

function syncWithGitHub(commitMessage = 'Automated sync via sync-test.js') {
    log('\n🔄 Starting GitHub Synchronization...', colors.cyan);
    
    // First, pull any remote changes
    log('📥 Pulling remote changes...', colors.yellow);
    const pullResult = execCommand('git pull origin master');
    if (!pullResult.success) {
        log('⚠️  Pull failed, continuing with push...', colors.yellow);
        log(`   ${pullResult.error}`, colors.yellow);
    } else {
        log('✅ Pull completed successfully', colors.green);
    }
    
    // Check if there are changes to commit
    const statusResult = execCommand('git status --porcelain');
    if (statusResult.success && statusResult.output) {
        log('📝 Staging changes...', colors.yellow);
        
        // Add all changes
        const addResult = execCommand('git add .');
        if (!addResult.success) {
            log('❌ Failed to stage changes', colors.red);
            return false;
        }
        
        log('💾 Committing changes...', colors.yellow);
        const commitResult = execCommand(`git commit -m "${commitMessage}"`);
        if (!commitResult.success) {
            log('❌ Failed to commit changes', colors.red);
            return false;
        }
        
        log('✅ Changes committed successfully', colors.green);
    } else {
        log('ℹ️  No changes to commit', colors.blue);
    }
    
    // Push to remote
    log('📤 Pushing to GitHub...', colors.yellow);
    const pushResult = execCommand('git push origin master');
    if (pushResult.success) {
        log('✅ Push completed successfully', colors.green);
        log('🎉 Synchronization complete!', colors.bright + colors.green);
        return true;
    } else {
        log('❌ Push failed', colors.red);
        log(`   Error: ${pushResult.error}`, colors.red);
        return false;
    }
}

function showHelp() {
    log('\n=== GitHub Sync Test Tool ===', colors.bright + colors.cyan);
    log('Simple tool to test and manage GitHub synchronization\n', colors.blue);
    
    log('Usage:', colors.bright);
    log('  node sync-test.js [command] [message]\n', colors.blue);
    
    log('Commands:', colors.bright);
    log('  status    - Check repository and connection status', colors.blue);
    log('  test      - Test GitHub connection', colors.blue);
    log('  sync      - Full synchronization with GitHub', colors.blue);
    log('  help      - Show this help message', colors.blue);
    
    log('\nExamples:', colors.bright);
    log('  node sync-test.js status', colors.blue);
    log('  node sync-test.js test', colors.blue);
    log('  node sync-test.js sync "Updated security features"', colors.blue);
}

// Main execution
function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'status';
    const message = args[1] || 'Automated sync via sync-test.js';
    
    log('🚀 GitHub Sync Test Tool', colors.bright + colors.cyan);
    log('=' .repeat(50), colors.cyan);
    
    switch (command.toLowerCase()) {
        case 'status':
            checkGitStatus();
            getRemoteInfo();
            testGitHubConnection();
            break;
            
        case 'test':
            if (checkGitStatus()) {
                testGitHubConnection();
            }
            break;
            
        case 'sync':
            if (checkGitStatus() && testGitHubConnection()) {
                syncWithGitHub(message);
            }
            break;
            
        case 'help':
        case '--help':
        case '-h':
            showHelp();
            break;
            
        default:
            log(`❌ Unknown command: ${command}`, colors.red);
            showHelp();
            process.exit(1);
    }
    
    log('\n' + '=' .repeat(50), colors.cyan);
    log('✨ Operation completed', colors.green);
}

// Run the tool
if (require.main === module) {
    main();
}

module.exports = {
    checkGitStatus,
    testGitHubConnection,
    syncWithGitHub,
    getRemoteInfo
};