import { createClient } from '@supabase/supabase-js';

// Defensive check
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error('CRITICAL: SUPABASE_URL or SUPABASE_KEY environment variables are not set!');
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('license_type')
      .eq('email', email)
      .single();

    if (error || !data) {
      // If the user doesn't exist, this is a 404
      return res.status(404).json({ license: 'not_found' });
    }

    // User exists, return their license type
    return res.status(200).json({ license: data.license_type });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
