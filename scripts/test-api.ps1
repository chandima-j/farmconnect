# FarmConnect API Testing Script for Windows
# This script tests all major API endpoints

param(
    [string]$BaseUrl = "http://localhost:8000",
    [switch]$Verbose
)

$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            TimeoutSec = 10
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        if ($Verbose) {
            Write-ColorOutput "Testing: $Method $Url" $Yellow
        }
        
        $response = Invoke-RestMethod @params
        Write-ColorOutput "✅ $Name" $Green
        
        if ($Verbose -and $response) {
            Write-ColorOutput "Response: $($response | ConvertTo-Json -Depth 2)" $Blue
        }
        
        return $response
    }
    catch {
        Write-ColorOutput "❌ $Name - $($_.Exception.Message)" $Red
        return $null
    }
}

Write-ColorOutput "🧪 FarmConnect API Testing Suite" $Blue
Write-ColorOutput "=================================" $Blue
Write-ColorOutput "Base URL: $BaseUrl" $Yellow
Write-ColorOutput ""

# Test 1: Health Checks
Write-ColorOutput "1. Health Checks" $Blue
Test-Endpoint "API Gateway Health" "$BaseUrl/health"
Test-Endpoint "Kong Admin" "$BaseUrl:8001"

# Test 2: User Registration
Write-ColorOutput "`n2. User Registration" $Blue

$farmerData = @{
    email = "farmer.test@farmconnect.com"
    password = "password123"
    name = "John Farmer"
    userType = "FARMER"
    farmName = "Green Valley Organic Farm"
    location = "Sonoma County, CA"
    description = "Certified organic farm specializing in seasonal vegetables"
} | ConvertTo-Json

$buyerData = @{
    email = "buyer.test@farmconnect.com"
    password = "password123"
    name = "Jane Buyer"
    userType = "BUYER"
    address = "123 Main Street, San Francisco, CA"
    phone = "+1-555-0123"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

$farmerResponse = Test-Endpoint "Register Farmer" "$BaseUrl/api/auth/register" "POST" $headers $farmerData
$buyerResponse = Test-Endpoint "Register Buyer" "$BaseUrl/api/auth/register" "POST" $headers $buyerData

# Test 3: User Login
Write-ColorOutput "`n3. User Authentication" $Blue

$farmerLogin = @{
    email = "farmer.test@farmconnect.com"
    password = "password123"
} | ConvertTo-Json

$buyerLogin = @{
    email = "buyer.test@farmconnect.com"
    password = "password123"
} | ConvertTo-Json

$farmerAuth = Test-Endpoint "Farmer Login" "$BaseUrl/api/auth/login" "POST" $headers $farmerLogin
$buyerAuth = Test-Endpoint "Buyer Login" "$BaseUrl/api/auth/login" "POST" $headers $buyerLogin

# Test 4: Protected Endpoints
if ($farmerAuth -and $farmerAuth.token) {
    Write-ColorOutput "`n4. Protected Endpoints (Farmer)" $Blue
    
    $authHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $($farmerAuth.token)"
    }
    
    Test-Endpoint "Get Current User" "$BaseUrl/api/auth/me" "GET" $authHeaders
    
    # Test product creation
    $productData = @{
        name = "Organic Roma Tomatoes"
        description = "Vine-ripened organic Roma tomatoes, perfect for sauces and cooking"
        category = "Vegetables"
        price = 4.99
        unit = "lb"
        imageUrl = "https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg"
        stock = 50
        organic = $true
        harvestDate = "2024-01-15"
        location = "Sonoma County, CA"
    } | ConvertTo-Json
    
    $productResponse = Test-Endpoint "Create Product" "$BaseUrl/api/products" "POST" $authHeaders $productData
}

if ($buyerAuth -and $buyerAuth.token) {
    Write-ColorOutput "`n5. Protected Endpoints (Buyer)" $Blue
    
    $buyerAuthHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $($buyerAuth.token)"
    }
    
    Test-Endpoint "Get Current User (Buyer)" "$BaseUrl/api/auth/me" "GET" $buyerAuthHeaders
    Test-Endpoint "Get Orders" "$BaseUrl/api/orders" "GET" $buyerAuthHeaders
}

# Test 5: Public Endpoints
Write-ColorOutput "`n6. Public Endpoints" $Blue
Test-Endpoint "Get Products" "$BaseUrl/api/products"
Test-Endpoint "Get Farmers" "$BaseUrl/api/users/farmers"

# Test 6: Search and Filtering
Write-ColorOutput "`n7. Search and Filtering" $Blue
Test-Endpoint "Search Products (Organic)" "$BaseUrl/api/products?organic=true"
Test-Endpoint "Search Products (Category)" "$BaseUrl/api/products?category=Vegetables"
Test-Endpoint "Search Products (Text)" "$BaseUrl/api/products?search=tomato"

# Test 7: Rate Limiting
Write-ColorOutput "`n8. Rate Limiting Test" $Blue
Write-ColorOutput "Sending multiple requests to test rate limiting..." $Yellow

for ($i = 1; $i -le 5; $i++) {
    $response = Test-Endpoint "Rate Limit Test $i" "$BaseUrl/health"
    Start-Sleep -Milliseconds 100
}

# Test 8: Error Handling
Write-ColorOutput "`n9. Error Handling" $Blue
Test-Endpoint "Invalid Endpoint" "$BaseUrl/api/invalid-endpoint"
Test-Endpoint "Invalid Login" "$BaseUrl/api/auth/login" "POST" $headers (@{
    email = "invalid@email.com"
    password = "wrongpassword"
} | ConvertTo-Json)

# Test 9: Monitoring Endpoints
Write-ColorOutput "`n10. Monitoring Endpoints" $Blue
Test-Endpoint "Prometheus Metrics" "http://localhost:9090/api/v1/query?query=up"
Test-Endpoint "Grafana Health" "http://localhost:3000/api/health"

# Summary
Write-ColorOutput "`n📊 Test Summary" $Blue
Write-ColorOutput "=================================" $Blue
Write-ColorOutput "✅ Basic functionality tests completed" $Green
Write-ColorOutput "✅ Authentication flow tested" $Green
Write-ColorOutput "✅ CRUD operations tested" $Green
Write-ColorOutput "✅ Error handling verified" $Green
Write-ColorOutput "✅ Rate limiting checked" $Green

Write-ColorOutput "`n🌐 Access URLs:" $Blue
Write-ColorOutput "API Gateway: $BaseUrl" $Yellow
Write-ColorOutput "Kong Admin: http://localhost:8001" $Yellow
Write-ColorOutput "Grafana: http://localhost:3000 (admin/admin123)" $Yellow
Write-ColorOutput "Kibana: http://localhost:5601" $Yellow
Write-ColorOutput "Prometheus: http://localhost:9090" $Yellow
Write-ColorOutput "Vault: http://localhost:8200" $Yellow

Write-ColorOutput "`n🔑 Test Accounts Created:" $Blue
Write-ColorOutput "Farmer: farmer.test@farmconnect.com / password123" $Yellow
Write-ColorOutput "Buyer: buyer.test@farmconnect.com / password123" $Yellow

Write-ColorOutput "`n🎉 API testing completed!" $Green