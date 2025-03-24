
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabaseClient = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Running cleanup for expired demo accounts");
    
    // Get the current time
    const now = new Date().toISOString();
    
    // Find expired demo accounts
    const { data: expiredAccounts, error: fetchError } = await supabaseClient
      .from('user_metadata')
      .select('id')
      .eq('account_type', 'demo')
      .lt('account_expires_at', now);
      
    if (fetchError) {
      throw fetchError;
    }
    
    console.log(`Found ${expiredAccounts?.length || 0} expired demo accounts`);
    
    if (!expiredAccounts || expiredAccounts.length === 0) {
      return new Response(
        JSON.stringify({ message: "No expired accounts to delete" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Extract the user IDs
    const expiredUserIds = expiredAccounts.map(account => account.id);
    
    // Delete the user accounts
    // Note: This will cascade delete the user_metadata records due to foreign key constraints
    for (const userId of expiredUserIds) {
      console.log(`Deleting expired user account: ${userId}`);
      
      const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(userId);
      
      if (deleteError) {
        console.error(`Error deleting user ${userId}:`, deleteError);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        message: `Successfully deleted ${expiredUserIds.length} expired demo accounts`,
        deletedAccounts: expiredUserIds
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in cleanup-expired-accounts function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
