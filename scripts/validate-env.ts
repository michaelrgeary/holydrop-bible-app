import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: '.env.local' });

const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_KEY'
];

console.log('🔍 Checking environment variables...\n');

let allValid = true;

required.forEach(key => {
  const value = process.env[key];
  
  if (!value || value.includes('your-') || value.includes('example')) {
    console.log(`❌ ${key}: Missing or placeholder value`);
    allValid = false;
  } else {
    console.log(`✅ ${key}: Set (${value.substring(0, 20)}...)`);
  }
});

if (allValid) {
  console.log('\n✅ All environment variables are configured!');
  console.log('Run: npm run test:supabase to test the connection');
} else {
  console.log('\n⚠️  Please update .env.local with real Supabase credentials');
  console.log('See SUPABASE_CLOUD_SETUP.md for instructions');
}