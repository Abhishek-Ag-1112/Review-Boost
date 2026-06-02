const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env.local manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?$/);
  if (match) {
    let value = match[2] ? match[2].trim() : '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    // Handle escaped newlines in private key
    value = value.replace(/\\n/g, '\n');
    env[match[1]] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Service Key defined:", !!supabaseServiceKey);

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function run() {
  console.log("Executing query...");
  const { data, error } = await supabase.from('businesses').select('*').limit(1);
  if (error) {
    console.error("Error reading businesses table:", error);
  } else {
    console.log("Successfully connected. Data sample:", data);
    if (data.length > 0) {
      console.log("Table columns in data:", Object.keys(data[0]));
    } else {
      // If table is empty, let's try to query database information schema if possible, or just print success
      console.log("Businesses table is empty. Let's try to insert a dummy row or fetch columns.");
      // We can query using RPC if it exists, or just attempt a schema query
    }
  }
}
run();
