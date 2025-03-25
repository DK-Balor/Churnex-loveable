
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    const appUrl = Deno.env.get("APP_URL") || "https://app.churnex.com";
    
    if (!supabaseUrl || !supabaseServiceKey || !stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeSecretKey);
    
    // Get user email for pre-filling Stripe form
    const userEmail = await getUserEmail(supabase, userId);
    
    // Get user's business name for Stripe form
    const businessName = await getBusinessName(supabase, userId);
    
    // Create Stripe OAuth link
    const stripeConnectUrl = await stripe.oauth.authorizeUrl({
      client_id: 'ca_XXXXXXXXXXXXXXXXXXXXXXXX', // Replace with your actual Stripe Connect client ID
      response_type: 'code',
      scope: 'read_write',
      state: userId, // Pass user ID in state param to retrieve it on callback
      redirect_uri: `${appUrl}/stripe-callback`,
      stripe_user: {
        email: userEmail,
        business_name: businessName,
        country: 'GB', // Default to UK
        // Pre-fill as much information as possible for a smoother user experience
        business_type: 'company',
        product_description: 'Subscription business',
      },
    });

    return new Response(
      JSON.stringify({ url: stripeConnectUrl }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in stripe-connect function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to get user's email for pre-filling in Stripe
async function getUserEmail(supabase: any, userId: string): Promise<string | undefined> {
  try {
    // Get user's email from auth.users table
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError || !userData) {
      console.log('Error getting user email:', userError);
      return undefined;
    }
    
    return userData.user.email;
  } catch (error) {
    console.error('Error in getUserEmail:', error);
    return undefined;
  }
}

// Helper function to get user's business name
async function getBusinessName(supabase: any, userId: string): Promise<string | undefined> {
  try {
    // Get business name from user_metadata table
    const { data, error } = await supabase
      .from('user_metadata')
      .select('business_name')
      .eq('id', userId)
      .single();
    
    if (error || !data) {
      console.log('Error getting business name:', error);
      return undefined;
    }
    
    return data.business_name;
  } catch (error) {
    console.error('Error in getBusinessName:', error);
    return undefined;
  }
}
