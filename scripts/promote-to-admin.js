/**
 * Script to promote an existing user to admin role
 * 
 * Usage:
 * node scripts/promote-to-admin.js user-email@example.com
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

const [email] = process.argv.slice(2);

if (!email) {
  console.error('Usage: node scripts/promote-to-admin.js <email>');
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

async function promoteUserToAdmin(email) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SB_SECRET
  );
  
  // First check if user exists
  const { data: user, error: findError } = await supabase
    .from('users')
    .select('id, email, role, first_name, last_name')
    .eq('email', email)
    .single();
    
  if (findError || !user) {
    throw new Error(`User with email ${email} not found`);
  }
  
  if (user.role === 'admin') {
    console.log(`✅ User ${email} is already an admin`);
    return user;
  }
  
  // Update user role to admin
  const { error: updateError } = await supabase
    .from('users')
    .update({ 
      role: 'admin',
      is_verified: true,
      updated_at: new Date().toISOString()
    })
    .eq('email', email);
    
  if (updateError) {
    throw new Error(`Failed to promote user to admin: ${updateError.message}`);
  }
  
  return user;
}

async function main() {
  try {
    console.log(`Promoting user to admin: ${email}`);
    console.log('');
    
    const user = await promoteUserToAdmin(email);
    
    console.log('✅ User promoted to admin successfully!');
    console.log('User ID:', user.id);
    console.log('Email:', user.email);
    console.log('Name:', `${user.first_name} ${user.last_name}`);
    console.log('\n🎉 User can now access the admin dashboard at /admin');
    console.log('💡 User may need to sign out and sign back in for changes to take effect');
  } catch (error) {
    console.error('❌ Failed to promote user to admin:', error.message);
    process.exit(1);
  }
}

main();