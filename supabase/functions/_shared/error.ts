
import { corsHeaders } from "./cors.ts";

// Helper to create error responses with consistent structure
export const createErrorResponse = (message: string, details: any = null, status = 500) => {
  return new Response(
    JSON.stringify({
      error: message,
      details: details,
      success: false,
      timestamp: new Date().toISOString()
    }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
};
