# Supabase Cloud Setup Instructions

## Step 1: Create Free Supabase Account

1. Go to https://supabase.com
2. Click "Start your project" (it's free)
3. Sign up with GitHub or email
4. Create a new project with these settings:
   - Project name: "holydrop-bible" (or your preference)
   - Database Password: [Choose a strong password and save it]
   - Region: Choose closest to you
   - Plan: Free tier (default)

## Step 2: Get Your Credentials

Once the project is created (takes ~2 minutes), you'll need:

1. Go to Settings → API
2. Copy these values:
   - Project URL (looks like: https://xxxxxxxxxxxx.supabase.co)
   - anon public key (starts with: eyJ...)
   - service_role key (keep this SECRET - starts with: eyJ...)

## Step 3: Provide Credentials

Share these with Claude Code to update the .env.local file:
- NEXT_PUBLIC_SUPABASE_URL=[your project URL]
- NEXT_PUBLIC_SUPABASE_ANON_KEY=[your anon key]
- SUPABASE_SERVICE_KEY=[your service_role key]

## Step 4: Database Password

You'll also need the database password you created for running migrations.