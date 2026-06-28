const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
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

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function run() {
  console.log("=== CHECKING DATABASE FOR DUPLICATE KEY 52725423-bb8b-4cbd-ba5e-735896852e8c ===");
  const targetId = '52725423-bb8b-4cbd-ba5e-735896852e8c';

  // Check businesses
  const { data: bus, error: busErr } = await supabase.from('businesses').select('*');
  if (busErr) console.error("Error reading businesses:", busErr);
  else {
    console.log(`Found ${bus.length} businesses.`);
    const matchingBus = bus.filter(b => b.id === targetId);
    if (matchingBus.length > 0) {
      console.log("Matching Business(es):", matchingBus);
    }
    const busIds = bus.map(b => b.id);
    const duplicates = busIds.filter((item, index) => busIds.indexOf(item) !== index);
    if (duplicates.length > 0) {
      console.log("Duplicate Business IDs in DB:", duplicates);
    }
  }

  // Check reviews
  const { data: rev, error: revErr } = await supabase.from('reviews').select('*');
  if (revErr) console.error("Error reading reviews:", revErr);
  else {
    console.log(`Found ${rev.length} reviews.`);
    const matchingRev = rev.filter(r => r.id === targetId);
    if (matchingRev.length > 0) {
      console.log("Matching Review(es):", matchingRev);
    }
    const revIds = rev.map(r => r.id);
    const duplicates = revIds.filter((item, index) => revIds.indexOf(item) !== index);
    if (duplicates.length > 0) {
      console.log("Duplicate Review IDs in DB:", duplicates);
    }
  }

  // Check upgrade requests
  const { data: ur, error: urErr } = await supabase.from('upgrade_requests').select('*');
  if (urErr) console.error("Error reading upgrade_requests:", urErr);
  else {
    console.log(`Found ${ur.length} upgrade requests.`);
    const matchingUr = ur.filter(u => u.id === targetId);
    if (matchingUr.length > 0) {
      console.log("Matching Upgrade Request(s):", matchingUr);
    }
    const urIds = ur.map(u => u.id);
    const duplicates = urIds.filter((item, index) => urIds.indexOf(item) !== index);
    if (duplicates.length > 0) {
      console.log("Duplicate Upgrade Request IDs in DB:", duplicates);
    }
  }
}
run();
