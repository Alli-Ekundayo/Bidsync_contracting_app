// Configuration constants for easy management
// Note: Environment variables are managed through Supabase
// Public keys can be stored here, private secrets should use Supabase secrets

// Supabase Configuration (Public keys - safe to store in code)
export const SUPABASE_CONFIG = {
  url: "https://buzczrqgoobvokfbztgk.supabase.co",
  publishableKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1emN6cnFnb29idm9rZmJ6dGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MTE1OTIsImV4cCI6MjA2NDM4NzU5Mn0.663wiPn0lmelVLVbrPmjXH_8FsvbOvjkn8c8jg_4tI0"
};

// Webhook URLs (Update these as needed)
export const WEBHOOK_URLS = {
  aiConsultant: "https://eim.app.n8n.cloud/webhook-test/ai-consultant",
  createProposal: "https://eim.app.n8n.cloud/webhook-test/create-proposal"
};

// API Endpoints
export const API_ENDPOINTS = {
  // Add other API endpoints here as needed
};