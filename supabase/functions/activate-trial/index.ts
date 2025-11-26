import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for elevated permissions
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get user from request authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[activate-trial] Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error('[activate-trial] Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[activate-trial] Activating trial for user: ${user.id}`);

    // Check if user already has an active trial or subscription
    const { data: currentProfile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('is_pro, subscription_status, trial_start_date')
      .eq('id', user.id)
      .single();

    if (fetchError) {
      console.error('[activate-trial] Error fetching profile:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if trial was already activated
    if (currentProfile.trial_start_date) {
      console.log('[activate-trial] Trial already activated');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Trial already activated',
          alreadyActivated: true 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Activate trial by updating profile with service role
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        trial_start_date: new Date().toISOString(),
        is_pro: true,
        subscription_status: 'trialing',
        subscription_tier: 'free',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('[activate-trial] Error updating profile:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to activate trial' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[activate-trial] Trial activated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Trial activated successfully',
        trialStartDate: new Date().toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[activate-trial] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
