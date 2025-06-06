import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Get the authorization header from the request
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'No authorization header provided' }),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify the user is authenticated and has admin role
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Check if user has admin role
    const appMetadata = user.app_metadata as { role?: string } || {};
    if (appMetadata.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin role required' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get all users
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      throw usersError;
    }

    // For each user, get their orders to calculate order count and total spent
    const usersWithOrderData = await Promise.all(
      users.users.map(async (user) => {
        // Get order count and total spent
        const { data: orders, error: ordersError } = await supabaseAdmin
          .from('orders')
          .select('total')
          .eq('user_id', user.id);
        
        if (ordersError) {
          console.error('Error fetching orders for user:', ordersError);
          return {
            ...user,
            order_count: 0,
            total_spent: 0
          };
        }
        
        const orderCount = orders?.length || 0;
        const totalSpent = orders?.reduce((sum, order) => sum + parseFloat(order.total), 0) || 0;
        
        return {
          ...user,
          order_count: orderCount,
          total_spent: totalSpent
        };
      })
    );

    return new Response(
      JSON.stringify(usersWithOrderData),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});