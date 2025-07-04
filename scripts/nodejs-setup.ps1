# FarmConnect Node.js Setup (No Docker Required)
# Run this if Docker Desktop is having issues

param(
    [switch]$Install,
    [switch]$Setup,
    [switch]$Start,
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

function Install-Dependencies {
    Write-ColorOutput "📦 Installing Node.js dependencies..." $Blue
    
    try {
        # Check Node.js
        $nodeVersion = node --version
        Write-ColorOutput "✅ Node.js version: $nodeVersion" $Green
        
        # Install dependencies
        npm install
        Write-ColorOutput "✅ Dependencies installed" $Green
        return $true
    }
    catch {
        Write-ColorOutput "❌ Failed to install dependencies: $($_.Exception.Message)" $Red
        return $false
    }
}

function Setup-Database {
    Write-ColorOutput "🗄️ Setting up database..." $Blue
    
    try {
        # Generate Prisma client
        npm run db:generate
        
        # Push database schema
        npm run db:push
        
        # Seed database
        npm run db:seed
        
        Write-ColorOutput "✅ Database setup complete" $Green
        return $true
    }
    catch {
        Write-ColorOutput "❌ Database setup failed: $($_.Exception.Message)" $Red
        Write-ColorOutput "💡 Make sure PostgreSQL is running on localhost:5432" $Yellow
        return $false
    }
}

function Start-Application {
    Write-ColorOutput "🚀 Starting FarmConnect application..." $Blue
    
    try {
        # Start both frontend and backend
        npm run dev
    }
    catch {
        Write-ColorOutput "❌ Failed to start application: $($_.Exception.Message)" $Red
        return $false
    }
}

# Main execution
if ($All) {
    $Install = $true
    $Setup = $true
    $Start = $true
}

Write-ColorOutput "🌱 FarmConnect Node.js Setup (No Docker)" $Green
Write-ColorOutput "========================================" $Green

if ($Install) {
    if (-not (Install-Dependencies)) { exit 1 }
}

if ($Setup) {
    if (-not (Setup-Database)) { exit 1 }
}

if ($Start) {
    Write-ColorOutput "`n🎉 Starting FarmConnect..." $Green
    Write-ColorOutput "Frontend: http://localhost:5173" $Yellow
    Write-ColorOutput "API: http://localhost:3001" $Yellow
    Write-ColorOutput "`nPress Ctrl+C to stop" $Blue
    Start-Application
}

if (-not ($Install -or $Setup -or $Start)) {
    Write-ColorOutput "Usage: .\nodejs-setup.ps1 [options]" $Yellow
    Write-ColorOutput "Options: -Install, -Setup, -Start, -All" $Yellow
}