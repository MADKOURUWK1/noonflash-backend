import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ message: 'Server configuration error: Missing Supabase credentials.' });
  }
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });

  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  try {
    const { data, error } = await supabase
      .from('users')
      .select('license_type, trial_ends_at') // Include trial_ends_at
      .eq('email', email)
      .single();

    if (error || !data) {
      return res.status(404).json({ license: 'not_found' });
    }
    return res.status(200).json({ 
      license: data.license_type, 
      trial_ends_at: data.trial_ends_at // Return the trial end date
    });
  } catch (error) {
    console.error("Status API error:", error);
    return res.status(500).json({ message: error.message });
  }
}
