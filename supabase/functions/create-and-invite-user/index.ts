
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.1.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    // Get the request body
    const { email, firstName } = await req.json()
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // Create a Supabase client with the Admin key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    let userCreated = false
    let invitationSent = false
    
    // Check if user already exists
    const { data: userData, error: findError } = await supabaseAdmin.auth.admin.listUsers({
      filter: { email }
    })
    
    if (findError) {
      console.error('Error finding user:', findError)
      throw findError
    }
    
    // If user doesn't exist, create them
    if (!userData || !userData.users || userData.users.length === 0) {
      console.log('Creating new user account for:', email)
      const tempPassword = generateRandomPassword()
      
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
      })
      
      if (createError) {
        console.error('Error creating user:', createError)
        throw createError
      }
      
      userCreated = true
      console.log('User created successfully')
    } else {
      console.log('User already exists:', email)
    }
    
    // Send invitation email
    try {
      // Call send-invitation edge function
      const response = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-invitation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify({
            email,
            firstName: firstName || 'User',
          })
        }
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send invitation')
      }
      
      invitationSent = true
      console.log('Invitation sent successfully')
    } catch (inviteError) {
      console.error('Error sending invitation:', inviteError)
      // We don't rethrow to avoid blocking the entire function
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        userCreated,
        invitationSent
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred', 
        details: error instanceof Error ? error.message : String(error) 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Helper function to generate a random password
function generateRandomPassword() {
  const length = 12
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    password += charset[randomIndex]
  }
  return password
}
