const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env.local manually
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

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = env.NEXT_PUBLIC_ADMIN_EMAIL || env.ADMIN_EMAIL || 'admin@reviewboost.com';
const adminPassword = process.argv[2] || 'adminpassword123'; // Default fallback password

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local");
  process.exit(1);
}

console.log("Supabase URL:", supabaseUrl);
console.log("Admin Email to create/update:", adminEmail);

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function createAdminUser() {
  try {
    console.log("Checking users in Supabase auth...");
    
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const existingUser = users.find(u => u.email.toLowerCase() === adminEmail.toLowerCase());

    if (existingUser) {
      console.log(`User ${adminEmail} already exists. Updating password and confirming email...`);
      const { data, error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        { 
          password: adminPassword,
          email_confirm: true
        }
      );
      if (updateError) throw updateError;
      console.log(`Successfully updated admin user password!`);
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
    } else {
      console.log(`User ${adminEmail} not found. Creating new admin user...`);
      const { data, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true
      });
      if (createError) throw createError;
      console.log(`Successfully created admin user!`);
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
    }
  } catch (error) {
    console.error("Error creating/updating admin user:", error.message || error);
    process.exit(1);
  }
}

createAdminUser();
