import 'dotenv/config'; // Load environment variables from .env file
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Log configuration details for debugging
console.log('Admin Setup Script');
console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`Service role key provided: ${supabaseServiceKey ? 'Yes' : 'No'}`);

// Make sure we have the required environment variables
if (!supabaseUrl) {
  console.error('Error: VITE_SUPABASE_URL is required for this script.');
  console.error('\nPlease follow these steps:');
  console.error('1. Create a .env file in the root directory if it doesn\'t exist');
  console.error('2. Add your Supabase URL to the .env file:');
  console.error('   VITE_SUPABASE_URL=your-supabase-url');
  console.error('\nYou can find your Supabase URL in the Supabase dashboard:');
  console.error('- Go to https://app.supabase.io');
  console.error('- Select your project');
  console.error('- Go to Project Settings > API');
  process.exit(1);
}

// Make sure we have the service role key for admin operations
if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is required for this script.');
  console.error('\nPlease follow these steps:');
  console.error('1. Create a .env file in the root directory if it doesn\'t exist');
  console.error('2. Add your Supabase service role key to the .env file:');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  console.error('\nYou can find your service role key in the Supabase dashboard:');
  console.error('- Go to https://app.supabase.io');
  console.error('- Select your project');
  console.error('- Go to Project Settings > API');
  console.error('- Copy the "service_role key" (NOT the anon key)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const ADMIN_USERS = [
  { email: 'pamacomkb@gmail.com', password: 'Yarima@505' },
  { email: 'yarimaind@gmail.com', password: 'Yarima@505' },
  { email: 'pamacospares@gmail.com', password: 'Yarima@505' },
  { email: 'fortunemillstores@gmail.com', password: 'Yarima@505' },
];

const setupAdmins = async () => {
  try {
    console.log('Starting admin setup process...');
    console.log(`Will set up ${ADMIN_USERS.length} admin users`);

    for (const admin of ADMIN_USERS) {
      console.log(`\n----- Processing admin user: ${admin.email} -----`);
      
      // First try to get user by email
      console.log(`Looking up user ${admin.email}`);
      
      const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers();
      
      if (getUserError) {
        console.error(`Error getting user list:`, getUserError);
        continue;
      }
      
      console.log(`Found ${users?.length || 0} users in the system`);
      const existingUser = users?.find(user => user.email === admin.email);
      
      if (existingUser) {
        console.log(`User ${admin.email} exists with ID: ${existingUser.id}`);
        
        // Update the user's password and metadata
        console.log(`Updating password and role for ${admin.email}`);
        
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          { 
            password: admin.password,
            email_confirm: true,
            user_metadata: { role: 'admin' },
            app_metadata: { role: 'admin' }
          }
        );
        
        if (updateError) {
          console.error(`Error updating user ${admin.email}:`, updateError);
          continue;
        }
        
        console.log(`Updated user ${admin.email} successfully`);
      } else {
        console.log(`User ${admin.email} does not exist, creating new user`);
        
        // Create the user
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: admin.email,
          password: admin.password,
          email_confirm: true,
          user_metadata: { role: 'admin' },
          app_metadata: { role: 'admin' }
        });
        
        if (createError) {
          console.error(`Error creating user ${admin.email}:`, createError);
          continue;
        }
        
        console.log(`Created new admin user ${admin.email} with ID: ${newUser?.user?.id || 'unknown'}`);
      }
      
      console.log(`Admin user ${admin.email} set up successfully`);
    }

    console.log('\nAdmin setup process completed.');
  } catch (error) {
    console.error('Error setting up admin users:', error);
  }
};

console.log('\n===== STARTING ADMIN SETUP SCRIPT =====');
setupAdmins()
  .then(() => {
    console.log('\n===== ADMIN SETUP SCRIPT COMPLETED SUCCESSFULLY =====');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n===== ADMIN SETUP SCRIPT FAILED =====', error);
    process.exit(1);
  });