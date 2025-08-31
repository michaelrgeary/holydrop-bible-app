import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.log('Please update .env.local with your Supabase project credentials');
  process.exit(1);
}

// Check if we have real credentials (not placeholders)
if (supabaseUrl.includes('example.supabase.co')) {
  console.error('❌ Still using placeholder Supabase URL');
  console.log('Please update .env.local with real Supabase credentials');
  console.log('See SUPABASE_CLOUD_SETUP.md for instructions');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  console.log('🔄 Testing Supabase connection...');
  console.log(`   URL: ${supabaseUrl}`);
  
  try {
    // Test basic connection
    const { data: _data, error } = await supabase.from('annotations').select('count');
    
    if (error && error.code === '42P01') {
      console.log('✅ Connected to Supabase successfully!');
      console.log('📝 Tables not yet created - ready to run migrations');
      return true;
    } else if (error) {
      console.error('❌ Connection error:', error.message);
      return false;
    } else {
      console.log('✅ Connected to Supabase successfully!');
      console.log('✅ Tables already exist');
      return true;
    }
  } catch (err) {
    console.error('❌ Failed to connect:', err);
    return false;
  }
}

async function main() {
  const connected = await testConnection();
  
  if (connected) {
    console.log('\n📋 Next Steps:');
    console.log('1. Run migrations using Supabase CLI:');
    console.log('   npx supabase db push --db-url [your-database-url]');
    console.log('\n2. Or apply migrations through Supabase Dashboard:');
    console.log('   - Go to SQL Editor in your Supabase project');
    console.log('   - Paste contents of supabase/migrations/001_initial_schema.sql');
    console.log('   - Click "Run"');
    console.log('\n3. Then test the app:');
    console.log('   npm run dev');
  }
}

main();