# Supabase Setup Guide

## Current Status
- ✅ Supabase CLI installed (v2.39.2)
- ✅ Supabase project initialized
- ✅ Database schema created in migrations
- ⚠️ Local Supabase blocked (Docker not installed)
- ⏳ Awaiting cloud Supabase connection

## Database Schema Created

### Tables
1. **profiles** - User profiles linked to auth.users
2. **annotations** - Bible verse annotations
3. **votes** - Upvotes/downvotes for annotations
4. **highlights** - Text selection ranges for annotations

### Security
- Row Level Security (RLS) enabled on all tables
- Policies ensure users can only modify their own content
- Public read access for all annotations and votes

## Option 1: Local Development (Requires Docker)

```bash
# Install Docker Desktop first
# Then run:
npx supabase start

# This will provide local credentials:
# - API URL: http://localhost:54321
# - GraphQL URL: http://localhost:54321/graphql/v1
# - DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# - Studio URL: http://localhost:54323
# - Anon key: [will be displayed]
# - Service key: [will be displayed]
```

## Option 2: Cloud Supabase (Recommended)

### Steps to Connect:

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Save the project URL and anon key

2. **Update Environment Variables**
   ```bash
   # In .env.local, replace with your actual values:
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
   ```

3. **Run Migrations**
   ```bash
   # Link to your cloud project
   npx supabase link --project-ref YOUR_PROJECT_REF
   
   # Push migrations
   npx supabase db push
   
   # Optional: Run seed data
   npx supabase db seed
   ```

4. **Verify Connection**
   ```bash
   # Check migration status
   npx supabase migration list
   
   # Open Supabase Studio
   npx supabase studio
   ```

## Migration Files Created

### `/supabase/migrations/001_initial_schema.sql`
- Creates all tables with proper relationships
- Sets up Row Level Security policies
- Adds performance indexes
- Creates helper functions for vote counting

### `/supabase/seed.sql`
- Sample user profiles
- Example annotations for Genesis 1:1 and John 3:16
- Sample votes to demonstrate functionality

## Next Steps

1. **Get Supabase Credentials**
   - Either install Docker for local development
   - Or create a free cloud project at supabase.com

2. **Update Environment Variables**
   - Replace placeholder values in `.env.local`

3. **Run Migrations**
   - Apply the schema to your database

4. **Update Application Code**
   - The app is currently using mock data
   - Need to replace with real Supabase client calls
   - Authentication needs to use Supabase Auth

## Testing the Connection

Once connected, you can test with:

```typescript
// In any component or API route
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Test query
const { data, error } = await supabase
  .from('annotations')
  .select('*')
  .limit(5)

if (error) console.error('Connection failed:', error)
else console.log('Connected! Data:', data)
```

## Security Notes

- Never commit real Supabase keys to git
- Use environment variables for all sensitive data
- RLS policies are crucial for data security
- Always test policies in Supabase Studio before production