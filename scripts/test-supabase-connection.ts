#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Check if credentials are set
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local')
    console.log('\nPlease update .env.local with:')
    console.log('NEXT_PUBLIC_SUPABASE_URL=your_project_url')
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key\n')
    process.exit(1)
  }

  // Check for placeholder values
  if (supabaseUrl.includes('example') || supabaseKey.includes('placeholder')) {
    console.error('❌ Placeholder values detected in .env.local')
    console.log('\nCurrent values:')
    console.log(`NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}`)
    console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey.substring(0, 20)}...\n`)
    console.log('Please replace with real Supabase credentials from:')
    console.log('1. Local: Run "npx supabase start" (requires Docker)')
    console.log('2. Cloud: Create project at https://supabase.com\n')
    process.exit(1)
  }

  console.log('📡 Connecting to Supabase...')
  console.log(`URL: ${supabaseUrl}\n`)

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Test 1: Check if we can connect
    console.log('Test 1: Basic connection...')
    const { error: healthError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (healthError) {
      if (healthError.message.includes('relation "public.profiles" does not exist')) {
        console.log('⚠️  Tables not created yet. Run migrations first:')
        console.log('   npx supabase db push\n')
      } else {
        console.error('❌ Connection failed:', healthError.message)
      }
      process.exit(1)
    }

    console.log('✅ Connected successfully!\n')

    // Test 2: Check tables
    console.log('Test 2: Checking tables...')
    const tables = ['profiles', 'annotations', 'votes', 'highlights']
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.log(`❌ Table '${table}' - Error: ${error.message}`)
      } else {
        console.log(`✅ Table '${table}' - Found (${count ?? 0} records)`)
      }
    }

    // Test 3: Check RLS policies
    console.log('\nTest 3: Checking Row Level Security...')
    const { data: annotations, error: rlsError } = await supabase
      .from('annotations')
      .select('*')
      .limit(5)

    if (rlsError) {
      console.log('⚠️  RLS Error:', rlsError.message)
    } else {
      console.log(`✅ RLS policies active (${annotations?.length ?? 0} annotations visible)`)
    }

    // Test 4: Auth status
    console.log('\nTest 4: Checking auth configuration...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log('ℹ️  No authenticated user (this is normal for anon access)')
    } else {
      console.log(`✅ Authenticated as: ${user.email}`)
    }

    console.log('\n🎉 Supabase connection test complete!')
    console.log('\nNext steps:')
    console.log('1. If tables are missing, run: npx supabase db push')
    console.log('2. To seed sample data, run: npx supabase db seed')
    console.log('3. Update app code to use real Supabase client instead of mock data')

  } catch (error) {
    console.error('\n❌ Unexpected error:', error)
    process.exit(1)
  }
}

// Run the test
testConnection().catch(console.error)