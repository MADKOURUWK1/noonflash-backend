export default function handler(req, res) {
  // Set CORS headers so the browser allows the request
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Check if the environment variables exist on the server
  const urlExists = !!process.env.SUPABASE_URL;
  const keyExists = !!process.env.SUPABASE_KEY;

  // Report the findings back
  res.status(200).json({
    message: "Vercel Environment Variable Inspector Result",
    url_variable_found: urlExists,
    key_variable_found: keyExists,
    vercel_region: process.env.VERCEL_REGION || "Not set"
  });
}
