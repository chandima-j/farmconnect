# FarmConnect Cleanup Script for Windows
# This script helps clean up Docker containers, volumes, and reset the environment

param(
    [switch]$StopServices,
    [switch]$RemoveContainers,
    [switch]$RemoveVolumes,
    [switch]$RemoveImages,
    [switch]$CleanLogs,
    [switch]$ResetEnvironment,
    [switch]$All,
    [switch]$Force
)

$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Confirm-Action {
    param([string]$Message)
    
    if ($Force) {
        return $true
    }
    
    $response = Read-Host "$Message (y/N)"
    return $response -eq 'y' -or $response -eq 'Y'
}

function Stop-FarmConnectServices {
    Write-ColorOutput "🛑 Stopping FarmConnect services..." $Blue
    
    try {
        docker-compose down
        Write-ColorOutput "✅ Services stopped successfully" $Green
        return $true
    }
    catch {
        Write-ColorOutput "❌ Failed to stop services: $($_.Exception.Message)" $Red
        return $false
    }
}

function Remove-FarmConnectContainers {
    Write-ColorOutput "🗑️ Removing FarmConnect containers..." $Blue
    
    if (-not (Confirm-Action "This will remove all FarmConnect containers. Continue?")) {
        Write-ColorOutput "⏭️ Skipping container removal" $Yellow
        return $true
    }
    
    try {
        # Get FarmConnect containers
        $containers = docker ps -a --filter "name=farmconnect" --format "{{.Names}}"
        
        if ($containers) {
            Write-ColorOutput "Removing containers: $($containers -join ', ')" $Yellow
            docker rm -f $containers
            Write-ColorOutput "✅ Containers removed successfully" $Green
        } else {
            Write-ColorOutput "ℹ️ No FarmConnect containers found" $Blue
        }
        
        return $true
    }
    catch {
        Write-ColorOutput "❌ Failed to remove containers: $($_.Exception.Message)" $Red
        return $false
    }
}

function Remove-FarmConnectVolumes {
    Write-ColorOutput "💾 Removing FarmConnect volumes..." $Blue
    
    if (-not (Confirm-Action "This will permanently delete all database data. Continue?")) {
        Write-ColorOutput "⏭️ Skipping volume removal" $Yellow
        return $true
    }
    
    try {
        # Get FarmConnect volumes
        $volumes = docker volume ls --filter "name=farmconnect" --format "{{.Name}}"
        
        if ($volumes) {
            Write-ColorOutput "Removing volumes: $($volumes -join ', ')" $Yellow
            docker volume rm $volumes
            Write-ColorOutput "✅ Volumes removed successfully" $Green
        } else {
            Write-ColorOutput "ℹ️ No FarmConnect volumes found" $Blue
        }
        
        return $true
    }
    catch {
        Write-ColorOutput "❌ Failed to remove volumes: $($_.Exception.Message)" $Red
        return $false
    }
}

function Remove-FarmConnectImages {
    Write-ColorOutput "🖼️ Removing FarmConnect images..." $Blue
    
    if (-not (Confirm-Action "This will remove all FarmConnect Docker images. Continue?")) {
        Write-ColorOutput "⏭️ Skipping image removal" $Yellow
        return $true
    }
    
    try {
        # Get FarmConnect images
        $images = docker images --filter "reference=farmconnect*" --format "{{.Repository}}:{{.Tag}}"
        
        if ($images) {
            Write-ColorOutput "Removing images: $($images -join ', ')" $Yellow
            docker rmi -f $images
            Write-ColorOutput "✅ Images removed successfully" $Green
        } else {
            Write-ColorOutput "ℹ️ No FarmConnect images found" $Blue
        }
        
        return $true
    }
    catch {
        Write-ColorOutput "❌ Failed to remove images: $($_.Exception.Message)" $Red
        return $false
    }
}

function Clean-LogFiles {
    Write-ColorOutput "📝 Cleaning log files..." $Blue
    
    if (-not (Confirm-Action "This will delete all log files. Continue?")) {
        Write-ColorOutput "⏭️ Skipping log cleanup" $Yellow
        return $true
    }
    
    try {
        if (Test-Path "logs") {
            Get-ChildItem -Path "logs" -Recurse | Remove-Item -Force -Recurse
            Write-ColorOutput "✅ Log files cleaned successfully" $Green
        } else {
            Write-ColorOutput "ℹ️ No logs directory found" $Blue
        }
        
        return $true
    }
    catch {
        Write-ColorOutput "❌ Failed to clean log files: $($_.Exception.Message)" $Red
        return $false
    }
}

