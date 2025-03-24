
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

    // Get the request body (customer data)
    const { customerId, customerData } = await req.json();

    if (!customerId) {
      throw new Error("Customer ID is required");
    }

    console.log(`Generating win-back suggestions for customer ${customerId}`);

    // In a real implementation, this would use an AI model to generate personalized suggestions
    // For demo purposes, we'll return predefined suggestions based on risk factors
    
    // Get the customer's risk factors
    const riskFactors = customerData?.riskFactors || [];
    
    // Sample suggestion templates
    const commonSuggestions = [
      "Offer a one-month billing credit as a gesture of goodwill.",
      "Schedule a personal account review call to discuss their needs.",
      "Send an email highlighting new features that address their specific use case.",
      "Provide a case study showing how similar companies are succeeding with your product."
    ];
    
    const specificSuggestions = {
      "payment": [
        "Offer a flexible payment plan to accommodate their budget constraints.",
        "Temporarily downgrade their plan while maintaining key features they use most.",
        "Provide a 15% discount for an annual commitment to stabilize their costs."
      ],
      "usage": [
        "Schedule a personalized training session to help them maximize product value.",
        "Create a custom onboarding flow for their new team members.",
        "Share relevant templates and automations that can help them achieve their goals faster."
      ],
      "competitor": [
        "Conduct a side-by-side feature comparison emphasizing your unique advantages.",
        "Offer an exclusive feature or integration that differentiates your product.",
        "Create a personalized ROI analysis showing the value gained by staying with your solution."
      ],
      "support": [
        "Assign a dedicated customer success manager for the next 90 days.",
        "Upgrade their support package at no additional cost for 3 months.",
        "Schedule a technical deep dive to resolve any outstanding issues."
      ]
    };
    
    // Generate personalized suggestions based on risk factors
    let generatedSuggestions = [...commonSuggestions];
    
    // Add specific suggestions based on identified risk factors
    riskFactors.forEach(factor => {
      const factorLower = factor.toLowerCase();
      
      if (factorLower.includes("payment") || factorLower.includes("price") || factorLower.includes("cost") || factorLower.includes("budget")) {
        generatedSuggestions.push(...specificSuggestions.payment);
      } else if (factorLower.includes("usage") || factorLower.includes("active") || factorLower.includes("feature")) {
        generatedSuggestions.push(...specificSuggestions.usage);
      } else if (factorLower.includes("competitor")) {
        generatedSuggestions.push(...specificSuggestions.competitor);
      } else if (factorLower.includes("support") || factorLower.includes("ticket")) {
        generatedSuggestions.push(...specificSuggestions.support);
      }
    });
    
    // Remove duplicates and select up to 5 suggestions
    const uniqueSuggestions = [...new Set(generatedSuggestions)];
    const finalSuggestions = uniqueSuggestions.slice(0, 5);

    return new Response(
      JSON.stringify({
        data: {
          suggestions: finalSuggestions,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-winback function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
