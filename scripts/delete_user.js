import dotenv from 'dotenv';
dotenv.config({ path: './apps/web/.env.local' });
import { createClient } from '@supabase/supabase-js';



async function deleteUser(email, dropProspect = false) {

    async function createServerSupabaseAdmin() {
        // Check for required environment variables
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
            throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is missing');
        }

        if (!process.env.SUPABASE_SB_SECRET) {
            throw new Error('SUPABASE_SB_SECRET environment variable is missing');
        }

        // Use createClient for admin operations with secret key - no cookies needed
        return createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SB_SECRET, // Admin secret key for elevated operations
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false,
                },
            }
        );
    }
    const supabase = await createServerSupabaseAdmin();

    try {
        console.log(`Deleting user with email: ${email}`);


        // Step 2: Delete from users table
        const { error: deleteUserError } = await supabase
            .from('users')
            .delete()
            .eq('email', email);

        if (deleteUserError) {
            throw new Error(`Failed to delete user from users table: ${deleteUserError.message}`);
        }

        console.log(`User with email ${email} deleted from users table.`);



        // Step 1: Delete the auth user
        const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();

        if (authError) {
            throw new Error(`Failed to fetch auth users: ${authError.message}`);
        }

        const userToDelete = authUser.users.find((user) => user.email === email);
        console.log(userToDelete);

        if (userToDelete) {
            const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userToDelete.id);

            if (deleteAuthError) {
                throw new Error(`Failed to delete auth user: ${deleteAuthError.message}`);
            }

            console.log(`Auth user with email ${email} deleted successfully.`);
        } else {
            console.log(`No auth user found with email ${email}.`);
        }

        // Step 3: Handle prospect_users table
        if (dropProspect) {
            const { error: deleteProspectError } = await supabase
                .from('prospect_users')
                .delete()
                .eq('email', email);

            if (deleteProspectError) {
                throw new Error(`Failed to delete prospect user: ${deleteProspectError.message}`);
            }

            console.log(`Prospect user with email ${email} deleted successfully.`);
        } else {

            
            const { error: updateProspectError } = await supabase
                .from('prospect_users')
                .update({ status: 'pending' })
                .eq('email', email);

            if (updateProspectError) {
                throw new Error(`Failed to update prospect user status: ${updateProspectError.message}`);
            }

            console.log(`Prospect user with email ${email} set to pending status.`);
        }
    } catch (error) {
        console.error(`Error deleting user: ${error.message}`);
    }
}

// Command-line arguments
const email = process.argv[2];
const dropProspect = process.argv[3] === 'true';

if (!email) {
    console.error('Usage: node delete_user <email> <drop_prospect>');
    process.exit(1);
}

deleteUser(email, dropProspect);