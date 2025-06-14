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
    // Get environment variables (these are pre-populated in Supabase environments)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables:', { supabaseUrl: !!supabaseUrl, supabaseServiceKey: !!supabaseServiceKey });
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create a client with the anon key for user authentication verification
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });
    
    // Verify the user is authenticated - don't pass token parameter, use the Authorization header
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Check if user has admin role
    const appMetadata = user.app_metadata as { role?: string } || {};
    if (appMetadata.role !== 'admin') {
      console.error('User is not admin:', { userId: user.id, role: appMetadata.role });
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin role required' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create admin client for privileged operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users using the admin client
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error listing users:', usersError);
      throw usersError;
    }

    // For each user, get their orders to calculate order count and total spent
    const usersWithOrderData = await Promise.all(
      users.users.map(async (user) => {
        // Get order count and total spent using admin client
        const { data: orders, error: ordersError } = await supabaseAdmin
          .from('orders')
          .select('total')
          .eq('user_id', user.id);
        
        if (ordersError) {
          console.error('Error fetching orders for user:', user.id, ordersError);
          return {
            ...user,
            order_count: 0,
            total_spent: 0
          };
        }
        
        const orderCount = orders?.length || 0;
        const totalSpent = orders?.reduce((sum, order) => sum + parseFloat(order.total || '0'), 0) || 0;
        
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
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});