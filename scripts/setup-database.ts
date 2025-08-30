#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing required environment variables:");
  console.error("   NEXT_PUBLIC_SUPABASE_URL");
  console.error("   SUPABASE_SERVICE_ROLE_KEY");
  console.error("\nPlease add these to your .env.local file");
  console.error("\nYou can find these values in your Supabase project settings:");
  console.error("https://supabase.com/dashboard/project/_/settings/api");
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setupDatabase() {
  console.log("🚀 Starting database setup for holydrop.app...\n");

  try {
    // Read the schema file
    const schemaPath = path.join(process.cwd(), "lib", "database", "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Split the schema into individual statements
    // This is a simple split - in production, use a proper SQL parser
    const statements = schema
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ";";
      
      // Extract a description from the statement for logging
      const firstLine = statement.split("\n")[0];
      const description = firstLine.length > 80 
        ? firstLine.substring(0, 77) + "..." 
        : firstLine;

      process.stdout.write(`[${i + 1}/${statements.length}] ${description}`);

      try {
        // Execute the SQL statement
        const { error } = await supabase.rpc("exec_sql", {
          sql: statement,
        }).single();

        if (error) {
          // Check if it's an "already exists" error
          if (error.message.includes("already exists") || 
              error.message.includes("duplicate")) {
            process.stdout.write(" ⏭️  SKIPPED (already exists)\n");
            skipCount++;
          } else {
            throw error;
          }
        } else {
          process.stdout.write(" ✅\n");
          successCount++;
        }
      } catch (error: any) {
        // Try alternative method using direct SQL execution
        try {
          const { error: directError } = await supabase
            .from("_sql")
            .select()
            .eq("query", statement);

          if (directError) {
            throw directError;
          }
          process.stdout.write(" ✅\n");
          successCount++;
        } catch (fallbackError: any) {
          process.stdout.write(" ❌\n");
          console.error(`   Error: ${fallbackError.message || fallbackError}`);
          errorCount++;
        }
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 Setup Summary:");
    console.log("=".repeat(50));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`⏭️  Skipped:    ${skipCount}`);
    console.log(`❌ Failed:     ${errorCount}`);
    console.log("=".repeat(50));

    if (errorCount > 0) {
      console.log("\n⚠️  Some statements failed. This might be okay if:");
      console.log("   - Tables/policies already exist");
      console.log("   - You're running this on an existing database");
      console.log("\nCheck the errors above to ensure everything is set up correctly.");
    } else {
      console.log("\n🎉 Database setup completed successfully!");
    }

    // Test the connection
    console.log("\n🔍 Testing database connection...");
    const { error: testError } = await supabase
      .from("users")
      .select("count")
      .single();

    if (testError && !testError.message.includes("no rows")) {
      console.log("❌ Connection test failed:", testError.message);
      console.log("\nNote: This might be normal if RLS policies are strict.");
    } else {
      console.log("✅ Database connection successful!");
    }

    console.log("\n📝 Next steps:");
    console.log("1. Ensure your Supabase project has email auth enabled");
    console.log("2. Configure OAuth providers (Google) in Supabase dashboard");
    console.log("3. Update .env.local with your actual Supabase credentials");
    console.log("4. Run 'npm run dev' to start the application");

  } catch (error: any) {
    console.error("\n❌ Setup failed with error:", error.message || error);
    process.exit(1);
  }
}

// Alternative setup method if RPC is not available
async function setupDatabaseAlternative() {
  console.log("🚀 Starting database setup (alternative method)...\n");
  
  try {
    // Read the schema file
    const schemaPath = path.join(process.cwd(), "lib", "database", "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    console.log("📄 Schema loaded successfully");
    console.log("\n⚠️  Note: Direct SQL execution via API is not available.");
    console.log("Please run the following SQL in your Supabase SQL editor:\n");
    console.log("1. Go to: https://supabase.com/dashboard/project/_/sql/new");
    console.log("2. Copy and paste the contents of lib/database/schema.sql");
    console.log("3. Click 'Run' to execute the schema\n");
    
    // Save schema to a temp file for easy copying
    const tempPath = path.join(process.cwd(), "schema-to-run.sql");
    fs.writeFileSync(tempPath, schema);
    console.log(`💾 Schema saved to: ${tempPath}`);
    console.log("   You can copy this file's contents to the Supabase SQL editor\n");

    // Try to verify tables exist
    console.log("🔍 Checking if tables exist...");
    
    const tables = ["users", "annotations", "user_highlights", "annotation_votes"];
    let tableCount = 0;

    for (const table of tables) {
      const { error } = await supabase.from(table).select("count").single();
      
      if (!error || error.code === "PGRST116") {
        console.log(`   ✅ Table '${table}' is accessible`);
        tableCount++;
      } else {
        console.log(`   ❌ Table '${table}' is not accessible`);
      }
    }

    if (tableCount === tables.length) {
      console.log("\n✅ All tables are set up and accessible!");
    } else {
      console.log(`\n⚠️  Only ${tableCount}/${tables.length} tables are accessible.`);
      console.log("Please ensure the schema has been run in Supabase SQL editor.");
    }

  } catch (error: any) {
    console.error("\n❌ Setup failed with error:", error.message || error);
    process.exit(1);
  }
}

// Check if we can use RPC, otherwise use alternative method
async function main() {
  console.log("🔧 holydrop.app Database Setup Tool\n");
  
  // Check if RPC function exists
  const { error: rpcError } = await supabase.rpc("exec_sql", {
    sql: "SELECT 1",
  });

  if (rpcError && rpcError.message.includes("not exist")) {
    console.log("ℹ️  RPC function not available, using alternative setup method...\n");
    await setupDatabaseAlternative();
  } else {
    await setupDatabase();
  }
}

// Run the setup
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});