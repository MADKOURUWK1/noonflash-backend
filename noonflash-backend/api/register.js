import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ success: false, message: 'Server configuration error: Missing Supabase credentials.' });
  }
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  try {
    // First, check if the user already exists
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('license_type, trial_ends_at')
      .eq('email', email)
      .single();

    if (existingUserError && existingUserError.code !== 'PGRST116') { // PGRST116 means "no rows found"
      throw existingUserError;
    }

    if (existingUser) {
      // User already exists, return their current license status and trial end date
      return res.status(200).json({ 
        success: true, 
        message: 'Email already registered.', 
        license: existingUser.license_type, // Changed from 'status' to 'license' for consistency
        trial_ends_at: existingUser.trial_ends_at 
      });
    }

    // If user does not exist, register them as a new trial user
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 3); // 3 days from now
    const trialEndsAtISO = trialEndsAt.toISOString(); // Format for Supabase timestamp

    const { data: newUser, error: newUserError } = await supabase
      .from('users')
      .insert([
        { 
          email: email, 
          license_type: 'trial',
          trial_ends_at: trialEndsAtISO // Store the trial end date
        }
      ])
      .select('license_type, trial_ends_at') // Select what we want to return
      .single();

    if (newUserError) {
      throw newUserError;
    }

    return res.status(200).json({ 
      success: true, 
      message: 'New user registered.', 
      license: newUser.license_type, // Consistent naming
      trial_ends_at: newUser.trial_ends_at 
    });

  } catch (error) {
    console.error("Registration API error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
