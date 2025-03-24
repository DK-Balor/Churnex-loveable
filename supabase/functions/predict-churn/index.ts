
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

    // For a real app, we would fetch customer data from the database
    // and pass it to an ML model or OpenAI for prediction
    // For now, we'll use mock data and enhance it with AI analysis

    // Get mock customer data
    const customers = [
      {
        id: '1',
        name: 'Globex Industries',
        email: 'accounts@globex.com',
        plan: 'Scale',
        activityData: {
          logins: { last30Days: 12, previous30Days: 25 },
          featureUsage: { last30Days: 35, previous30Days: 78 },
          supportRequests: { last30Days: 3, previous30Days: 1 }
        },
        monthlyValue: 119,
      },
      {
        id: '2',
        name: 'Oscorp',
        email: 'norman@oscorp.com',
        plan: 'Scale',
        activityData: {
          logins: { last30Days: 8, previous30Days: 15 },
          featureUsage: { last30Days: 22, previous30Days: 45 },
          supportRequests: { last30Days: 1, previous30Days: 0 }
        },
        monthlyValue: 119,
      },
      {
        id: '3',
        name: 'Dunder Mifflin',
        email: 'michael@dundermifflin.com',
        plan: 'Growth',
        activityData: {
          logins: { last30Days: 4, previous30Days: 10 },
          featureUsage: { last30Days: 12, previous30Days: 30 },
          supportRequests: { last30Days: 2, previous30Days: 0 }
        },
        monthlyValue: 59,
      }
    ];
    
    // Use OpenAI to analyze and enhance the churn prediction
    const customersWithAIPredictions = await Promise.all(customers.map(async (customer) => {
      try {
        // Create a context with customer activity data for AI analysis
        const context = `
          Customer: ${customer.name}
          Plan: ${customer.plan} ($${customer.monthlyValue}/month)
          Activity data:
          - Logins last 30 days: ${customer.activityData.logins.last30Days} (previous 30 days: ${customer.activityData.logins.previous30Days})
          - Feature usage last 30 days: ${customer.activityData.featureUsage.last30Days} (previous 30 days: ${customer.activityData.featureUsage.previous30Days})
          - Support requests last 30 days: ${customer.activityData.supportRequests.last30Days} (previous 30 days: ${customer.activityData.supportRequests.previous30Days})
        `;
        
        const aiResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an expert in customer churn analysis. Your task is to analyze customer activity data and provide a churn risk percentage and list the specific risk factors that might lead to churn. Output ONLY a JSON object with keys 'churnRisk' (number between 0-100) and 'factors' (array of strings)."
            },
            {
              role: "user",
              content: context
            }
          ],
          temperature: 0.2,
          response_format: { type: "json_object" }
        });
        
        // Parse the AI response
        const aiOutput = JSON.parse(aiResponse.choices[0].message.content);
        
        return {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          plan: customer.plan,
          churnRisk: aiOutput.churnRisk,
          monthlyValue: customer.monthlyValue,
          factors: aiOutput.factors
        };
      } catch (error) {
        console.error(`Error analyzing customer ${customer.name}:`, error);
        
        // Fallback if AI analysis fails
        return {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          plan: customer.plan,
          churnRisk: Math.floor(Math.random() * 40) + 60, // Fallback random risk between 60-99
          monthlyValue: customer.monthlyValue,
          factors: ['Decreasing usage trend detected']
        };
      }
    }));
    
    // Sort by churn risk (highest first)
    customersWithAIPredictions.sort((a, b) => b.churnRisk - a.churnRisk);

    return new Response(
      JSON.stringify({
        data: customersWithAIPredictions
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
