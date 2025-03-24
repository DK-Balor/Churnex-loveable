
// This Supabase Edge Function would handle generating AI-powered win-back campaigns
// In a production environment, this would connect to OpenAI API
// but for now we'll mock the response

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the session of the user that called the function
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    if (!session) {
      return new Response(
        JSON.stringify({
          error: "Not authenticated",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the request payload
    const { customerSegment, campaignType } = await req.json();

    // In a real implementation, we would:
    // 1. Analyze customer data
    // 2. Use AI to generate personalized campaign suggestions
    // 3. Return the campaign templates
    
    // For now, let's return mock data
    const mockCampaigns = {
      segment: customerSegment || "at-risk",
      campaignType: campaignType || "win-back",
      suggestions: [
        {
          name: "Limited-Time Discount",
          subject: "We miss you! Special offer inside",
          message: `Dear {{customer_name}},

We've noticed you haven't been using our service recently, and we wanted to reach out. We value your business and would love to have you back.

To make it easier for you to return, we're offering a special 30% discount on your next 3 months of subscription if you reactivate within the next 7 days.

Simply click the button below to claim this offer.

Best regards,
The Churnex Team`,
          incentive: {
            type: "discount",
            value: 30,
            duration: 3
          },
          predictedSuccessRate: 68
        },
        {
          name: "Feature Highlight",
          subject: "Have you tried these new features?",
          message: `Dear {{customer_name}},

We've added several new features since you last used our platform that we think you'll love:

1. AI-powered analytics dashboard
2. Automated customer segmentation
3. One-click recovery campaigns

We'd love to show you how these can help your business. Would you be interested in a quick 15-minute demo call?

Best regards,
The Churnex Team`,
          incentive: {
            type: "demo",
            value: null,
            duration: null
          },
          predictedSuccessRate: 42
        },
        {
          name: "Feedback Request",
          subject: "We value your input",
          message: `Dear {{customer_name}},

We noticed you decided not to continue with your subscription, and we'd really appreciate your feedback on how we could have served you better.

If you take our quick 2-minute survey, we'll give you a $50 credit that you can apply if you decide to return in the future.

Your insights will help us improve our service for all customers.

Best regards,
The Churnex Team`,
          incentive: {
            type: "credit",
            value: 50,
            duration: null
          },
          predictedSuccessRate: 35
        }
      ]
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: mockCampaigns,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-campaign function:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
