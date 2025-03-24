
import { corsHeaders } from "./cors.ts";

// Standardized error response format
export interface ErrorResponse {
  error: string;
  details?: string;
  code?: string;
}

// Create a standardized error response
export const createErrorResponse = (
  message: string, 
  details?: string, 
  status = 500,
  code?: string
): Response => {
  console.error(`Error: ${message}`, details ? `Details: ${details}` : "");
  
  const errorResponse: ErrorResponse = { 
    error: message,
    ...(details && { details }),
    ...(code && { code })
  };
  
  return new Response(
    JSON.stringify(errorResponse),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
};
