<#
.SYNOPSIS
    Git Synchronization Manager for Windows
    Provides secure connection and synchronization between local repository and GitHub

.DESCRIPTION
    This PowerShell script provides a comprehensive Git synchronization system with:
    - Secure authentication setup (HTTPS tokens or SSH keys)
    - Bidirectional synchronization with error handling
    - Status monitoring and feedback
    - Automatic synchronization capabilities
    - Connection testing and troubleshooting

.PARAMETER Action
    The action to perform: status, setup, sync, push, pull, auto-start, auto-stop, test

.PARAMETER Message
    Commit message for sync operations

.EXAMPLE
    .\git-sync.ps1 -Action status
    .\git-sync.ps1 -Action setup
    .\git-sync.ps1 -Action sync -Message "Updated security features"
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("status", "setup", "sync", "push", "pull", "auto-start", "auto-stop", "test", "help")]
    [string]$Action = "help",
    
    [Parameter(Mandatory=$false)]
    [string]$Message = ""
)

# Configuration
$script:LogFile = Join-Path $PWD "git-sync.log"
$script:ConfigFile = Join-Path $PWD ".git-sync-config.json"
$script:DefaultConfig = @{
    autoSync = $false
    syncInterval = 300  # 5 minutes
    branches = @("master", "main")
    excludeFiles = @(".env", "*.log", "node_modules/**")
    authentication = @{
        method = "https"
        tokenConfigured = $false
    }
}

# Color codes for output
$Colors = @{
    Info = "Cyan"
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Header = "Magenta"
}

