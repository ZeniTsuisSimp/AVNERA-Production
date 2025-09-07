#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests connections to all three databases and verifies schema setup
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testDatabase(name, url, anonKey, expectedTables) {
  log(`\n📡 Testing ${name} Database...`, 'cyan');
  
  if (!url || !anonKey) {
    log(`❌ Missing environment variables for ${name}`, 'red');
    log(`   URL: ${url ? '✓' : '❌'}`, 'yellow');
    log(`   Anon Key: ${anonKey ? '✓' : '❌'}`, 'yellow');
    return false;
  }

  try {
    const supabase = createClient(url, anonKey);
    
    // Test connection by trying to query each expected table
    let foundTables = [];
    let connectionError = null;
    
    for (const tableName of expectedTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
          
        if (!error) {
          foundTables.push(tableName);
        }
      } catch (err) {
        // Table doesn't exist or other error
        if (!connectionError) {
          connectionError = err;
        }
      }
    }

    // Check if we have a connection error
    if (foundTables.length === 0 && connectionError) {
      log(`❌ Connection failed: ${connectionError.message}`, 'red');
      return false;
    }
    log(`✅ Connection successful`, 'green');
    log(`📊 Found ${foundTables.length}/${expectedTables.length} expected tables`, 'blue');
    
    // Check which tables are missing
    const missingTables = expectedTables.filter(table => !foundTables.includes(table));
    if (missingTables.length > 0) {
      log(`⚠️  Missing tables: ${missingTables.join(', ')}`, 'yellow');
    } else {
      log(`✅ All expected tables found`, 'green');
    }

    return missingTables.length === 0;

  } catch (err) {
    log(`❌ Connection error: ${err.message}`, 'red');
    return false;
  }
}

async function testAllDatabases() {
  log('🔍 Testing Database Connections for AVNERA E-commerce', 'magenta');
  log('=' .repeat(60), 'blue');

  const results = [];

  // Test User Database
  results.push(await testDatabase(
    'User',
    process.env.NEXT_PUBLIC_SUPABASE_USER_URL,
    process.env.NEXT_PUBLIC_SUPABASE_USER_ANON_KEY,
    ['user_profiles', 'user_addresses']
  ));

  // Test Orders Database
  results.push(await testDatabase(
    'Orders',
    process.env.NEXT_PUBLIC_SUPABASE_ORDERS_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ORDERS_ANON_KEY,
    ['orders', 'order_items', 'payments']
  ));

  // Test Products Database
  results.push(await testDatabase(
    'Products',
    process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_ANON_KEY,
    ['products', 'categories', 'shopping_cart', 'wishlists', 'product_reviews']
  ));

  // Summary
  log('\n' + '=' .repeat(60), 'blue');
  log('📋 Summary:', 'magenta');
  
  const successCount = results.filter(Boolean).length;
  const totalCount = results.length;

  if (successCount === totalCount) {
    log(`✅ All ${totalCount} databases are properly configured!`, 'green');
    log('\n🚀 You can now start using the multi-database architecture.', 'cyan');
  } else {
    log(`⚠️  ${successCount}/${totalCount} databases are properly configured.`, 'yellow');
    log('\n📝 Please check the missing databases and run their schema SQL files.', 'yellow');
    log('\n📚 Refer to database/SETUP_INSTRUCTIONS.md for detailed setup steps.', 'blue');
  }

  log('\n🔗 Useful Links:', 'cyan');
  log('   • Supabase Dashboard: https://app.supabase.com', 'blue');
  log('   • User DB Schema: database/user-db/schema.sql', 'blue');
  log('   • Orders DB Schema: database/orders-db/schema.sql', 'blue');
  log('   • Products DB Schema: database/products-db/schema.sql', 'blue');
}

// Run the tests
testAllDatabases().catch(console.error);
