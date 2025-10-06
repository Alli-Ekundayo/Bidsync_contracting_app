// Configuration constants for easy management
// Note: Environment variables are managed through Supabase
// Public keys can be stored here, private secrets should use Supabase secrets

// Supabase Configuration (Public keys - safe to store in code)
export const SUPABASE_CONFIG = {
  url: (import.meta.env.VITE_SUPABASE_URL as string) || "https://wpagznqpsehdilvouujv.supabase.co",
  publishableKey: (import.meta.env.VITE_SUPABASE_KEY as string) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYWd6bnFwc2VoZGlsdm91dWp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjQ5MjMzNCwiZXhwIjoyMDYyMDY4MzM0fQ.RjncFAnWFxaLr9vmmuG_E0biwu_Ap2utoTEXVlM0Dj4"
};

// Webhook URLs (Update these as needed)
export const WEBHOOK_URLS = {
  // Prefer Vite env vars so deployments can override without touching source
  aiConsultant: (import.meta.env.VITE_WEBHOOK_AI_CONSULTANT as string) || "https://n8n.srv940308.hstgr.cloud/webhook/ai-consultant",
  createProposal: (import.meta.env.VITE_WEBHOOK_CREATE_PROPOSAL as string) || "https://n8n.srv940308.hstgr.cloud/webhook/create-proposal",
};

// API Endpoints
export const API_ENDPOINTS = {
  // Add other API endpoints here as needed
};