# FarmConnect Microservices - Windows 11 Local Setup Guide

## 🖥️ Prerequisites for Windows 11

### 1. Install Required Software

**Docker Desktop for Windows**
```powershell
# Download and install Docker Desktop from:
# https://www.docker.com/products/docker-desktop/

# After installation, enable WSL 2 backend
# Open Docker Desktop → Settings → General → Use WSL 2 based engine
```

**Node.js (LTS Version)**
```powershell
# Download from: https://nodejs.org/
# Or use Chocolatey:
choco install nodejs

# Verify installation
node --version
npm --version
```

**Git for Windows**
```powershell
# Download from: https://git-scm.com/download/win
# Or use Chocolatey:
choco install git

# Verify installation
git --version
```

**Windows Subsystem for Linux (WSL 2)**
```powershell
# Open PowerShell as Administrator and run:
wsl --install

# Restart your computer when prompted
# Install Ubuntu from Microsoft Store
```

**PostgreSQL (Optional - for local development)**
```powershell
# Download from: https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql

# Default credentials:
# Username: postgres
# Password: (set during installation)
```

### 2. Install Development Tools

**Visual Studio Code**
```powershell
# Download from: https://code.visualstudio.com/
# Or use Chocolatey:
choco install vscode

# Recommended extensions:
# - Docker
# - Kubernetes
# - REST Client
# - GitLens
```

**Windows Terminal (Recommended)**
```powershell
# Install from Microsoft Store or:
choco install microsoft-windows-terminal
```

## 🚀 Project Setup

### 1. Clone and Setup Project

```powershell
# Open Windows Terminal or PowerShell
# Navigate to your development directory
cd C:\Development

# Clone the project (if using Git)
git clone https://github.com/your-username/farmconnect-marketplace.git
cd farmconnect-marketplace

# Or create new directory and copy files
mkdir farmconnect-marketplace
cd farmconnect-marketplace
```

### 2. Environment Configuration

```powershell
# Copy environment template
copy .env.microservices .env

# Edit .env file with your preferred text editor
notepad .env
# OR
code .env
```

**Required Environment Variables:**
```env
# Generate secure keys using PowerShell
# JWT_SECRET (run this in PowerShell):
# [System.Web.Security.Membership]::GeneratePassword(64, 10)

JWT_SECRET=your-super-secure-jwt-secret-key-here
ENCRYPTION_KEY=your-32-character-encryption-key-here
REDIS_PASSWORD=your-redis-password-here
VAULT_ROOT_TOKEN=your-vault-root-token-here
GRAFANA_PASSWORD=admin123

# External Services (for production)
EMAIL_SERVICE_URL=https://api.sendgrid.com/v3
SMS_SERVICE_URL=https://api.twilio.com/2010-04-01

# Environment
NODE_ENV=development
LOG_LEVEL=info

# Compliance Settings
AUDIT_RETENTION_DAYS=2555
DATA_ENCRYPTION_ENABLED=true
ACCESS_LOG_ENABLED=true
SECURITY_HEADERS_ENABLED=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Generate Secure Keys (PowerShell)

```powershell
# Generate JWT Secret
Add-Type -AssemblyName System.Web
$jwtSecret = [System.Web.Security.Membership]::GeneratePassword(64, 10)
Write-Host "JWT_SECRET=$jwtSecret"

# Generate Encryption Key (32 characters)
$encryptionKey = [System.Web.Security.Membership]::GeneratePassword(32, 0)
Write-Host "ENCRYPTION_KEY=$encryptionKey"

# Generate Redis Password
$redisPassword = [System.Web.Security.Membership]::GeneratePassword(16, 0)
Write-Host "REDIS_PASSWORD=$redisPassword"

# Generate Vault Token
$vaultToken = [System.Web.Security.Membership]::GeneratePassword(32, 0)
Write-Host "VAULT_ROOT_TOKEN=$vaultToken"
```

## 🐳 Docker Setup

### 1. Start Docker Desktop

```powershell
# Ensure Docker Desktop is running
# Check Docker status
docker --version
docker-compose --version

# Test Docker installation
docker run hello-world
```

### 2. Build and Start Services

```powershell
# Navigate to project directory
cd C:\Development\farmconnect-marketplace

