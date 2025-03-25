
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
    // Create a Supabase client
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

    // Get the customer ID from the request
    const { customerId, riskFactors } = await req.json();

    if (!customerId) {
      throw new Error("Customer ID is required");
    }

    console.log(`Generating personalized win-back campaign for customer ${customerId}`);
    
    // Personalized campaign templates based on risk factors
    const templates = {
      payment: [
        {
          subject: "We'd like to help with your subscription",
          message: "We noticed you may be experiencing some payment issues. We'd like to offer you a flexible payment plan to help you maintain your subscription.",
          incentive: "15% discount for 3 months",
          successRate: 68
        },
        {
          subject: "Special offer just for you",
          message: "We value your business and would like to offer you a special discount to help with any budget constraints you might be experiencing.",
          incentive: "One month free",
          successRate: 72
        }
      ],
      usage: [
        {
          subject: "Getting the most from your subscription",
          message: "We noticed you haven't been using some of our key features lately. We'd love to schedule a personalized demo to show you how to get more value from your subscription.",
          incentive: "Free consultation with our success team",
          successRate: 64
        },
        {
          subject: "New features you might have missed",
          message: "We've recently added several exciting features that align with your business needs. Would you like to schedule a quick call to walk through them?",
          incentive: "Priority access to beta features",
          successRate: 58
        }
      ],
      competitor: [
        {
          subject: "Why our customers choose us",
          message: "We'd like to share how our solution provides unique value compared to alternatives in the market, especially for businesses like yours.",
          incentive: "Competitive feature analysis + 10% discount",
          successRate: 52
        },
        {
          subject: "We appreciate your feedback",
          message: "We're continuously improving our product based on customer feedback. We'd love to hear your thoughts on how we can better meet your needs compared to other solutions you may be considering.",
          incentive: "Amazon gift card for completing our feedback survey",
          successRate: 48
        }
      ],
      general: [
        {
          subject: "We miss you!",
          message: "We noticed you haven't been as active lately. We'd love to hear how we can better meet your needs and keep you as a valued customer.",
          incentive: "20% discount for 6 months",
          successRate: 75
        },
        {
          subject: "A special offer to win you back",
          message: "We value your business and would like to offer you a special discount to thank you for being our customer.",
          incentive: "2 months free with annual commitment",
          successRate: 65
        }
      ]
    };
    
    // Select templates based on risk factors
    let suggestedCampaigns = [];
    
    if (riskFactors) {
      const riskFactorsLower = riskFactors.map(factor => factor.toLowerCase());
      
      if (riskFactorsLower.some(factor => factor.includes("payment") || factor.includes("price") || factor.includes("cost"))) {
        suggestedCampaigns = [...suggestedCampaigns, ...templates.payment];
      }
      
      if (riskFactorsLower.some(factor => factor.includes("usage") || factor.includes("feature"))) {
        suggestedCampaigns = [...suggestedCampaigns, ...templates.usage];
      }
      
      if (riskFactorsLower.some(factor => factor.includes("competitor"))) {
        suggestedCampaigns = [...suggestedCampaigns, ...templates.competitor];
      }
    }
    
    // Always include general campaigns
    suggestedCampaigns = [...suggestedCampaigns, ...templates.general];
    
    // Sort by success rate and take top 3
    suggestedCampaigns.sort((a, b) => b.successRate - a.successRate);
    const topCampaigns = suggestedCampaigns.slice(0, 3);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          campaigns: topCampaigns,
          customerId: customerId
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-win-back function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
