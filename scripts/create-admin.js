/**
 * Script to create the initial admin user
 * Run this after setting up your Supabase database
 * 
 * Usage:
 * node scripts/create-admin.js your-email@example.com password123 FirstName LastName
 * 
 * Make sure to set these environment variables first:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SB_SECRET
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from apps/web/.env.local
dotenv.config({ path: path.resolve(__dirname, '../apps/web/.env.local') });

const [email, password, firstName, lastName] = process.argv.slice(2);

if (!email || !password || !firstName || !lastName) {
  console.error('Usage: node scripts/create-admin.js <email> <password> <firstName> <lastName>');
  process.exit(1);
}

// Check environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SB_SECRET) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SB_SECRET');
  console.error('\nMake sure to set these in apps/web/.env.local');
  process.exit(1);
}

async function createInitialAdmin(email, password, firstName, lastName) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SB_SECRET
  );
  
  // Create Supabase auth user
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
    }
  });
  
  if (authError || !authUser.user) {
    throw new Error(`Failed to create admin auth user: ${authError?.message}`);
  }
  
  // Create admin user profile
  const { error: userError } = await supabase
    .from('users')
    .insert({
      id: authUser.user.id,
      username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
      email,
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`,
      role: 'admin',
      is_verified: true,
      approved_at: new Date().toISOString(),
    });
    
  if (userError) {
    // Clean up auth user on failure
    await supabase.auth.admin.deleteUser(authUser.user.id);
    throw new Error(`Failed to create admin user profile: ${userError.message}`);
  }
  
  return authUser.user;
}

async function main() {
  try {
    console.log('Creating initial admin user...');
    console.log(`Email: ${email}`);
    console.log(`Name: ${firstName} ${lastName}`);
    console.log('');
    
    const user = await createInitialAdmin(email, password, firstName, lastName);
    
    console.log('✅ Admin user created successfully!');
    console.log('User ID:', user.id);
    console.log('Email:', user.email);
    console.log('\n🎉 You can now login to the admin dashboard at /admin');
  } catch (error) {
    console.error('❌ Failed to create admin user:', error.message);
    process.exit(1);
  }
}

main();