
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { OpenAI } from "https://esm.sh/openai@4.0.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const openaiApiKey = Deno.env.get("OPENAI_API_KEY") || "";

const openai = new OpenAI({
  apiKey: openaiApiKey,
});

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

    // Get the request body
    const { customerId, customerData } = await req.json();
    
    if (!customerId || !customerData) {
      throw new Error("Missing required fields");
    }

    // Use OpenAI to generate personalized win-back campaign suggestions
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert in customer retention and win-back strategies. Generate personalized win-back campaign suggestions for a customer at risk of churning. The output should be a JSON array of 3 campaign ideas, each with keys 'title', 'message', 'incentive' (object with 'type', 'value', and 'unit' keys), and 'predictedSuccessRate' (number between 1-100)."
        },
        {
          role: "user",
          content: `Customer: ${customerData.name}
            Plan: ${customerData.plan}
            Monthly value: $${customerData.monthlyValue}
            Churn risk: ${customerData.churnRisk}%
            Risk factors: ${customerData.factors.join(", ")}`
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    // Parse the AI response
    const aiSuggestions = JSON.parse(aiResponse.choices[0].message.content);

    return new Response(
      JSON.stringify({
        data: {
          suggestions: aiSuggestions.campaigns || aiSuggestions
        }
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
