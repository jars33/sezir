
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  updated_at?: string;
};

export const profileService = {
  /**
   * Get user profile
   */
  async getProfile(): Promise<Profile | null> {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session.session) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.session.user.id)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return data;
  },

  /**
   * Update user profile
   */
  async updateProfile(profile: Partial<Profile>): Promise<Profile | null> {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session.session) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', session.session.user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
    
    return data;
  }
};
