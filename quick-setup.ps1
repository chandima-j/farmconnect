# FarmConnect Quick Setup Script for Windows
# This script creates all necessary files for the project

param(
    [string]$ProjectPath = "C:\Users\HP\Documents\farmconnect-marketplace"
)

$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

Write-ColorOutput "🌱 FarmConnect Quick Setup" $Green
Write-ColorOutput "Creating project structure..." $Yellow

# Create project directory
if (-not (Test-Path $ProjectPath)) {
    New-Item -ItemType Directory -Path $ProjectPath -Force
    Write-ColorOutput "✅ Created project directory: $ProjectPath" $Green
}

Set-Location $ProjectPath

# Create directory structure
$directories = @(
    "src/components",
    "src/contexts", 
    "src/lib",
    "src/pages/admin",
    "src/types",
    "src/data",
    "server/routes",
    "server/middleware",
    "prisma",
    "scripts",
    "logs",
    "public"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force
    }
}

Write-ColorOutput "✅ Directory structure created" $Green

# Create essential files with basic content
$files = @{
    "docker-compose.yml" = @"
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: farmconnect-postgres
    environment:
      POSTGRES_DB: farmconnect
      POSTGRES_USER: farmconnect
      POSTGRES_PASSWORD: password123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - farmconnect-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: farmconnect-redis
    command: redis-server --requirepass password123
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - farmconnect-network
    restart: unless-stopped

  api-server:
    build:
      context: .
      dockerfile: Dockerfile.api
    container_name: farmconnect-api
    environment:
      - DATABASE_URL=postgresql://farmconnect:password123@postgres:5432/farmconnect
      - JWT_SECRET=your-super-secret-jwt-key-here
      - REDIS_URL=redis://:password123@redis:6379
      - NODE_ENV=development
      - PORT=3001
    depends_on:
      - postgres
      - redis
    ports:
      - "3001:3001"
    networks:
      - farmconnect-network
    volumes:
      - ./server:/app/server
      - ./prisma:/app/prisma
      - ./logs:/app/logs
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: farmconnect-frontend
    environment:
      - VITE_API_URL=http://localhost:3001/api
    ports:
      - "5173:5173"
    networks:
      - farmconnect-network
    volumes:
      - ./src:/app/src
      - ./public:/app/public
    restart: unless-stopped
    depends_on:
      - api-server

volumes:
  postgres_data:
  redis_data:

networks:
  farmconnect-network:
    driver: bridge
"@

    ".env" = @"
# Database
DATABASE_URL="postgresql://farmconnect:password123@localhost:5432/farmconnect"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here-$(Get-Random)"

# Server Configuration  
PORT=3001
CLIENT_URL="http://localhost:5173"

# Development
NODE_ENV="development"
"@

    "package.json" = @"
{
  "name": "farmconnect-marketplace",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:client": "vite",
    "dev:server": "tsx watch server/index.ts",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "tsc -p server/tsconfig.json",
    "start": "node dist/server/index.js",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx server/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^5.7.1",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "lucide-react": "^0.344.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/node": "^20.10.5",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.18",
    "concurrently": "^8.2.2",
    "eslint": "^9.9.1",
    "globals": "^15.9.0",
    "postcss": "^8.4.35",
    "prisma": "^5.7.1",
    "tailwindcss": "^3.4.1",
    "tsx": "^4.6.2",
    "typescript": "^5.5.3",
    "vite": "^5.4.2"
  }
}
"@

    "Dockerfile.api" = @"
FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production
RUN npx prisma generate

COPY server ./server/
COPY .env* ./

RUN mkdir -p logs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

CMD ["npm", "run", "dev:server"]
"@

    "Dockerfile.frontend" = @"
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY src ./src/
COPY public ./public/
COPY index.html ./
COPY vite.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY tsconfig*.json ./

EXPOSE 5173

CMD ["npm", "run", "dev:client"]
"@

    "README.md" = @"
# FarmConnect Marketplace

A modern e-commerce platform connecting farmers with city buyers.

## Quick Start

1. Ensure Docker Desktop is running
2. Run setup script: ``.\scripts\windows-setup-simple.ps1 -All``
3. Access the app at http://localhost:5173

## Default Admin Account
- Email: admin@farmconnect.com  
- Password: admin123
"@
}

# Create files
foreach ($file in $files.Keys) {
    $files[$file] | Out-File -FilePath $file -Encoding UTF8
    Write-ColorOutput "✅ Created $file" $Green
}

Write-ColorOutput "`n🎉 Basic project structure created!" $Green
Write-ColorOutput "📍 Project location: $ProjectPath" $Yellow
Write-ColorOutput "`n⚠️  Next steps:" $Blue
Write-ColorOutput "1. You still need to copy the complete source files from the conversation" $Yellow
Write-ColorOutput "2. Or run: .\scripts\windows-setup-simple.ps1 -All" $Yellow
Write-ColorOutput "3. Make sure Docker Desktop is running" $Yellow

Write-ColorOutput "`n📁 Created files:" $Blue
Get-ChildItem -Recurse -File | Select-Object Name, Length | Format-Table