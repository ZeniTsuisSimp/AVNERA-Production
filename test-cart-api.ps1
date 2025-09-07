# PowerShell script to test the cart API with proper UUIDs

Write-Host "Testing Cart API with proper UUID format" -ForegroundColor Green
Write-Host ""

# First, let's create some sample products
Write-Host "1. Creating sample products..." -ForegroundColor Yellow
try {
    $createResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/test/create-products" -Method POST -ContentType "application/json"
    $createData = $createResponse.Content | ConvertFrom-Json
    
    if ($createData.success) {
        Write-Host "✓ Products created successfully" -ForegroundColor Green
        if ($createData.data.products -and $createData.data.products.Count -gt 0) {
            $firstProductId = $createData.data.products[0].id
            Write-Host "  Sample Product ID: $firstProductId" -ForegroundColor Cyan
        }
    } else {
        Write-Host "✗ Failed to create products: $($createData.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Error creating products: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Get existing products to get real UUIDs
Write-Host "2. Fetching existing products..." -ForegroundColor Yellow
try {
    $productsResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method GET
    $productsData = $productsResponse.Content | ConvertFrom-Json
    
    if ($productsData.success -and $productsData.data.Count -gt 0) {
        Write-Host "✓ Found $($productsData.data.Count) products" -ForegroundColor Green
        $testProductId = $productsData.data[0].id
        $productName = $productsData.data[0].name
        Write-Host "  Using product: $productName (ID: $testProductId)" -ForegroundColor Cyan
        
        Write-Host ""
        
        # Now test adding to cart with proper UUID
        Write-Host "3. Testing cart API with proper UUID..." -ForegroundColor Yellow
        
        $cartPayload = @{
            product_id = $testProductId
            quantity = 1
        } | ConvertTo-Json
        
        try {
            $cartResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/cart" -Method POST -Body $cartPayload -ContentType "application/json"
            $cartData = $cartResponse.Content | ConvertFrom-Json
            
            if ($cartData.success) {
                Write-Host "✓ Successfully added item to cart!" -ForegroundColor Green
                Write-Host "  Message: $($cartData.message)" -ForegroundColor Cyan
            } else {
                Write-Host "✗ Failed to add to cart: $($cartData.error)" -ForegroundColor Red
            }
        } catch {
            Write-Host "✗ Error adding to cart: $($_.Exception.Message)" -ForegroundColor Red
            if ($_.Exception.Response) {
                $errorResponse = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($errorResponse)
                $errorContent = $reader.ReadToEnd()
                Write-Host "  Response: $errorContent" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "✗ No products found. Please create products first." -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Error fetching products: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test completed!" -ForegroundColor Green