function Reset-Environment {
    Write-ColorOutput "🔄 Resetting environment..." $Blue
    
    if (-not (Confirm-Action "This will reset environment files and configurations. Continue?")) {
        Write-ColorOutput "⏭️ Skipping environment reset" $Yellow
        return $true
    }
    
    try {
        # Remove .env file
        if (Test-Path ".env") {
            Remove-Item ".env" -Force
            Write-ColorOutput "✅ Environment file removed" $Green
        }
        
        # Remove any temporary files
        $tempFiles = @("*.log", "*.tmp", ".DS_Store", "Thumbs.db")
        foreach ($pattern in $tempFiles) {
            Get-ChildItem -Path "." -Name $pattern -Recurse | Remove-Item -Force -ErrorAction SilentlyContinue
        }
        
        Write-ColorOutput "✅ Environment reset successfully" $Green
        return $true
    }
    catch {
        Write-ColorOutput "❌ Failed to reset environment: $($_.Exception.Message)" $Red
        return $false
    }
}

function Show-DockerSystemInfo {
    Write-ColorOutput "`n📊 Docker System Information:" $Blue
    
    try {
        Write-ColorOutput "Containers:" $Yellow
        docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        
        Write-ColorOutput "`nImages:" $Yellow
        docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
        
        Write-ColorOutput "`nVolumes:" $Yellow
        docker volume ls
        
        Write-ColorOutput "`nNetworks:" $Yellow
        docker network ls
        
        Write-ColorOutput "`nSystem Usage:" $Yellow
        docker system df
    }
    catch {
        Write-ColorOutput "❌ Failed to get Docker system info: $($_.Exception.Message)" $Red
    }
}

function Show-Help {
    Write-ColorOutput "FarmConnect Cleanup Script" $Blue
    Write-ColorOutput "Usage: .\cleanup.ps1 [options]" $Yellow
    Write-ColorOutput ""
    Write-ColorOutput "Options:" $Yellow
    Write-ColorOutput "  -StopServices      Stop all running services" $Yellow
    Write-ColorOutput "  -RemoveContainers  Remove all FarmConnect containers" $Yellow
    Write-ColorOutput "  -RemoveVolumes     Remove all FarmConnect volumes (deletes data!)" $Yellow
    Write-ColorOutput "  -RemoveImages      Remove all FarmConnect Docker images" $Yellow
    Write-ColorOutput "  -CleanLogs         Clean all log files" $Yellow
    Write-ColorOutput "  -ResetEnvironment  Reset environment files and configurations" $Yellow
    Write-ColorOutput "  -All               Perform all cleanup operations" $Yellow
    Write-ColorOutput "  -Force             Skip confirmation prompts" $Yellow
    Write-ColorOutput ""
    Write-ColorOutput "Examples:" $Yellow
    Write-ColorOutput "  .\cleanup.ps1 -StopServices" $Yellow
    Write-ColorOutput "  .\cleanup.ps1 -All -Force" $Yellow
    Write-ColorOutput "  .\cleanup.ps1 -RemoveContainers -RemoveVolumes" $Yellow
}

# Main execution
if ($All) {
    $StopServices = $true
    $RemoveContainers = $true
    $RemoveVolumes = $true
    $RemoveImages = $true
    $CleanLogs = $true
    $ResetEnvironment = $true
}

if (-not ($StopServices -or $RemoveContainers -or $RemoveVolumes -or $RemoveImages -or $CleanLogs -or $ResetEnvironment)) {
    Show-Help
    Show-DockerSystemInfo
    exit 0
}

Write-ColorOutput "🧹 FarmConnect Cleanup Utility" $Green
Write-ColorOutput "===============================" $Green

$success = $true

if ($StopServices) {
    $success = $success -and (Stop-FarmConnectServices)
}

if ($RemoveContainers) {
    $success = $success -and (Remove-FarmConnectContainers)
}

if ($RemoveVolumes) {
    $success = $success -and (Remove-FarmConnectVolumes)
}

if ($RemoveImages) {
    $success = $success -and (Remove-FarmConnectImages)
}

if ($CleanLogs) {
    $success = $success -and (Clean-LogFiles)
}

if ($ResetEnvironment) {
    $success = $success -and (Reset-Environment)
}

# Final cleanup
Write-ColorOutput "`n🔧 Running Docker system cleanup..." $Blue
try {
    docker system prune -f
    Write-ColorOutput "✅ Docker system cleanup completed" $Green
}
catch {
    Write-ColorOutput "⚠️ Docker system cleanup had issues" $Yellow
}

if ($success) {
    Write-ColorOutput "`n🎉 Cleanup completed successfully!" $Green
    Write-ColorOutput "You can now run the setup script again if needed." $Green
} else {
    Write-ColorOutput "`n⚠️ Cleanup completed with some issues. Check the output above." $Yellow
}

Show-DockerSystemInfo