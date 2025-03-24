
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

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
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Get user information from the JWT token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Invalid user token");
    }

    // In a real implementation, this would query a customer table and run an AI model
    // For demo purposes, we'll return mock data
    
    // Mock data - in production this would be actual customer data with AI-generated risk scores
    const churnRiskData = [
      {
        id: "1",
        customerName: "Acme Corporation",
        email: "billing@acmecorp.com",
        riskScore: 82,
        riskFactors: [
          "Decreasing usage over last 3 months",
          "Multiple support tickets about pricing",
          "Competitor engagement detected"
        ],
        monthlyValue: 349,
        predictedChurnDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        lastActivity: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "2",
        customerName: "TechStart Inc",
        email: "finance@techstart.io",
        riskScore: 65,
        riskFactors: [
          "Payment failed twice this month",
          "Feature usage declined by 40%",
          "Recently viewed pricing page multiple times"
        ],
        monthlyValue: 119,
        predictedChurnDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "3",
        customerName: "Global Solutions Ltd",
        email: "accounts@globalsolutions.com",
        riskScore: 78,
        riskFactors: [
          "Downgraded from Pro to Basic plan",
          "Support chat mentioned budget cuts",
          "User count decreased by 30%"
        ],
        monthlyValue: 249,
        predictedChurnDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
        lastActivity: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "4",
        customerName: "Innovative Designs",
        email: "billing@innovativedesigns.co",
        riskScore: 91,
        riskFactors: [
          "Admin user requested cancellation info",
          "No active logins in last 14 days",
          "Failed payment followed by dispute"
        ],
        monthlyValue: 199,
        predictedChurnDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        lastActivity: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "5",
        customerName: "Summit Enterprises",
        email: "finance@summitent.net",
        riskScore: 52,
        riskFactors: [
          "Support complained about missing feature",
          "Reduced API usage by 25%",
          "Competitor product trial signup detected"
        ],
        monthlyValue: 179,
        predictedChurnDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Record analytics for this user
    // In a production app, this would update actual analytics in the database
    console.log(`Churn prediction requested by user ${user.id}`);

    return new Response(
      JSON.stringify({
        data: churnRiskData,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in predict-churn function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
