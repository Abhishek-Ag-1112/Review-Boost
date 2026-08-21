const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Load .env.local manually
const envPath = path.join(__dirname, '.env.local');
let env = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?$/);
    if (match) {
      let value = match[2] ? match[2].trim() : '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      value = value.replace(/\\n/g, '\n');
      env[match[1]] = value;
    }
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = (env.NEXT_PUBLIC_ADMIN_EMAIL || env.ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@reviewboost.com').toLowerCase().trim();

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local");
  process.exit(1);
}

console.log("=================================================");
console.log("   🧹 SUPABASE DATA RESET (PRESERVING ADMIN)   ");
console.log("=================================================");
console.log("Supabase URL :", supabaseUrl);
console.log("Admin Email  :", adminEmail);
console.log("-------------------------------------------------");

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function clearTable(tableName, idColumn = 'id') {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .delete()
      .not(idColumn, 'is', null);

    if (error) {
      // Table might not exist or empty
      console.warn(`  ⚠️  Table '${tableName}': ${error.message}`);
    } else {
      console.log(`  ✅ Table '${tableName}' cleared.`);
    }
  } catch (err) {
    console.warn(`  ⚠️  Table '${tableName}': ${err.message}`);
  }
}

async function cleanStorage(bucketName = 'business-logos') {
  try {
    const { data: files, error: listError } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 1000 });

    if (listError) {
      console.warn(`  ⚠️  Storage bucket '${bucketName}': ${listError.message}`);
      return;
    }

    if (files && files.length > 0) {
      const filePaths = files.map(f => f.name).filter(name => name !== '.emptyFolderPlaceholder');
      if (filePaths.length > 0) {
        const { error: removeError } = await supabase.storage
          .from(bucketName)
          .remove(filePaths);
        if (removeError) {
          console.warn(`  ⚠️  Failed to remove files from storage: ${removeError.message}`);
        } else {
          console.log(`  ✅ Storage bucket '${bucketName}' cleared (${filePaths.length} files removed).`);
        }
      } else {
        console.log(`  ✅ Storage bucket '${bucketName}' is already empty.`);
      }
    } else {
      console.log(`  ✅ Storage bucket '${bucketName}' is already empty.`);
    }
  } catch (err) {
    console.warn(`  ⚠️  Storage cleanup error: ${err.message}`);
  }
}

async function cleanAuthUsers() {
  console.log("\n🔒 Cleaning Auth Users (preserving admin account)...");
  try {
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (listError) {
      console.error("  ❌ Failed to fetch auth users:", listError.message);
      return;
    }

    console.log(`  Found ${users.length} total user(s) in auth.users.`);
    let deletedCount = 0;
    let preservedCount = 0;

    for (const user of users) {
      const userEmail = (user.email || '').toLowerCase().trim();
      if (userEmail === adminEmail) {
        console.log(`  🛡️  PRESERVED Admin User: ${userEmail} (ID: ${user.id})`);
        preservedCount++;
      } else {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        if (deleteError) {
          console.warn(`  ⚠️  Failed to delete user ${userEmail}: ${deleteError.message}`);
        } else {
          console.log(`  🗑️  Deleted user: ${userEmail || user.id}`);
          deletedCount++;
        }
      }
    }

    console.log(`  Summary: ${deletedCount} non-admin user(s) deleted, ${preservedCount} admin user(s) preserved.`);
  } catch (err) {
    console.error("  ❌ Auth cleanup error:", err.message);
  }
}

async function runCleanup() {
  console.log("\n🗑️  Clearing Database Tables in foreign-key order...");

  // Delete in dependency order (children first, parents last)
  await clearTable('reviews');
  await clearTable('qr_scans');
  await clearTable('nfc_cards');
  await clearTable('locations');
  await clearTable('subscriptions');
  await clearTable('upgrade_requests');
  await clearTable('contact_inquiries');
  await clearTable('businesses');

  console.log("\n📦 Cleaning Storage Buckets...");
  await cleanStorage('business-logos');

  await cleanAuthUsers();

  console.log("\n=================================================");
  console.log("   ✨ CLEANUP COMPLETED SUCCESSFULLY! ✨        ");
  console.log("=================================================");
}

runCleanup();