# Build all services (first time)
docker-compose build

# Start all services in detached mode
docker-compose up -d

# View running containers
docker-compose ps

# View logs for all services
docker-compose logs

# View logs for specific service
docker-compose logs user-service
```

### 3. Initialize Databases

```powershell
# Wait for services to start (about 2-3 minutes)
# Check if databases are ready
docker-compose exec user-service npm run db:migrate
docker-compose exec product-service npm run db:migrate
docker-compose exec order-service npm run db:migrate
docker-compose exec payment-service npm run db:migrate
docker-compose exec audit-service npm run db:migrate

# Seed databases with sample data
docker-compose exec user-service npm run db:seed
docker-compose exec product-service npm run db:seed
```

## 🔍 Testing the Setup

### 1. Health Checks

```powershell
# Test API Gateway
curl http://localhost:8000/health

# Test individual services
curl http://localhost:8000/api/users/health
curl http://localhost:8000/api/products/health
curl http://localhost:8000/api/orders/health
curl http://localhost:8000/api/payments/health
```

### 2. Access Web Interfaces

Open your browser and navigate to:

- **API Gateway**: http://localhost:8000
- **Kong Admin**: http://localhost:8001
- **Grafana Dashboard**: http://localhost:3000 (admin/admin123)
- **Kibana Logs**: http://localhost:5601
- **Prometheus Metrics**: http://localhost:9090
- **Vault UI**: http://localhost:8200

### 3. Test API Endpoints

**Using PowerShell (Invoke-RestMethod):**
```powershell
# Test user registration
$body = @{
    email = "test@example.com"
    password = "password123"
    name = "Test User"
    userType = "BUYER"
    address = "123 Test St"
    phone = "+1234567890"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:8000/api/auth/register" -Method POST -Body $body -Headers $headers
```

**Using curl (if installed):**
```powershell
# Test user registration
curl -X POST http://localhost:8000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "userType": "BUYER",
    "address": "123 Test St",
    "phone": "+1234567890"
  }'

# Test login
curl -X POST http://localhost:8000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 🛠️ Development Workflow

### 1. Making Changes

```powershell
# Stop specific service
docker-compose stop user-service

# Rebuild service after changes
docker-compose build user-service

# Start service
docker-compose start user-service

# Or rebuild and restart in one command
docker-compose up -d --build user-service
```

### 2. Viewing Logs

```powershell
# Follow logs for all services
docker-compose logs -f

# Follow logs for specific service
docker-compose logs -f user-service

# View last 100 lines
docker-compose logs --tail=100 user-service
```

### 3. Database Management

```powershell
# Connect to PostgreSQL database
docker-compose exec user-db psql -U user_service -d user_service_db

# View database tables
docker-compose exec user-service npx prisma studio

# Reset database (careful!)
docker-compose exec user-service npm run db:reset
```

## 🔧 Troubleshooting

### Common Issues

**Port Already in Use:**
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill process by PID
taskkill /PID <PID> /F

# Or change ports in docker-compose.yml
```

**Docker Desktop Not Starting:**
```powershell
# Restart Docker Desktop
# Check Windows features:
# - Hyper-V
# - Windows Subsystem for Linux
# - Virtual Machine Platform

# Enable features in PowerShell (as Administrator):
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
```

**Service Won't Start:**
```powershell
# Check service logs
docker-compose logs service-name

# Check container status
docker-compose ps

# Restart specific service
docker-compose restart service-name

# Remove and recreate containers
docker-compose down
docker-compose up -d
```

**Database Connection Issues:**
```powershell
# Check if database is running
docker-compose ps | findstr db

# Check database logs
docker-compose logs user-db

# Reset database
docker-compose down -v
docker-compose up -d
```

### Performance Issues

**Slow Container Startup:**
```powershell
# Allocate more resources to Docker Desktop
# Docker Desktop → Settings → Resources
# Increase CPU and Memory allocation

# Clean up Docker system
docker system prune -a
docker volume prune
```

## 📊 Monitoring Setup

### 1. Grafana Dashboard

```powershell
# Access Grafana at http://localhost:3000
# Login: admin / admin123

