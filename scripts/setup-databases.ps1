# Database Setup Script for AVNERA E-commerce (PowerShell)
# This script helps you set up all three databases with their schemas

Write-Host "🚀 AVNERA E-commerce Database Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host

Write-Host "This script will help you set up the three databases for AVNERA:" -ForegroundColor Cyan
Write-Host "1. User Database - Authentication, profiles, preferences" -ForegroundColor Blue
Write-Host "2. Orders Database - Orders, payments, shipments" -ForegroundColor Blue
Write-Host "3. Products Database - Catalog, inventory, reviews" -ForegroundColor Blue
Write-Host

Write-Host "PREREQUISITES:" -ForegroundColor Yellow
Write-Host "1. Three Supabase projects created at https://app.supabase.com"
Write-Host "2. Environment variables configured in .env.local"
Write-Host "3. Node.js installed for testing connections"
Write-Host

# Check if .env.local exists
if (Test-Path ".env.local") {
    Write-Host "✓ Found .env.local file" -ForegroundColor Green
    
    # Read environment file
    $envContent = Get-Content ".env.local"
    $envVars = @{}
    
    foreach ($line in $envContent) {
        if ($line -match "^([^#].+?)=(.+)$") {
            $envVars[$matches[1]] = $matches[2]
        }
    }
    
    # Check User DB
    if ($envVars["NEXT_PUBLIC_SUPABASE_USER_URL"] -and $envVars["NEXT_PUBLIC_SUPABASE_USER_ANON_KEY"]) {
        Write-Host "✓ User Database configuration found" -ForegroundColor Green
    } else {
        Write-Host "✗ User Database configuration missing" -ForegroundColor Red
    }
    
    # Check Orders DB
    if ($envVars["NEXT_PUBLIC_SUPABASE_ORDERS_URL"] -and $envVars["NEXT_PUBLIC_SUPABASE_ORDERS_ANON_KEY"]) {
        Write-Host "✓ Orders Database configuration found" -ForegroundColor Green
    } else {
        Write-Host "! Orders Database configuration missing" -ForegroundColor Yellow
    }
    
    # Check Products DB
    if ($envVars["NEXT_PUBLIC_SUPABASE_PRODUCTS_URL"] -and $envVars["NEXT_PUBLIC_SUPABASE_PRODUCTS_ANON_KEY"]) {
        Write-Host "✓ Products Database configuration found" -ForegroundColor Green
    } else {
        Write-Host "! Products Database configuration missing" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ .env.local file not found" -ForegroundColor Red
}

Write-Host

# Manual setup instructions
Write-Host "MANUAL SETUP INSTRUCTIONS:" -ForegroundColor Cyan
Write-Host
Write-Host "For each database project in Supabase:" -ForegroundColor Yellow
Write-Host "1. Go to https://app.supabase.com"
Write-Host "2. Open your project"
Write-Host "3. Go to SQL Editor"
Write-Host "4. Create a new query"
Write-Host "5. Copy and paste the corresponding schema file content:"
Write-Host
Write-Host "   User Database: " -NoNewline -ForegroundColor Blue
Write-Host "database/user-db/schema.sql"
Write-Host "   Orders Database: " -NoNewline -ForegroundColor Blue
Write-Host "database/orders-db/schema.sql"
Write-Host "   Products Database: " -NoNewline -ForegroundColor Blue
Write-Host "database/products-db/schema.sql"
Write-Host
Write-Host "6. Run the query to create all tables and functions"
Write-Host

# Test connections
Write-Host "Testing current database connections..." -ForegroundColor Cyan
Write-Host

if (Get-Command node -ErrorAction SilentlyContinue) {
    & node scripts/test-db-connections.js
} else {
    Write-Host "Node.js not found. Cannot run connection test." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org" -ForegroundColor Yellow
}

Write-Host
Write-Host "🔗 Useful Resources:" -ForegroundColor Green
Write-Host "• Setup Instructions: database/SETUP_INSTRUCTIONS.md"
Write-Host "• Supabase Dashboard: https://app.supabase.com"
Write-Host "• Documentation: https://supabase.com/docs"
Write-Host
Write-Host "After setting up the schemas, run:" -ForegroundColor Cyan
Write-Host "npm run test:db-connections" -ForegroundColor Yellow
Write-Host
