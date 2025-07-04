# FarmConnect Simple Windows Setup Script
# This script sets up the simplified Docker environment

param(
    [switch]$Build,
    [switch]$Start,
    [switch]$Stop,
    [switch]$Reset,
    [switch]$Logs,
    [switch]$Test,
    [switch]$All
)

$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Test-DockerRunning {
    try {
        docker --version | Out-Null
        docker info | Out-Null
        return $true
    }
    catch {
        Write-ColorOutput "❌ Docker is not running. Please start Docker Desktop." $Red
        return $false
    }
}

function Build-Services {
    Write-ColorOutput "🔨 Building FarmConnect services..." $Blue
    
    if (-not (Test-DockerRunning)) {
        return $false
    }
    
    try {
        docker-compose build --no-cache
        Write-ColorOutput "✅ Services built successfully" $Green
        return $true
    }
    catch {
        Write-ColorOutput "❌ Failed to build services: $($_.Exception.Message)" $Red
        return $false
    }
}

function Start-Services {
    Write-ColorOutput "🚀 Starting FarmConnect services..." $Blue
    
    if (-not (Test-DockerRunning)) {
        return $false
    }
    
    try {
        # Start services
        docker-compose up -d
        
        # Wait for services to be ready
        Write-ColorOutput "⏳ Waiting for services to be ready..." $Yellow
        Start-Sleep -Seconds 30
        
        # Run database migrations
        Write-ColorOutput "🗄️ Running database migrations..." $Yellow
        docker-compose exec -T api-server npm run db:push
        
        # Seed database
        Write-ColorOutput "🌱 Seeding database..." $Yellow
        docker-compose exec -T api-server npm run db:seed
        
        Write-ColorOutput "✅ All services started successfully" $Green
        return $true
    }
    catch {
        Write-ColorOutput "❌ Failed to start services: $($_.Exception.Message)" $Red
        return $false
    }
}

function Stop-Services {
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

function Reset-Services {
    Write-ColorOutput "🔄 Resetting FarmConnect services..." $Blue
    
    $confirm = Read-Host "This will delete all data. Are you sure? (y/N)"
    if ($confirm -ne 'y' -and $confirm -ne 'Y') {
        Write-ColorOutput "⏭️ Reset cancelled" $Yellow
        return $true
    }
    
    try {
        docker-compose down -v
        docker-compose build --no-cache
        docker-compose up -d
        
        Start-Sleep -Seconds 30
        
        docker-compose exec -T api-server npm run db:push
        docker-compose exec -T api-server npm run db:seed
        
        Write-ColorOutput "✅ Services reset successfully" $Green
        return $true
    }
    catch {
        Write-ColorOutput "❌ Failed to reset services: $($_.Exception.Message)" $Red
        return $false
    }
}

function Show-Logs {
    Write-ColorOutput "📝 Showing service logs..." $Blue
    docker-compose logs -f
}

function Test-Services {
    Write-ColorOutput "🧪 Testing FarmConnect services..." $Blue
    
    # Test API health
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -TimeoutSec 10
        Write-ColorOutput "✅ API Server is healthy" $Green
    }
    catch {
        Write-ColorOutput "❌ API Server is not responding" $Red
    }
    
    # Test frontend
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 10
        Write-ColorOutput "✅ Frontend is accessible" $Green
    }
    catch {
        Write-ColorOutput "❌ Frontend is not accessible" $Red
    }
    
    # Test database connection
    try {
        docker-compose exec -T api-server npx prisma db pull > $null 2>&1
        Write-ColorOutput "✅ Database connection is working" $Green
    }
    catch {
        Write-ColorOutput "❌ Database connection failed" $Red
    }
    
    Write-ColorOutput "`n🌐 Access URLs:" $Blue
    Write-ColorOutput "Frontend: http://localhost:5173" $Yellow
    Write-ColorOutput "API: http://localhost:3001/api" $Yellow
    Write-ColorOutput "Database: localhost:5432" $Yellow
    Write-ColorOutput "Redis: localhost:6379" $Yellow
}

function Show-Help {
    Write-ColorOutput "FarmConnect Simple Setup Script" $Blue
    Write-ColorOutput "Usage: .\windows-setup-simple.ps1 [options]" $Yellow
    Write-ColorOutput ""
    Write-ColorOutput "Options:" $Yellow
    Write-ColorOutput "  -Build    Build Docker images" $Yellow
    Write-ColorOutput "  -Start    Start all services" $Yellow
    Write-ColorOutput "  -Stop     Stop all services" $Yellow
    Write-ColorOutput "  -Reset    Reset and rebuild everything" $Yellow
    Write-ColorOutput "  -Logs     Show service logs" $Yellow
    Write-ColorOutput "  -Test     Test all services" $Yellow
    Write-ColorOutput "  -All      Build and start services" $Yellow
    Write-ColorOutput ""
    Write-ColorOutput "Examples:" $Yellow
    Write-ColorOutput "  .\windows-setup-simple.ps1 -All" $Yellow
    Write-ColorOutput "  .\windows-setup-simple.ps1 -Start" $Yellow
    Write-ColorOutput "  .\windows-setup-simple.ps1 -Reset" $Yellow
}

# Main execution
if ($All) {
    $Build = $true
    $Start = $true
    $Test = $true
}

if (-not ($Build -or $Start -or $Stop -or $Reset -or $Logs -or $Test)) {
    Show-Help
    exit 0
}

Write-ColorOutput "🌱 FarmConnect Simple Setup for Windows 11" $Green
Write-ColorOutput "===========================================" $Green

$success = $true

if ($Build) {
    $success = $success -and (Build-Services)
}

if ($Start) {
    $success = $success -and (Start-Services)
}

if ($Stop) {
    $success = $success -and (Stop-Services)
}

if ($Reset) {
    $success = $success -and (Reset-Services)
}

if ($Logs) {
    Show-Logs
}

if ($Test) {
    Test-Services
}

if ($success -and ($Build -or $Start)) {
    Write-ColorOutput "`n🎉 FarmConnect is ready!" $Green
    Write-ColorOutput "Frontend: http://localhost:5173" $Yellow
    Write-ColorOutput "API: http://localhost:3001/api" $Yellow
    Write-ColorOutput ""
    Write-ColorOutput "🔑 Default Admin Account:" $Blue
    Write-ColorOutput "Email: admin@farmconnect.com" $Yellow
    Write-ColorOutput "Password: admin123" $Yellow
}