# Logging function
function Write-Log {
    param(
        [string]$Message,
        [ValidateSet("Info", "Success", "Warning", "Error", "Header")]
        [string]$Level = "Info"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    # Console output with colors
    Write-Host $logEntry -ForegroundColor $Colors[$Level]
    
    # File logging
    try {
        Add-Content -Path $script:LogFile -Value $logEntry -ErrorAction SilentlyContinue
    } catch {
        Write-Warning "Failed to write to log file: $($_.Exception.Message)"
    }
}

# Load configuration
function Get-SyncConfig {
    try {
        if (Test-Path $script:ConfigFile) {
            $config = Get-Content $script:ConfigFile | ConvertFrom-Json
            return $config
        }
    } catch {
        Write-Log "Warning: Could not load config file" "Warning"
    }
    
    return $script:DefaultConfig
}

# Save configuration
function Set-SyncConfig {
    param([hashtable]$Config)
    
    try {
        $Config | ConvertTo-Json -Depth 3 | Set-Content $script:ConfigFile
        Write-Log "Configuration saved successfully" "Success"
    } catch {
        Write-Log "Error saving config: $($_.Exception.Message)" "Error"
    }
}

# Execute Git command with error handling
function Invoke-GitCommand {
    param(
        [string]$Command,
        [int]$TimeoutSeconds = 30
    )
    
    Write-Log "Executing: git $Command"
    
    try {
        $process = Start-Process -FilePath "git" -ArgumentList $Command.Split(' ') -NoNewWindow -PassThru -RedirectStandardOutput "temp_stdout.txt" -RedirectStandardError "temp_stderr.txt" -Wait
        
        $stdout = if (Test-Path "temp_stdout.txt") { Get-Content "temp_stdout.txt" -Raw } else { "" }
        $stderr = if (Test-Path "temp_stderr.txt") { Get-Content "temp_stderr.txt" -Raw } else { "" }
        
        # Clean up temp files
        Remove-Item "temp_stdout.txt", "temp_stderr.txt" -ErrorAction SilentlyContinue
        
        if ($process.ExitCode -eq 0) {
            return @{
                Success = $true
                Output = $stdout.Trim()
                Error = $stderr.Trim()
            }
        } else {
            throw "Git command failed with exit code $($process.ExitCode): $stderr"
        }
    } catch {
        Write-Log "Git command failed: $($_.Exception.Message)" "Error"
        return @{
            Success = $false
            Output = ""
            Error = $_.Exception.Message
        }
    }
}

# Check repository status
function Get-RepoStatus {
    Write-Log "Checking repository status..." "Info"
    
    try {
        # Check if we're in a Git repository
        $gitDirResult = Invoke-GitCommand "rev-parse --git-dir"
        if (-not $gitDirResult.Success) {
            return @{
                IsGitRepo = $false
                Error = "Not a Git repository"
                Status = "error"
            }
        }
        
        # Get current branch
        $branchResult = Invoke-GitCommand "rev-parse --abbrev-ref HEAD"
        $currentBranch = if ($branchResult.Success) { $branchResult.Output } else { "unknown" }
        
        # Check for uncommitted changes
        $statusResult = Invoke-GitCommand "status --porcelain"
        $hasChanges = $statusResult.Success -and $statusResult.Output.Length -gt 0
        $uncommittedFiles = if ($hasChanges) { $statusResult.Output -split "`n" | Where-Object { $_.Trim() } } else { @() }
        
        # Check remote configuration
        $remoteResult = Invoke-GitCommand "remote -v"
        $remotes = if ($remoteResult.Success) { $remoteResult.Output -split "`n" | Where-Object { $_.Trim() } } else { @() }
        
        return @{
            IsGitRepo = $true
            CurrentBranch = $currentBranch
            HasUncommittedChanges = $hasChanges
            UncommittedFiles = $uncommittedFiles
            Remotes = $remotes
            Status = "healthy"
        }
    } catch {
        Write-Log "Repository status check failed: $($_.Exception.Message)" "Error"
        return @{
            IsGitRepo = $false
            Error = $_.Exception.Message
            Status = "error"
        }
    }
}

# Test remote connection
function Test-RemoteConnection {
    Write-Log "Testing remote connection..." "Info"
    
    try {
        $result = Invoke-GitCommand "ls-remote --heads origin"
        
        if ($result.Success) {
            Write-Log "Remote connection successful" "Success"
            return @{
                Connected = $true
                Status = "success"
            }
        } else {
            $errorMsg = $result.Error
            
            # Check for authentication issues
            if ($errorMsg -match "Authentication failed|Permission denied|could not read Username") {
                return @{
                    Connected = $false
                    Status = "auth_error"
                    Error = "Authentication required. Please configure GitHub credentials."
                    Suggestion = "Run setup to configure authentication"
                }
            }
            
            return @{
                Connected = $false
                Status = "connection_error"
                Error = $errorMsg
            }
        }
    } catch {
        Write-Log "Connection test failed: $($_.Exception.Message)" "Error"
        return @{
            Connected = $false
            Status = "connection_error"
            Error = $_.Exception.Message
        }
    }
}

# Setup authentication
function Set-GitAuthentication {
    Write-Log "Setting up GitHub authentication..." "Header"
    
    Write-Host "`nChoose authentication method:" -ForegroundColor $Colors.Header
    Write-Host "1. HTTPS with Personal Access Token (Recommended)" -ForegroundColor $Colors.Info
    Write-Host "2. SSH with SSH Keys" -ForegroundColor $Colors.Info
    
    $choice = Read-Host "`nEnter your choice (1 or 2)"
    
    switch ($choice) {
        "1" {
            Write-Host "`nSetting up HTTPS authentication..." -ForegroundColor $Colors.Info
            Write-Host "You'll need a GitHub Personal Access Token." -ForegroundColor $Colors.Warning
            Write-Host "Create one at: https://github.com/settings/tokens" -ForegroundColor $Colors.Info
            Write-Host "Required scopes: repo, workflow" -ForegroundColor $Colors.Warning
            
            $token = Read-Host "`nEnter your GitHub Personal Access Token" -AsSecureString
            $tokenPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($token))
            
            try {
                # Configure credential helper
                $credResult = Invoke-GitCommand "config --global credential.helper store"
                if (-not $credResult.Success) {
                    throw "Failed to configure credential helper"
                }
                
                # Get current remote URL
                $remoteResult = Invoke-GitCommand "config --get remote.origin.url"
                if (-not $remoteResult.Success) {
                    throw "Failed to get remote URL"
                }
                
                $remoteUrl = $remoteResult.Output
                $httpsUrl = $remoteUrl -replace "https://github.com/", "https://$tokenPlain@github.com/"
                
                # Update remote URL
                $setUrlResult = Invoke-GitCommand "remote set-url origin $httpsUrl"
                if (-not $setUrlResult.Success) {
                    throw "Failed to update remote URL"
                }
                
                # Update configuration
                $config = Get-SyncConfig
                $config.authentication.method = "https"
                $config.authentication.tokenConfigured = $true
                Set-SyncConfig $config
                
                Write-Log "HTTPS authentication configured successfully" "Success"
                return @{ Success = $true; Method = "https" }
            } catch {
                Write-Log "Authentication setup failed: $($_.Exception.Message)" "Error"
                return @{ Success = $false; Error = $_.Exception.Message }
            }
        }
        
        "2" {
            Write-Host "`nSetting up SSH authentication..." -ForegroundColor $Colors.Info
            
            # Check if SSH key exists
            $sshKeyPath = Join-Path $env:USERPROFILE ".ssh\id_rsa.pub"
            if (-not (Test-Path $sshKeyPath)) {
                Write-Log "SSH key not found. Please generate one first:" "Warning"
                Write-Host "Run: ssh-keygen -t rsa -b 4096 -C `"your_email@example.com`"" -ForegroundColor $Colors.Info
                Write-Host "Then add the public key to your GitHub account at: https://github.com/settings/keys" -ForegroundColor $Colors.Info
                return @{ Success = $false; Error = "SSH key not found" }
            }
            
            try {
                # Get current remote URL
                $remoteResult = Invoke-GitCommand "config --get remote.origin.url"
                if (-not $remoteResult.Success) {
                    throw "Failed to get remote URL"
                }
                
                $remoteUrl = $remoteResult.Output
                $sshUrl = $remoteUrl -replace "https://github.com/", "git@github.com:"
                
                # Update remote URL to SSH
                $setUrlResult = Invoke-GitCommand "remote set-url origin $sshUrl"
                if (-not $setUrlResult.Success) {
                    throw "Failed to update remote URL"
                }
                
                # Update configuration
                $config = Get-SyncConfig
                $config.authentication.method = "ssh"
                Set-SyncConfig $config
                
                Write-Log "SSH authentication configured successfully" "Success"
                Write-Host "Make sure your SSH key is added to your GitHub account" -ForegroundColor $Colors.Warning
                return @{ Success = $true; Method = "ssh" }
            } catch {
                Write-Log "SSH setup failed: $($_.Exception.Message)" "Error"
                return @{ Success = $false; Error = $_.Exception.Message }
            }
        }
        
        default {
            Write-Log "Invalid choice. Please run the setup again." "Error"
            return @{ Success = $false; Error = "Invalid choice" }
        }
    }
}

# Sync to remote repository
function Sync-ToRemote {
    param([string]$CommitMessage = "")
    
    try {
        Write-Log "Starting sync to remote repository..." "Info"
        
        # Check repository status
        $status = Get-RepoStatus
        if (-not $status.IsGitRepo) {
            throw "Not a Git repository"
        }
        
        # Test connection
        $connectionTest = Test-RemoteConnection
        if (-not $connectionTest.Connected) {
            throw "Connection failed: $($connectionTest.Error)"
        }
        
        # Add and commit changes if any
        if ($status.HasUncommittedChanges) {
            Write-Log "Adding uncommitted changes..." "Info"
            $addResult = Invoke-GitCommand "add ."
            if (-not $addResult.Success) {
                throw "Failed to add changes: $($addResult.Error)"
            }
            
            # Commit changes
            $message = if ($CommitMessage) { $CommitMessage } else { "Auto-sync: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" }
            $commitResult = Invoke-GitCommand "commit -m `"$message`""
            if (-not $commitResult.Success) {
                throw "Failed to commit changes: $($commitResult.Error)"
            }
            
            Write-Log "Changes committed successfully" "Success"
        } else {
            Write-Log "No uncommitted changes found" "Info"
        }
        
        # Push to remote
        Write-Log "Pushing to remote repository..." "Info"
        $pushResult = Invoke-GitCommand "push origin $($status.CurrentBranch)"
        if (-not $pushResult.Success) {
            throw "Failed to push: $($pushResult.Error)"
        }
        
        Write-Log "Sync to remote completed successfully" "Success"
        return @{ Success = $true; Branch = $status.CurrentBranch }
    } catch {
        Write-Log "Sync to remote failed: $($_.Exception.Message)" "Error"
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

# Sync from remote repository
function Sync-FromRemote {
    try {
        Write-Log "Starting sync from remote repository..." "Info"
        
        # Test connection
        $connectionTest = Test-RemoteConnection
        if (-not $connectionTest.Connected) {
            throw "Connection failed: $($connectionTest.Error)"
        }
        
        # Fetch latest changes
        Write-Log "Fetching latest changes..." "Info"
        $fetchResult = Invoke-GitCommand "fetch origin"
        if (-not $fetchResult.Success) {
            throw "Failed to fetch: $($fetchResult.Error)"
        }
        
        # Get current branch
        $branchResult = Invoke-GitCommand "rev-parse --abbrev-ref HEAD"
        if (-not $branchResult.Success) {
            throw "Failed to get current branch"
        }
        $currentBranch = $branchResult.Output
        
        # Check if there are remote changes
        $localCommitResult = Invoke-GitCommand "rev-parse HEAD"
        $remoteCommitResult = Invoke-GitCommand "rev-parse origin/$currentBranch"
        
        if ($localCommitResult.Success -and $remoteCommitResult.Success -and 
            $localCommitResult.Output -eq $remoteCommitResult.Output) {
            Write-Log "Repository is already up to date" "Info"
            return @{ Success = $true; Updated = $false; Branch = $currentBranch }
        }
        
        # Pull changes
        Write-Log "Pulling remote changes..." "Info"
        $pullResult = Invoke-GitCommand "pull origin $currentBranch"
        if (-not $pullResult.Success) {
            throw "Failed to pull: $($pullResult.Error)"
        }
        
        Write-Log "Sync from remote completed successfully" "Success"
        return @{ Success = $true; Updated = $true; Branch = $currentBranch }
    } catch {
        Write-Log "Sync from remote failed: $($_.Exception.Message)" "Error"
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

# Full bidirectional synchronization
function Sync-Full {
    param([string]$CommitMessage = "")
    
    try {
        Write-Log "Starting full bidirectional synchronization..." "Header"
        
        # First, sync from remote to get latest changes
        $pullResult = Sync-FromRemote
        if (-not $pullResult.Success) {
            return $pullResult
        }
        
        # Then, sync local changes to remote
        $pushResult = Sync-ToRemote $CommitMessage
        
        Write-Log "Full synchronization completed" "Success"
        return @{
            Success = $true
            Pulled = $pullResult.Updated
            Pushed = $pushResult.Success
            Branch = $pullResult.Branch
        }
    } catch {
        Write-Log "Full sync failed: $($_.Exception.Message)" "Error"
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

# Get synchronization status
function Get-SyncStatus {
    Write-Log "Getting synchronization status..." "Header"
    
    $repoStatus = Get-RepoStatus
    $connectionTest = Test-RemoteConnection
    $config = Get-SyncConfig
    
    # Display status
    Write-Host "`n=== Git Synchronization Status ===" -ForegroundColor $Colors.Header
    
    Write-Host "`nRepository Status:" -ForegroundColor $Colors.Info
    if ($repoStatus.IsGitRepo) {
        Write-Host "  ✓ Valid Git repository" -ForegroundColor $Colors.Success
        Write-Host "  Current Branch: $($repoStatus.CurrentBranch)" -ForegroundColor $Colors.Info
        
        if ($repoStatus.HasUncommittedChanges) {
            Write-Host "  ⚠ Uncommitted changes: $($repoStatus.UncommittedFiles.Count) files" -ForegroundColor $Colors.Warning
        } else {
            Write-Host "  ✓ No uncommitted changes" -ForegroundColor $Colors.Success
        }
    } else {
        Write-Host "  ✗ Not a Git repository" -ForegroundColor $Colors.Error
    }
    
    Write-Host "`nConnection Status:" -ForegroundColor $Colors.Info
    if ($connectionTest.Connected) {
        Write-Host "  ✓ Remote connection successful" -ForegroundColor $Colors.Success
    } else {
        Write-Host "  ✗ Connection failed: $($connectionTest.Error)" -ForegroundColor $Colors.Error
        if ($connectionTest.Suggestion) {
            Write-Host "  💡 Suggestion: $($connectionTest.Suggestion)" -ForegroundColor $Colors.Warning
        }
    }
    
    Write-Host "`nAuthentication:" -ForegroundColor $Colors.Info
    Write-Host "  Method: $($config.authentication.method.ToUpper())" -ForegroundColor $Colors.Info
    if ($config.authentication.tokenConfigured) {
        Write-Host "  ✓ Token configured" -ForegroundColor $Colors.Success
    }
    
    Write-Host "`nRemote Repositories:" -ForegroundColor $Colors.Info
    foreach ($remote in $repoStatus.Remotes) {
        Write-Host "  $remote" -ForegroundColor $Colors.Info
    }
    
    return @{
        Repository = $repoStatus
        Connection = $connectionTest
        Authentication = $config.authentication
    }
}

# Show help
function Show-Help {
    Write-Host "`n=== Git Synchronization Manager ===" -ForegroundColor $Colors.Header
    Write-Host "Secure connection and synchronization between local repository and GitHub`n" -ForegroundColor $Colors.Info
    
    Write-Host "Usage:" -ForegroundColor $Colors.Header
    Write-Host "  .\git-sync.ps1 -Action <action> [-Message <message>]`n" -ForegroundColor $Colors.Info
    
    Write-Host "Actions:" -ForegroundColor $Colors.Header
    Write-Host "  status     - Show repository and connection status" -ForegroundColor $Colors.Info
    Write-Host "  setup      - Setup GitHub authentication (HTTPS token or SSH)" -ForegroundColor $Colors.Info
    Write-Host "  sync       - Full bidirectional synchronization" -ForegroundColor $Colors.Info
    Write-Host "  push       - Push local changes to remote" -ForegroundColor $Colors.Info
    Write-Host "  pull       - Pull remote changes to local" -ForegroundColor $Colors.Info
    Write-Host "  test       - Test remote connection" -ForegroundColor $Colors.Info
    Write-Host "  help       - Show this help message" -ForegroundColor $Colors.Info
    
    Write-Host "`nExamples:" -ForegroundColor $Colors.Header
    Write-Host "  .\git-sync.ps1 -Action status" -ForegroundColor $Colors.Info
    Write-Host "  .\git-sync.ps1 -Action setup" -ForegroundColor $Colors.Info
    Write-Host "  .\git-sync.ps1 -Action sync -Message 'Updated security features'" -ForegroundColor $Colors.Info
    Write-Host "  .\git-sync.ps1 -Action push -Message 'Bug fixes'" -ForegroundColor $Colors.Info
    Write-Host "  .\git-sync.ps1 -Action pull" -ForegroundColor $Colors.Info
}

# Main execution
switch ($Action.ToLower()) {
    "status" {
        Get-SyncStatus | Out-Null
    }
    
    "setup" {
        $result = Set-GitAuthentication
        if ($result.Success) {
            Write-Log "Authentication setup completed successfully" "Success"
        } else {
            Write-Log "Authentication setup failed: $($result.Error)" "Error"
        }
    }
    
    "sync" {
        $result = Sync-Full $Message
        if ($result.Success) {
            Write-Log "Full synchronization completed successfully" "Success"
        } else {
            Write-Log "Synchronization failed: $($result.Error)" "Error"
        }
    }
    
    "push" {
        $result = Sync-ToRemote $Message
        if ($result.Success) {
            Write-Log "Push completed successfully" "Success"
        } else {
            Write-Log "Push failed: $($result.Error)" "Error"
        }
    }
    
    "pull" {
        $result = Sync-FromRemote
        if ($result.Success) {
            if ($result.Updated) {
                Write-Log "Pull completed successfully - Repository updated" "Success"
            } else {
                Write-Log "Pull completed - Repository already up to date" "Success"
            }
        } else {
            Write-Log "Pull failed: $($result.Error)" "Error"
        }
    }
    
    "test" {
        $result = Test-RemoteConnection
        if ($result.Connected) {
            Write-Log "Connection test successful" "Success"
        } else {
            Write-Log "Connection test failed: $($result.Error)" "Error"
        }
    }
    
    "help" {
        Show-Help
    }
    
    default {
        Show-Help
    }
}