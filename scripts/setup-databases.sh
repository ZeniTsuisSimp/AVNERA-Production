#!/bin/bash

# Database Setup Script for AVNERA E-commerce
# This script helps you set up all three databases with their schemas

echo "🚀 AVNERA E-commerce Database Setup"
echo "====================================="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}This script will help you set up the three databases for AVNERA:${NC}"
echo -e "${BLUE}1. User Database - Authentication, profiles, preferences${NC}"
echo -e "${BLUE}2. Orders Database - Orders, payments, shipments${NC}"
echo -e "${BLUE}3. Products Database - Catalog, inventory, reviews${NC}"
echo

echo -e "${YELLOW}PREREQUISITES:${NC}"
echo "1. Three Supabase projects created at https://app.supabase.com"
echo "2. Environment variables configured in .env.local"
echo "3. Supabase CLI installed (optional, for automated setup)"
echo

# Check if Supabase CLI is installed
if command -v supabase &> /dev/null; then
    echo -e "${GREEN}✓ Supabase CLI found${NC}"
    CLI_AVAILABLE=true
else
    echo -e "${YELLOW}! Supabase CLI not found${NC}"
    echo "  Install with: npm i -g supabase"
    CLI_AVAILABLE=false
fi

echo

# Check environment variables
echo -e "${CYAN}Checking environment variables...${NC}"

if [ -f .env.local ]; then
    source .env.local
    
    # Check User DB
    if [ -n "$NEXT_PUBLIC_SUPABASE_USER_URL" ] && [ -n "$NEXT_PUBLIC_SUPABASE_USER_ANON_KEY" ]; then
        echo -e "${GREEN}✓ User Database configuration found${NC}"
        USER_DB_OK=true
    else
        echo -e "${RED}✗ User Database configuration missing${NC}"
        USER_DB_OK=false
    fi
    
    # Check Orders DB
    if [ -n "$NEXT_PUBLIC_SUPABASE_ORDERS_URL" ] && [ -n "$NEXT_PUBLIC_SUPABASE_ORDERS_ANON_KEY" ]; then
        echo -e "${GREEN}✓ Orders Database configuration found${NC}"
        ORDERS_DB_OK=true
    else
        echo -e "${YELLOW}! Orders Database configuration missing${NC}"
        ORDERS_DB_OK=false
    fi
    
    # Check Products DB
    if [ -n "$NEXT_PUBLIC_SUPABASE_PRODUCTS_URL" ] && [ -n "$NEXT_PUBLIC_SUPABASE_PRODUCTS_ANON_KEY" ]; then
        echo -e "${GREEN}✓ Products Database configuration found${NC}"
        PRODUCTS_DB_OK=true
    else
        echo -e "${YELLOW}! Products Database configuration missing${NC}"
        PRODUCTS_DB_OK=false
    fi
else
    echo -e "${RED}✗ .env.local file not found${NC}"
    USER_DB_OK=false
    ORDERS_DB_OK=false
    PRODUCTS_DB_OK=false
fi

echo

# Manual setup instructions
echo -e "${CYAN}MANUAL SETUP INSTRUCTIONS:${NC}"
echo
echo -e "${YELLOW}For each database project in Supabase:${NC}"
echo "1. Go to https://app.supabase.com"
echo "2. Open your project"
echo "3. Go to SQL Editor"
echo "4. Create a new query"
echo "5. Copy and paste the corresponding schema file content:"
echo
echo -e "${BLUE}   User Database:${NC} database/user-db/schema.sql"
echo -e "${BLUE}   Orders Database:${NC} database/orders-db/schema.sql"
echo -e "${BLUE}   Products Database:${NC} database/products-db/schema.sql"
echo
echo "6. Run the query to create all tables and functions"
echo

# Test connections
echo -e "${CYAN}Testing current database connections...${NC}"
echo

if command -v node &> /dev/null; then
    node scripts/test-db-connections.js
else
    echo -e "${RED}Node.js not found. Cannot run connection test.${NC}"
fi

echo
echo -e "${GREEN}🔗 Useful Resources:${NC}"
echo "• Setup Instructions: database/SETUP_INSTRUCTIONS.md"
echo "• Supabase Dashboard: https://app.supabase.com"
echo "• Documentation: https://supabase.com/docs"
echo
echo -e "${CYAN}After setting up the schemas, run:${NC}"
echo -e "${YELLOW}npm run test:db-connections${NC}"
echo