# Import pre-configured dashboards:
# 1. Go to + → Import
# 2. Upload dashboard JSON files from ./infrastructure/grafana/dashboards/
```

### 2. Kibana Log Analysis

```powershell
# Access Kibana at http://localhost:5601
# Create index pattern: farmconnect-*
# View logs in Discover tab
```

### 3. Prometheus Metrics

```powershell
# Access Prometheus at http://localhost:9090
# Query examples:
# - http_requests_total
# - http_request_duration_seconds
# - up{job="user-service"}
```

## 🧪 Testing Scenarios

### 1. User Registration Flow

```powershell
# 1. Register as Farmer
$farmerData = @{
    email = "farmer@test.com"
    password = "password123"
    name = "John Farmer"
    userType = "FARMER"
    farmName = "Green Valley Farm"
    location = "California"
    description = "Organic vegetables"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/auth/register" -Method POST -Body $farmerData -Headers @{"Content-Type"="application/json"}

# 2. Register as Buyer
$buyerData = @{
    email = "buyer@test.com"
    password = "password123"
    name = "Jane Buyer"
    userType = "BUYER"
    address = "123 Main St, San Francisco"
    phone = "+1-555-0123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/auth/register" -Method POST -Body $buyerData -Headers @{"Content-Type"="application/json"}
```

### 2. Product Management

```powershell
# Login as farmer first to get token
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" -Method POST -Body (@{
    email = "farmer@test.com"
    password = "password123"
} | ConvertTo-Json) -Headers @{"Content-Type"="application/json"}

$token = $loginResponse.token

# Create product
$productData = @{
    name = "Organic Tomatoes"
    description = "Fresh organic tomatoes"
    category = "Vegetables"
    price = 4.99
    unit = "lb"
    imageUrl = "https://example.com/tomato.jpg"
    stock = 100
    organic = $true
    harvestDate = "2024-01-15"
    location = "California"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/products" -Method POST -Body $productData -Headers @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}
```

### 3. Order Processing

```powershell
# Login as buyer
$buyerLogin = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" -Method POST -Body (@{
    email = "buyer@test.com"
    password = "password123"
} | ConvertTo-Json) -Headers @{"Content-Type"="application/json"}

$buyerToken = $buyerLogin.token

# Create order
$orderData = @{
    farmerId = "farmer-user-id"
    items = @(
        @{
            productId = "product-id"
            quantity = 2
            price = 4.99
        }
    )
    total = 9.98
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:8000/api/orders" -Method POST -Body $orderData -Headers @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $buyerToken"
}
```

## 🔄 Cleanup

### Stop Services

```powershell
# Stop all services
docker-compose down

# Stop and remove volumes (deletes data)
docker-compose down -v

# Remove all containers, networks, and images
docker-compose down --rmi all -v --remove-orphans
```

### System Cleanup

```powershell
# Clean up Docker system
docker system prune -a

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune
```

## 📚 Additional Resources

### Windows-Specific Tools

- **Windows Terminal**: Better command-line experience
- **PowerToys**: Useful utilities for Windows
- **WSL 2**: Linux compatibility layer
- **Docker Desktop**: Container management

### Development Tools

- **Postman**: API testing
- **DBeaver**: Database management
- **Insomnia**: REST client
- **Lens**: Kubernetes IDE

### Monitoring Tools

- **Docker Desktop Dashboard**: Container monitoring
- **Resource Monitor**: System performance
- **Event Viewer**: Windows logs

---

## 🎉 Success!

If you've followed this guide successfully, you should now have:

✅ **Microservices Architecture** running locally  
✅ **API Gateway** routing requests  
✅ **Databases** initialized with sample data  
✅ **Monitoring Stack** collecting metrics and logs  
✅ **Security Features** enabled and configured  
✅ **Test Endpoints** responding correctly  

Your FarmConnect microservices platform is now ready for development and testing on Windows 11!

## 🆘 Need Help?

If you encounter issues:

1. **Check Docker Desktop** is running and healthy
2. **Verify ports** are not in use by other applications
3. **Review logs** using `docker-compose logs service-name`
4. **Restart services** with `docker-compose restart`
5. **Clean and rebuild** with `docker-compose down && docker-compose up -d --build`

For specific errors, check the troubleshooting section above or create an issue with the error details.